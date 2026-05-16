import { NextRequest, NextResponse } from "next/server";
import { generateVariants } from "@/lib/variants";

const FREESOUND_API = "https://freesound.org/apiv2";
const TOKEN = "YkI4zp2lrAZTQub9tmJXiVrjYgNLW4CCZnWfjorW";

interface SoundResult {
  id: number;
  name: string;
  previews: Record<string, string>;
  duration: number;
  license: string;
  username: string;
}

interface FreesoundSearchResponse {
  count: number;
  results: SoundResult[];
  next: string | null;
  previous: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const { term, style, count = 4 } = await req.json();

    if (!term) {
      return NextResponse.json({ error: "Term is required" }, { status: 400 });
    }

    const variants = generateVariants(term);
    const stylePart = style ? ` ${style.trim()}` : "";
    const seenIds = new Set<number>();
    const merged: SoundResult[] = [];

    for (const variant of variants) {
      if (merged.length >= count) break;

      const query = `${variant}${stylePart}`;
      const params = new URLSearchParams({
        query,
        page_size: String(Math.min(count, 150)),
        sort: "score",
        fields: "id,name,previews,duration,license,username",
      });

      const url = `${FREESOUND_API}/search/?${params.toString()}`;

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Token ${TOKEN}` },
        });

        if (response.ok) {
          const data: FreesoundSearchResponse = await response.json();
          for (const sound of data.results || []) {
            if (!seenIds.has(sound.id) && merged.length < count) {
              seenIds.add(sound.id);
              merged.push(sound);
            }
          }
        }
      } catch {
        // Skip failed variant searches, continue with next variant
      }
    }

    // If we didn't get enough results, try more relaxed searches without the style
    if (merged.length < count && stylePart) {
      for (const variant of variants) {
        if (merged.length >= count) break;
        const params = new URLSearchParams({
          query: variant,
          page_size: String(count),
          sort: "score",
          fields: "id,name,previews,duration,license,username",
        });
        const url = `${FREESOUND_API}/search/?${params.toString()}`;
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Token ${TOKEN}` },
          });
          if (response.ok) {
            const data: FreesoundSearchResponse = await response.json();
            for (const sound of data.results || []) {
              if (!seenIds.has(sound.id) && merged.length < count) {
                seenIds.add(sound.id);
                merged.push(sound);
              }
            }
          }
        } catch {
          // Skip
        }
      }
    }

    return NextResponse.json({
      count: merged.length,
      results: merged,
      variants: variants.slice(0, 8),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
