import { NextRequest, NextResponse } from "next/server";
import { generateVariants } from "@/lib/variants";

const OGA_BASE = "https://opengameart.org";

interface OgaResult {
  id: string;
  title: string;
  author: string;
  url: string;
  tags: string[];
  license: string;
  duration: number;
  files: { url: string; name: string; size: string }[];
}

async function fetchOgaSearchPage(
  query: string,
  page: number = 0
): Promise<string> {
  const params = new URLSearchParams({
    keys: query,
    "field_art_type_tid[]": "13", // Sound Effect
    sort_by: "score",
    sort_order: "DESC",
    items_per_page: "24",
    page: String(page),
  });

  const url = `${OGA_BASE}/art-search-advanced?${params.toString()}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "SoundGrab/1.0 (sound downloader app)",
      Accept: "text/html",
    },
    next: { revalidate: 0 },
  });

  if (!resp.ok) return "";
  return resp.text();
}

async function fetchOgaContentPage(slug: string): Promise<string> {
  const url = `${OGA_BASE}/content/${slug}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "SoundGrab/1.0 (sound downloader app)",
      Accept: "text/html",
    },
    next: { revalidate: 0 },
  });

  if (!resp.ok) return "";
  return resp.text();
}

function parseSearchResults(html: string): { slug: string; title: string }[] {
  const results: { slug: string; title: string }[] = [];
  // Extract content links from search results
  const linkRegex = /<a\s+href="\/content\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const slug = match[1].trim();
    const title = match[2]
      .trim()
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
    // Filter out non-content links
    if (
      slug &&
      title.length > 2 &&
      !slug.includes("/") &&
      !slug.includes("?") &&
      slug !== "login" &&
      slug !== "register"
    ) {
      results.push({ slug, title });
    }
  }
  return results;
}

function parseContentPage(html: string): OgaResult | null {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch
    ? titleMatch[1].trim().replace(/&amp;/g, "&")
    : "Untitled";

  // Remove all HTML tags to get plain text for easier parsing
  const plain = html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  // Author: appears after "Author: " and before the weekday or next field
  let author = "Unknown";
  const authorM = plain.match(/Author:\s+([a-zA-Z0-9_\- ]+?)\s*(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|Art\s*Type)/);
  if (authorM) author = authorM[1].trim();

  // License: License(s): or License: followed by the license text
  let license = "Unknown";
  const licM = plain.match(/License(?:\(s\))?:\s+([A-Za-z0-9\-\. ]+?)(?:\s*(?:Collections|Favorites|Preview|Attribution|File|Log))/);
  if (licM) license = licM[1].trim();

  // Tags
  let tags: string[] = [];
  const tagsM = plain.match(/Tags:\s+([A-Za-z0-9,\-\. ]+?)(?:\s*(?:License|Collections|Favorites|Preview))/);
  if (tagsM) {
    tags = tagsM[1].split(",").map((t) => t.trim()).filter((t) => t.length > 1);
  }

  // Files: match audio downloads and preview URLs. Some OGA sound pages only expose
  // audio as previews when the downloadable asset is a ZIP.
  const files: { url: string; name: string; size: string }[] = [];
  const seenFiles = new Set<string>();
  const addAudioFile = (rawUrl: string, rawName?: string, size = "") => {
    const url = rawUrl.replace(/&amp;/g, "&");
    const name = (rawName || url.split("/").pop() || "").replace(/%20/g, " ");
    if (!/\.(wav|mp3|ogg|flac|m4a)$/i.test(name) || seenFiles.has(url)) return;
    seenFiles.add(url);
    files.push({ url: url.startsWith("/") ? `${OGA_BASE}${url}` : url, name, size });
  };

  const fileRegex = /<a\s+href="((?:https:\/\/opengameart\.org)?\/sites\/default\/files\/[^"]+)"[^>]*>/gi;
  let fm;
  while ((fm = fileRegex.exec(html)) !== null) {
    addAudioFile(fm[1]);
  }

  const previewRegex = /data-(?:mp3|ogg)-url=['"]([^'"]+)['"]/gi;
  let pm;
  while ((pm = previewRegex.exec(html)) !== null) {
    addAudioFile(pm[1]);
  }

  // Fallback: scan plain text for filenames
  if (files.length === 0) {
    const audioRx = /([A-Za-z0-9_\-]+\.(?:wav|mp3|ogg|flac|m4a))/gi;
    let am;
    while ((am = audioRx.exec(plain)) !== null) {
      addAudioFile(`${OGA_BASE}/sites/default/files/${am[1]}`, am[1]);
    }
  }

  return { id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title, author, url: "", tags, license, duration: 0, files };
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

async function getContentLengthAndFirst(fileUrl: string): Promise<{ totalSize: number; first: ArrayBuffer | null }> {
  const [totalSize, first] = await Promise.all([
    getContentLength(fileUrl),
    fetchRange(fileUrl, 0, 262143),
  ]);
  return { totalSize, first };
}

function getWavDuration(header: ArrayBuffer, totalSize: number): number {
  const view = new DataView(header);
  if (view.byteLength < 44 || view.getUint32(0) !== 0x52494646 || view.getUint32(8) !== 0x57415645) return 0;

  let byteRate = 0;
  let dataSize = 0;
  let offset = 12;
  while (offset < view.byteLength - 8) {
    const chunkId = view.getUint32(offset);
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 0x666d7420 && offset + 20 < view.byteLength) byteRate = view.getUint32(offset + 16, true);
    if (chunkId === 0x64617461) {
      dataSize = chunkSize || Math.max(0, totalSize - offset - 8);
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  return byteRate > 0 && dataSize > 0 ? dataSize / byteRate : 0;
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

function getOggDuration(first: ArrayBuffer, last: ArrayBuffer): number {
  const firstBytes = new Uint8Array(first);
  const lastView = new DataView(last);
  let sampleRate = 0;

  for (let i = 0; i < firstBytes.length - 16; i++) {
    if (firstBytes[i] === 0x4f && firstBytes[i + 1] === 0x70 && firstBytes[i + 2] === 0x75 && firstBytes[i + 3] === 0x73 && firstBytes[i + 4] === 0x48 && firstBytes[i + 5] === 0x65 && firstBytes[i + 6] === 0x61 && firstBytes[i + 7] === 0x64) {
      sampleRate = 48000;
      break;
    }
    if (firstBytes[i] === 0x76 && firstBytes[i + 1] === 0x6f && firstBytes[i + 2] === 0x72 && firstBytes[i + 3] === 0x62 && firstBytes[i + 4] === 0x69 && firstBytes[i + 5] === 0x73 && i + 10 < firstBytes.length) {
      sampleRate = new DataView(first).getUint32(i + 11, true);
      break;
    }
  }
  if (sampleRate <= 0) return 0;

  let granule = 0;
  for (let i = 0; i < lastView.byteLength - 14; i++) {
    if (lastView.getUint32(i) !== 0x4f676753) continue;
    const low = lastView.getUint32(i + 6, true);
    const high = lastView.getUint32(i + 10, true);
    const value = high * 4294967296 + low;
    if (value > granule) granule = value;
  }

  return granule > 0 ? granule / sampleRate : 0;
}

async function getAudioDuration(fileUrl: string): Promise<number> {
  const { totalSize, first } = await getContentLengthAndFirst(fileUrl);
  if (!first) return 0;

  if (/\.wav(?:$|\?)/i.test(fileUrl)) return getWavDuration(first, totalSize);

  if (/\.mp3(?:$|\?)/i.test(fileUrl)) {
    const frame = getMp3Bitrate(new Uint8Array(first));
    return frame && totalSize > frame.offset ? ((totalSize - frame.offset) * 8) / frame.bitrate : 0;
  }

  if (/\.ogg(?:$|\?)/i.test(fileUrl) && totalSize > 0) {
    const tailStart = Math.max(0, totalSize - 65536);
    const last = await fetchRange(fileUrl, tailStart, totalSize - 1);
    return last ? getOggDuration(first, last) : 0;
  }

  return 0;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  try {
    const { query, count = 4, useVariants = false, random = false } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const variants = useVariants ? generateVariants(query) : [query.trim()];
    const seen = new Set<string>();
    const results: OgaResult[] = [];
    const fetchSize = random ? Math.min(count * 3, 50) : count;
    const extraLinks = random ? 12 : 8;

    for (const variant of variants) {
      if (results.length >= fetchSize) break;

      const searchHtml = await fetchOgaSearchPage(variant);
      if (!searchHtml) continue;

      const links = parseSearchResults(searchHtml);
      const candidateLinks = links.slice(0, fetchSize + extraLinks);

      const pageResults = await Promise.allSettled(
        candidateLinks.map(async (link) => {
          if (seen.has(link.slug)) return null;
          const pageHtml = await fetchOgaContentPage(link.slug);
          if (!pageHtml) return null;
          const parsed = parseContentPage(pageHtml);
          if (!parsed || parsed.files.length === 0) return null;
          parsed.title = link.title;
          parsed.url = `${OGA_BASE}/content/${link.slug}`;
          parsed.id = link.slug;
          return parsed;
        })
      );

      for (const r of pageResults) {
        if (results.length >= fetchSize) break;
        if (r.status === "fulfilled" && r.value && !seen.has(r.value.id)) {
          seen.add(r.value.id);
          results.push(r.value);
        }
      }
    }

    await Promise.allSettled(
      results.map(async (parsed) => {
        if (parsed.files[0]) {
          parsed.duration = await getAudioDuration(parsed.files[0].url);
        }
      })
    );

    const finalResults = random ? shuffle(results).slice(0, count) : results.slice(0, count);

    return NextResponse.json({
      results: finalResults,
      searchUrl: `${OGA_BASE}/art-search-advanced?keys=${encodeURIComponent(query)}&field_art_type_tid[]=13`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
