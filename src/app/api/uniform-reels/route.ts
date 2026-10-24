import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, isUsableUploadedFile, MAX_VIDEO_SIZE_BYTES } from "@/lib/upload";

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM uniform_reels ORDER BY sort_order ASC, id ASC');
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const sortOrder = Number(formData.get("sort_order")) || 0;
    const file = formData.get("video");

    if (typeof title !== "string" || !title || !isUsableUploadedFile(file)) {
      return NextResponse.json({ success: false, error: "Title and Video are required" }, { status: 400 });
    }
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ success: false, error: "Please upload a video file (MP4/WebM)" }, { status: 400 });
    }

    const videoUrl = await saveUploadedFile(file, "uniform-reels", MAX_VIDEO_SIZE_BYTES);

    const [result]: any = await pool.query(
      'INSERT INTO uniform_reels (title, video_url, sort_order) VALUES (?, ?, ?)',
      [title, videoUrl, sortOrder]
    );

    return NextResponse.json({ success: true, message: "Reel added successfully", insertId: result.insertId }, { status: 201 });

  } catch (error: any) {
    console.error("POST Uniform Reel Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
