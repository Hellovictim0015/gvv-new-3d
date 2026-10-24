import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, isUsableUploadedFile } from "@/lib/upload";

// GET API - all prospectus entries, newest first (the first one is featured on the site)
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM prospectus ORDER BY id DESC');
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST API - upload a prospectus PDF (cover image optional)
export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const sessionYear = String(formData.get("session_year") || "").trim() || null;
    const description = String(formData.get("description") || "").trim() || null;
    const pdf = formData.get("pdf");
    const cover = formData.get("cover");

    if (!title || !isUsableUploadedFile(pdf)) {
      return NextResponse.json({ success: false, error: "Title and PDF file are required" }, { status: 400 });
    }

    const pdfUrl = await saveUploadedFile(pdf, "prospectus");
    const coverUrl = isUsableUploadedFile(cover) ? await saveUploadedFile(cover, "prospectus") : null;

    const [result]: any = await pool.query(
      'INSERT INTO prospectus (title, session_year, description, pdf_url, cover_image_url) VALUES (?, ?, ?, ?, ?)',
      [title, sessionYear, description, pdfUrl, coverUrl]
    );

    return NextResponse.json({ success: true, message: "Prospectus added successfully", insertId: result.insertId }, { status: 201 });
  } catch (error: any) {
    console.error("POST Prospectus Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
