import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
// Phone-shot reels run ~8–11MB; allow headroom without letting huge raw
// camera files through.
export const MAX_VIDEO_SIZE_BYTES = 60 * 1024 * 1024; // 60MB

// Extracted from the repeated inline upload logic in every content API route
// (achievements/books/calendar/curriculum/facilities/forms/gallery/site-images).
// Files are stored under <project root>/uploads/<subfolder> — outside
// `public/`, so they aren't directly exposed as static files — and served
// through the /api/uploads/[...path] route instead.
const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export async function saveUploadedFile(
  file: File,
  subfolder: string,
  maxBytes: number = MAX_FILE_SIZE_BYTES,
): Promise<string> {
  if (file.size > maxBytes) {
    throw new Error(`File is too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
  const filename = `${uniqueSuffix}-${safeName}`;

  const uploadDir = path.join(UPLOADS_ROOT, subfolder);
  if (!fs.existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  await writeFile(path.join(uploadDir, filename), buffer);

  return `/api/uploads/${subfolder}/${filename}`;
}

export async function deleteUploadedFile(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl || !publicUrl.startsWith("/api/uploads/")) return;
  const relativePath = publicUrl.replace("/api/uploads/", "");
  const filePath = path.join(UPLOADS_ROOT, relativePath);
  if (fs.existsSync(filePath)) {
    await unlink(filePath);
  }
}

export function isUsableUploadedFile(file: FormDataEntryValue | null): file is File {
  return file instanceof File && file.size > 0;
}
