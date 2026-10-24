import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import path from "path";

// Serves files saved by src/lib/upload.ts from <project root>/uploads/,
// which sits outside `public/` and so isn't reachable by Next's static file
// server on its own — this route is the only way those files are exposed.
const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments?.length || segments.some((s) => s.includes("..") || s.includes("\\"))) {
    return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(UPLOADS_ROOT, ...segments);

  // Defense in depth: the resolved path must still live under UPLOADS_ROOT.
  if (!filePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const headers = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
    };

    // Videos (uniform reels) are fetched with Range requests: browsers stream
    // and seek that way, and iOS Safari refuses to play video without a 206.
    const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
    if (range && (range[1] || range[2])) {
      const size = fileStat.size;
      let start = range[1] ? Number(range[1]) : size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : size - 1;
      start = Math.max(0, start);
      end = Math.min(end, size - 1);
      if (start > end) {
        return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      }
      const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
      return new NextResponse(stream, {
        status: 206,
        headers: {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }

    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), { status: 200, headers });
  } catch {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }
}
