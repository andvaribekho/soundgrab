import { NextRequest, NextResponse } from "next/server";
import { generateVariants } from "@/lib/variants";

const ARCHIVE_ITEMS = [
  "game-audio-gdcpart-2",
  "game-audio-gdcpart-3",
  "game-audio-gdcpart-4",
  "game-audio-gdcpart-5",
  "game-audio-gdcpart-6",
  "game-audio-gdcpart-7",
];

const ARCHIVE_BASE = "https://archive.org";

interface ArchiveFile {
  name?: string;
  format?: string;
  size?: string;
  length?: string;
  title?: string;
}

interface ArchiveMetadataResponse {
  files?: ArchiveFile[];
}

interface SonnissResult {
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

interface MatchedFile {
  identifier: string;
  file: ArchiveFile;
}

function audioUrl(identifier: string, name: string): string {
  return `${ARCHIVE_BASE}/download/${identifier}/${name.split("/").map(encodeURIComponent).join("/")}`;
}

function detailsUrl(identifier: string): string {
  return `${ARCHIVE_BASE}/details/${identifier}`;
}

function titleFromName(name: string): string {
  const fileName = name.split("/").pop() || name;
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDuration(length?: string): number {
  if (!length) return 0;
  if (/^\d+(?:\.\d+)?$/.test(length)) return parseFloat(length);
  const parts = length.split(":").map((p) => parseFloat(p));
  if (parts.some((p) => Number.isNaN(p))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function matchesQuery(name: string, query: string): boolean {
  const haystack = name.toLowerCase().replace(/[_\-.,]+/g, " ");
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
  return words.length === 0 || words.some((word) => haystack.includes(word));
}

function isAudioFile(file: ArchiveFile): boolean {
  return !!file.name && /\.(mp3|wav|ogg|flac|m4a)$/i.test(file.name);
}

function preferPreviewFile(files: MatchedFile[]): MatchedFile[] {
  const byBase = new Map<string, MatchedFile>();

  for (const match of files) {
    const name = match.file.name;
    if (!name) continue;
    const base = `${match.identifier}/${name.replace(/\.[^.]+$/, "")}`;
    const current = byBase.get(base);
    if (!current || /\.mp3$/i.test(name)) {
      byBase.set(base, match);
    }
  }

  return Array.from(byBase.values()).sort((a, b) => {
    const aMp3 = a.file.name && /\.mp3$/i.test(a.file.name) ? 0 : 1;
    const bMp3 = b.file.name && /\.mp3$/i.test(b.file.name) ? 0 : 1;
    return aMp3 - bMp3;
  });
}

async function fetchMetadata(identifier: string): Promise<MatchedFile[]> {
  const resp = await fetch(`${ARCHIVE_BASE}/metadata/${identifier}`, {
    headers: {
      "User-Agent": "SoundGrab/1.0 (sound downloader app)",
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!resp.ok) return [];

  const data: ArchiveMetadataResponse = await resp.json();
  return (data.files || []).map((file) => ({ identifier, file }));
}

export async function POST(req: NextRequest) {
  try {
    const { query, count = 4, useVariants = false } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const variants = useVariants ? generateVariants(query) : [query.trim()];

    const metadataResults = await Promise.allSettled(ARCHIVE_ITEMS.map(fetchMetadata));
    const allFiles = metadataResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    );

    const seen = new Set<string>();
    const matched: MatchedFile[] = [];

    for (const variant of variants) {
      if (matched.length >= count) break;
      const variantMatches = preferPreviewFile(
        allFiles.filter(({ file }) => isAudioFile(file) && matchesQuery(file.name || "", variant))
      );
      for (const m of variantMatches) {
        const key = `${m.identifier}/${m.file.name}`;
        if (!seen.has(key)) {
          seen.add(key);
          matched.push(m);
          if (matched.length >= count) break;
        }
      }
    }

    const results: SonnissResult[] = matched.slice(0, count).map((file) => {
      const name = file.file.name || "";
      const filename = decodeURIComponent(name.split("/").pop() || "sonniss.mp3");
      const folder = name.split("/").slice(1, -1).join(" / ");

      return {
        id: `${file.identifier}/${name}`,
        title: titleFromName(name),
        author: "Sonniss",
        url: detailsUrl(file.identifier),
        audioUrl: audioUrl(file.identifier, name),
        filename,
        description: folder || `Sonniss ${file.identifier}`,
        license: "Sonniss Free Release",
        duration: parseDuration(file.file.length),
      };
    });

    return NextResponse.json({
      results,
      searchUrl: detailsUrl(ARCHIVE_ITEMS[ARCHIVE_ITEMS.length - 1]),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
