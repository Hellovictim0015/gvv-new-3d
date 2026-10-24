import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, deleteUploadedFile, isUsableUploadedFile } from "@/lib/upload";

// DELETE API
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const [rows]: any = await pool.query('SELECT pdf_url, cover_image_url FROM prospectus WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await deleteUploadedFile(rows[0].pdf_url);
    await deleteUploadedFile(rows[0].cover_image_url);

    await pool.query('DELETE FROM prospectus WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT API - new pdf/cover files are optional; send remove_cover=1 to drop the cover
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const sessionYear = String(formData.get("session_year") || "").trim() || null;
    const description = String(formData.get("description") || "").trim() || null;
    const pdf = formData.get("pdf");
    const cover = formData.get("cover");

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT pdf_url, cover_image_url FROM prospectus WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let pdfUrl = rows[0].pdf_url;
    if (isUsableUploadedFile(pdf)) {
      await deleteUploadedFile(pdfUrl);
      pdfUrl = await saveUploadedFile(pdf, "prospectus");
    }

    let coverUrl = rows[0].cover_image_url;
    if (isUsableUploadedFile(cover)) {
      await deleteUploadedFile(coverUrl);
      coverUrl = await saveUploadedFile(cover, "prospectus");
    } else if (formData.get("remove_cover") === "1") {
      await deleteUploadedFile(coverUrl);
      coverUrl = null;
    }

    await pool.query(
      'UPDATE prospectus SET title = ?, session_year = ?, description = ?, pdf_url = ?, cover_image_url = ? WHERE id = ?',
      [title, sessionYear, description, pdfUrl, coverUrl, id]
    );

    return NextResponse.json({ success: true, message: "Updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
