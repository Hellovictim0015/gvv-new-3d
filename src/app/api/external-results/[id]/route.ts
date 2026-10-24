import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, deleteUploadedFile, isUsableUploadedFile } from "@/lib/upload";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// DELETE API
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const [rows]: any = await pool.query('SELECT pdf_url FROM external_results WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await deleteUploadedFile(rows[0].pdf_url);

    await pool.query('DELETE FROM external_results WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT API - entry_type is fixed at creation; only that type's fields are updated
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const formData = await request.formData();
    const examName = field(formData, "exam_name");
    const sessionYear = field(formData, "session_year") || null;

    if (!examName) {
      return NextResponse.json({ success: false, error: "Exam name is required" }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT entry_type, pdf_url FROM external_results WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    if (rows[0].entry_type === "pdf") {
      let pdfUrl = rows[0].pdf_url;
      const file = formData.get("pdf");
      if (isUsableUploadedFile(file)) {
        await deleteUploadedFile(pdfUrl);
        pdfUrl = await saveUploadedFile(file, "external-results");
      }
      await pool.query(
        'UPDATE external_results SET exam_name = ?, session_year = ?, pdf_url = ? WHERE id = ?',
        [examName, sessionYear, pdfUrl, id]
      );
    } else {
      const studentName = field(formData, "student_name");
      if (!studentName) {
        return NextResponse.json({ success: false, error: "Student name is required" }, { status: 400 });
      }
      await pool.query(
        'UPDATE external_results SET exam_name = ?, student_name = ?, class_name = ?, result = ?, session_year = ? WHERE id = ?',
        [examName, studentName, field(formData, "class_name") || null, field(formData, "result") || null, sessionYear, id]
      );
    }

    return NextResponse.json({ success: true, message: "Updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
