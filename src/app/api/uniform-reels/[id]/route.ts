import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, deleteUploadedFile, isUsableUploadedFile, MAX_VIDEO_SIZE_BYTES } from "@/lib/upload";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const [rows]: any = await pool.query('SELECT video_url FROM uniform_reels WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await deleteUploadedFile(rows[0].video_url);

    await pool.query('DELETE FROM uniform_reels WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get("title");
    const sortOrder = Number(formData.get("sort_order")) || 0;
    const file = formData.get("video");

    if (typeof title !== "string" || !title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT video_url FROM uniform_reels WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let videoUrl = rows[0].video_url;

    if (isUsableUploadedFile(file)) {
      if (!file.type.startsWith("video/")) {
        return NextResponse.json({ success: false, error: "Please upload a video file (MP4/WebM)" }, { status: 400 });
      }
      const newUrl = await saveUploadedFile(file, "uniform-reels", MAX_VIDEO_SIZE_BYTES);
      await deleteUploadedFile(videoUrl);
      videoUrl = newUrl;
    }

    await pool.query(
      'UPDATE uniform_reels SET title = ?, video_url = ?, sort_order = ? WHERE id = ?',
      [title, videoUrl, sortOrder, id]
    );

    return NextResponse.json({ success: true, message: "Updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
