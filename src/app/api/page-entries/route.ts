import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, isUsableUploadedFile } from "@/lib/upload";
import { CONTENT_PAGES } from "@/lib/infoPages";

// entry_date is formatted in SQL so it reaches the client as a plain
// "YYYY-MM-DD" string (a JS Date would shift by the server's timezone).
const COLUMNS =
  "id, page_key, title, DATE_FORMAT(entry_date, '%Y-%m-%d') AS entry_date, description, image_url, pdf_url, created_at";

// GET API - all entries, or one page's entries with ?page=<route>
export async function GET(request: Request) {
  try {
    const pageKey = new URL(request.url).searchParams.get("page");
    const [rows] = pageKey
      ? await pool.query(`SELECT ${COLUMNS} FROM page_entries WHERE page_key = ? ORDER BY id ASC`, [pageKey])
      : await pool.query(`SELECT ${COLUMNS} FROM page_entries ORDER BY id ASC`);
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST API - add an entry (image and PDF both optional)
export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const pageKey = String(formData.get("page_key") || "");
    const title = String(formData.get("title") || "").trim();
    const entryDate = String(formData.get("entry_date") || "") || null;
    const description = String(formData.get("description") || "").trim() || null;
    const image = formData.get("image");
    const pdf = formData.get("pdf");

    if (!CONTENT_PAGES[pageKey] || !title) {
      return NextResponse.json({ success: false, error: "Valid page and title are required" }, { status: 400 });
    }

    const imageUrl = isUsableUploadedFile(image) ? await saveUploadedFile(image, "pages") : null;
    const pdfUrl = isUsableUploadedFile(pdf) ? await saveUploadedFile(pdf, "pages") : null;

    const [result]: any = await pool.query(
      'INSERT INTO page_entries (page_key, title, entry_date, description, image_url, pdf_url) VALUES (?, ?, ?, ?, ?, ?)',
      [pageKey, title, entryDate, description, imageUrl, pdfUrl]
    );

    return NextResponse.json({ success: true, message: "Entry added successfully", insertId: result.insertId }, { status: 201 });
  } catch (error: any) {
    console.error("POST PageEntries Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
