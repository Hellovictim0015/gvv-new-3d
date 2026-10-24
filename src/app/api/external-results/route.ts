import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, isUsableUploadedFile } from "@/lib/upload";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// GET API - Fetch all external exam results (typed list rows + uploaded PDFs)
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM external_results ORDER BY session_year DESC, exam_name ASC, id ASC'
    );
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST API - Add a typed result (entry_type=list) or upload a result PDF (entry_type=pdf)
export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const entryType = field(formData, "entry_type") === "pdf" ? "pdf" : "list";
    const examName = field(formData, "exam_name");
    const sessionYear = field(formData, "session_year") || null;

    if (!examName) {
      return NextResponse.json({ success: false, error: "Exam name is required" }, { status: 400 });
    }

    if (entryType === "pdf") {
      const file = formData.get("pdf");
      if (!isUsableUploadedFile(file)) {
        return NextResponse.json({ success: false, error: "PDF file is required" }, { status: 400 });
      }
      const pdfUrl = await saveUploadedFile(file, "external-results");
      const [result]: any = await pool.query(
        'INSERT INTO external_results (entry_type, exam_name, session_year, pdf_url) VALUES (?, ?, ?, ?)',
        ['pdf', examName, sessionYear, pdfUrl]
      );
      return NextResponse.json({ success: true, message: "Result PDF added successfully", insertId: result.insertId }, { status: 201 });
    }

    const studentName = field(formData, "student_name");
    const className = field(formData, "class_name") || null;
    const resultText = field(formData, "result") || null;
    if (!studentName) {
      return NextResponse.json({ success: false, error: "Student name is required" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      'INSERT INTO external_results (entry_type, exam_name, student_name, class_name, result, session_year) VALUES (?, ?, ?, ?, ?, ?)',
      ['list', examName, studentName, className, resultText, sessionYear]
    );
    return NextResponse.json({ success: true, message: "Result added successfully", insertId: result.insertId }, { status: 201 });
  } catch (error: any) {
    console.error("POST ExternalResults Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
