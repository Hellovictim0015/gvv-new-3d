import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, deleteUploadedFile, isUsableUploadedFile } from "@/lib/upload";
import { CONTENT_PAGES } from "@/lib/infoPages";

// DELETE API
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const [rows]: any = await pool.query('SELECT image_url, pdf_url FROM page_entries WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await deleteUploadedFile(rows[0].image_url);
    await deleteUploadedFile(rows[0].pdf_url);

    await pool.query('DELETE FROM page_entries WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT API - new files optional; remove_image=1 / remove_pdf=1 drop the current ones
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const formData = await request.formData();
    const pageKey = String(formData.get("page_key") || "");
    const title = String(formData.get("title") || "").trim();
    const entryDate = String(formData.get("entry_date") || "") || null;
    const description = String(formData.get("description") || "").trim() || null;

    if (!CONTENT_PAGES[pageKey] || !title) {
      return NextResponse.json({ success: false, error: "Valid page and title are required" }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT image_url, pdf_url FROM page_entries WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const replaceFile = async (field: string, removeFlag: string, current: string | null) => {
      const file = formData.get(field);
      if (isUsableUploadedFile(file)) {
        await deleteUploadedFile(current);
        return saveUploadedFile(file, "pages");
      }
      if (formData.get(removeFlag) === "1") {
        await deleteUploadedFile(current);
        return null;
      }
      return current;
    };

    const imageUrl = await replaceFile("image", "remove_image", rows[0].image_url);
    const pdfUrl = await replaceFile("pdf", "remove_pdf", rows[0].pdf_url);

    await pool.query(
      'UPDATE page_entries SET page_key = ?, title = ?, entry_date = ?, description = ?, image_url = ?, pdf_url = ? WHERE id = ?',
      [pageKey, title, entryDate, description, imageUrl, pdfUrl, id]
    );

    return NextResponse.json({ success: true, message: "Updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
