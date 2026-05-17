import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  try {
    const range = req.headers.get("range");
    const upstreamHeaders: Record<string, string> = {
      "User-Agent": "SoundGrab/1.0",
      Accept: "audio/*",
    };
    if (range) upstreamHeaders["Range"] = range;

    const resp = await fetch(url, { headers: upstreamHeaders });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Upstream error ${resp.status}` },
        { status: 502 }
      );
    }

    const status = resp.status;
    const contentType =
      resp.headers.get("content-type") || "application/octet-stream";
    const contentRange = resp.headers.get("content-range");
    const buffer = await resp.arrayBuffer();

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
    };
    if (status === 206 && contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }

    return new NextResponse(buffer, {
      status: status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
