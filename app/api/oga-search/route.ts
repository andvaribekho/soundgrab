import { NextRequest, NextResponse } from "next/server";

const OGA_BASE = "https://opengameart.org";

interface OgaResult {
  id: string;
  title: string;
  author: string;
  url: string;
  tags: string[];
  license: string;
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
  // Extract title
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch
    ? titleMatch[1].trim().replace(/&amp;/g, "&")
    : "Untitled";

  // Extract author
  const authorMatch = html.match(
    /Author:<\/[^>]*>\s*<[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i
  );
  const author = authorMatch ? authorMatch[1].trim() : "Unknown";

  // Extract tags
  const tagsMatch = html.match(/Tags:<\/[^>]*>\s*([^<]+)/i);
  const tags: string[] = [];
  if (tagsMatch) {
    const tagStr = tagsMatch[1].trim();
    for (const t of tagStr.split(",")) {
      const cleaned = t.trim();
      if (cleaned && cleaned.length > 1) tags.push(cleaned);
    }
  }

  // Extract license
  const licenseMatch = html.match(/License[^:]*:<\/[^>]*>\s*([^<]+)/i);
  const license = licenseMatch ? licenseMatch[1].trim() : "Unknown";

  // Extract file links
  const files: { url: string; name: string; size: string }[] = [];
  const fileRegex =
    /<a\s+href="(\/sites\/default\/files\/[^"]+)"[^>]*>([^<]+\([^)]*(?:wav|mp3|ogg|flac|m4a|WAV|MP3|OGG|FLAC|M4A)[^)]*\))/gi;
  let fm;
  while ((fm = fileRegex.exec(html)) !== null) {
    files.push({
      url: `${OGA_BASE}${fm[1]}`,
      name: fm[2].replace(/<[^>]+>/g, "").trim(),
      size: "",
    });
  }

  // Fallback: look for .wav/.mp3/.ogg/.flac files in the page text
  if (files.length === 0) {
    const audioRegex =
      /([\w\-]+\.(?:wav|mp3|ogg|flac|m4a))(?:\s+(\d+(?:\.\d+)?\s*(?:Kb|Mb|bytes)))?/gi;
    let am;
    while ((am = audioRegex.exec(html)) !== null) {
      // Avoid matching in HTML tags/attributes
      const before = html.substring(Math.max(0, am.index - 30), am.index);
      if (before.includes("<") && !before.includes(">")) continue; // Inside a tag
      files.push({
        url: `${OGA_BASE}/sites/default/files/${am[1]}`,
        name: am[1],
        size: am[2] || "",
      });
    }
  }

  return { id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title, author, url: `${OGA_BASE}/content/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, tags, license, files };
}

export async function POST(req: NextRequest) {
  try {
    const { query, count = 4 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Search OGA
    const searchHtml = await fetchOgaSearchPage(query);
    if (!searchHtml) {
      return NextResponse.json({ results: [], searchUrl: "" });
    }

    const links = parseSearchResults(searchHtml);
    const results: OgaResult[] = [];

    for (const link of links) {
      if (results.length >= count) break;

      try {
        const pageHtml = await fetchOgaContentPage(link.slug);
        if (pageHtml) {
          const parsed = parseContentPage(pageHtml);
          if (parsed && parsed.files.length > 0) {
            // Override title/URL with what we found from search
            parsed.title = link.title;
            parsed.url = `${OGA_BASE}/content/${link.slug}`;
            parsed.id = link.slug;
            results.push(parsed);
          }
        }
      } catch {
        // Skip individual page errors
      }
    }

    return NextResponse.json({
      results,
      searchUrl: `${OGA_BASE}/art-search-advanced?keys=${encodeURIComponent(query)}&field_art_type_tid[]=13`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
