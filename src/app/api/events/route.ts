import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, isUsableUploadedFile } from "@/lib/upload";
import { EVENT_PAGES } from "@/lib/infoPages";

// event_date is formatted in SQL so it reaches the client as a plain
// "YYYY-MM-DD" string (a JS Date would shift by the server's timezone).
const EVENT_COLUMNS =
  "id, category, title, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, description, image_url, created_at";

// GET API - all events, or one menu page's events with ?category=<slug>
export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category");
    const order = "ORDER BY event_date IS NULL, event_date DESC, id DESC";
    const [rows] = category
      ? await pool.query(`SELECT ${EVENT_COLUMNS} FROM events WHERE category = ? ${order}`, [category])
      : await pool.query(`SELECT ${EVENT_COLUMNS} FROM events ${order}`);
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST API - add an event (image optional)
export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const category = String(formData.get("category") || "");
    const title = String(formData.get("title") || "").trim();
    const eventDate = String(formData.get("event_date") || "") || null;
    const description = String(formData.get("description") || "").trim() || null;
    const file = formData.get("image");

    if (!EVENT_PAGES[category] || !title) {
      return NextResponse.json({ success: false, error: "Valid category and title are required" }, { status: 400 });
    }

    const imageUrl = isUsableUploadedFile(file) ? await saveUploadedFile(file, "events") : null;

    const [result]: any = await pool.query(
      'INSERT INTO events (category, title, event_date, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [category, title, eventDate, description, imageUrl]
    );

    return NextResponse.json({ success: true, message: "Event added successfully", insertId: result.insertId }, { status: 201 });
  } catch (error: any) {
    console.error("POST Events Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
