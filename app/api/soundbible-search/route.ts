import { NextRequest, NextResponse } from "next/server";
import { generateVariants } from "@/lib/variants";

const SOUNDBIBLE_BASE = "https://soundbible.com";

interface SoundBibleResult {
  id: string;
  title: string;
  author: string;
  url: string;
  audioUrl: string;
  filename: string;
  description: string;
  license: string;
  duration: number;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " "));
}

function normalizeLicense(license: string): string {
  const l = license.trim().toLowerCase();
  if (!l) return "Unknown";
  if (l.includes("attribution")) return "CC-BY 3.0";
  if (l.includes("public domain")) return "Public Domain";
  if (l.includes("personal")) return "Personal Use Only";
  return license.trim();
}

async function fetchSoundBibleSearch(query: string): Promise<string> {
  const params = new URLSearchParams({ q: query });
  const resp = await fetch(`${SOUNDBIBLE_BASE}/search.php?${params.toString()}`, {
    headers: {
      "User-Agent": "SoundGrab/1.0 (sound downloader app)",
      Accept: "text/html",
    },
    next: { revalidate: 0 },
  });

  if (!resp.ok) return "";
  return resp.text();
}

function parseResults(html: string, count: number): SoundBibleResult[] {
  const results: SoundBibleResult[] = [];
  const blocks = html.split("<!-- Start Sound Item-->").slice(1);

  for (const block of blocks) {
    if (results.length >= count) break;

    const sourceMatch = block.match(/data-source=["']([^"']+\.mp3)["']/i);
    const linkMatch = block.match(/<h3>\s*<a\s+href=['"]([^'"]+)['"]>([\s\S]*?)<\/a>\s*<\/h3>/i);
    if (!sourceMatch || !linkMatch) continue;

    const licenseMatch = block.match(/<h4>([\s\S]*?)<\/h4>/i);
    const descMatch = block.match(/<p>([\s\S]*?)<\/p>/i);
    const authorMatch = block.match(/<div class="trainer-profile[\s\S]*?<span>([\s\S]*?)<\/span>/i);
    const idMatch = linkMatch[1].match(/^(\d+)-/);
    const audioUrl = new URL(decodeHtml(sourceMatch[1]), SOUNDBIBLE_BASE).toString();
    const filename = decodeURIComponent(audioUrl.split("/").pop() || `${idMatch?.[1] || "soundbible"}.mp3`);

    results.push({
      id: idMatch?.[1] || linkMatch[1],
      title: stripTags(linkMatch[2]),
      author: authorMatch ? stripTags(authorMatch[1]) : "Unknown",
      url: new URL(linkMatch[1], SOUNDBIBLE_BASE).toString(),
      audioUrl,
      filename,
      description: descMatch ? stripTags(descMatch[1]) : "",
      license: normalizeLicense(licenseMatch ? stripTags(licenseMatch[1]) : "Unknown"),
      duration: 0,
    });
  }

  return results;
}

async function fetchRange(fileUrl: string, start: number, end: number): Promise<ArrayBuffer | null> {
  try {
    const resp = await fetch(fileUrl, {
      headers: {
        Range: `bytes=${start}-${end}`,
        "User-Agent": "SoundGrab/1.0",
      },
    });
    if (!resp.ok) return null;
    return resp.arrayBuffer();
  } catch {
    return null;
  }
}

async function getContentLength(fileUrl: string): Promise<number> {
  try {
    const resp = await fetch(fileUrl, {
      method: "HEAD",
      headers: { "User-Agent": "SoundGrab/1.0" },
    });
    const contentLength = resp.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : 0;
  } catch {
    return 0;
  }
}

function skipId3(data: Uint8Array): number {
  if (data.length < 10 || data[0] !== 0x49 || data[1] !== 0x44 || data[2] !== 0x33) return 0;
  const size = ((data[6] & 0x7f) << 21) | ((data[7] & 0x7f) << 14) | ((data[8] & 0x7f) << 7) | (data[9] & 0x7f);
  return 10 + size + ((data[5] & 0x10) ? 10 : 0);
}

function getMp3Bitrate(data: Uint8Array): { bitrate: number; offset: number } | null {
  const v1l3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const v2l3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  const start = skipId3(data);

  for (let i = start; i < data.length - 4; i++) {
    if (data[i] !== 0xff || (data[i + 1] & 0xe0) !== 0xe0) continue;
    const version = (data[i + 1] >> 3) & 0x03;
    const layer = (data[i + 1] >> 1) & 0x03;
    const bitrateIndex = (data[i + 2] >> 4) & 0x0f;
    const sampleRateIndex = (data[i + 2] >> 2) & 0x03;
    if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) continue;
    return { bitrate: (version === 3 ? v1l3 : v2l3)[bitrateIndex] * 1000, offset: start };
  }

  return null;
}

async function getMp3Duration(fileUrl: string): Promise<number> {
  const [totalSize, first] = await Promise.all([
    getContentLength(fileUrl),
    fetchRange(fileUrl, 0, 32767),
  ]);
  if (!first || totalSize <= 0) return 0;

  const frame = getMp3Bitrate(new Uint8Array(first));
  return frame && totalSize > frame.offset ? ((totalSize - frame.offset) * 8) / frame.bitrate : 0;
}

export async function POST(req: NextRequest) {
  try {
    const { query, count = 4, useVariants = false } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const variants = useVariants ? generateVariants(query) : [query.trim()];
    const seen = new Set<string>();
    const results: SoundBibleResult[] = [];

    for (const variant of variants) {
      if (results.length >= count) break;

      const html = await fetchSoundBibleSearch(variant);
      if (!html) continue;

      const parsed = parseResults(html, count - results.length);
      for (const r of parsed) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          results.push(r);
        }
      }
    }

    await Promise.allSettled(
      results.map(async (result) => {
        result.duration = await getMp3Duration(result.audioUrl);
      })
    );

    return NextResponse.json({
      results: results.slice(0, count),
      searchUrl: `${SOUNDBIBLE_BASE}/search.php?q=${encodeURIComponent(query)}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
