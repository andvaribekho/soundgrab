import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const { files }: { files: { url: string; name: string }[] } = await req.json();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const zip = new JSZip();

    const results = await Promise.allSettled(
      files.map(async (file) => {
        try {
          const resp = await fetch(file.url, {
            headers: {
              "User-Agent": "SoundGrab/1.0",
            },
          });
          if (!resp.ok) return null;
          const buffer = await resp.arrayBuffer();
          return { name: file.name, data: new Uint8Array(buffer) };
        } catch {
          return null;
        }
      })
    );

    let added = 0;
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        zip.file(result.value.name, result.value.data);
        added++;
      }
    }

    if (added === 0) {
      return NextResponse.json(
        { error: "Failed to download any files" },
        { status: 500 }
      );
    }

    const zipBuffer = Buffer.from(await zip.generateAsync({ type: "arraybuffer" }));

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="soundgrab-pack.zip"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
