import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { saveUploadedFile, deleteUploadedFile, isUsableUploadedFile } from "@/lib/upload";
import { EVENT_PAGES } from "@/lib/infoPages";

// DELETE API
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const [rows]: any = await pool.query('SELECT image_url FROM events WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await deleteUploadedFile(rows[0].image_url);

    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT API - send remove_image=1 to drop the current image without a replacement
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const formData = await request.formData();
    const category = String(formData.get("category") || "");
    const title = String(formData.get("title") || "").trim();
    const eventDate = String(formData.get("event_date") || "") || null;
    const description = String(formData.get("description") || "").trim() || null;
    const file = formData.get("image");

    if (!EVENT_PAGES[category] || !title) {
      return NextResponse.json({ success: false, error: "Valid category and title are required" }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT image_url FROM events WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let imageUrl = rows[0].image_url;
    if (isUsableUploadedFile(file)) {
      await deleteUploadedFile(imageUrl);
      imageUrl = await saveUploadedFile(file, "events");
    } else if (formData.get("remove_image") === "1") {
      await deleteUploadedFile(imageUrl);
      imageUrl = null;
    }

    await pool.query(
      'UPDATE events SET category = ?, title = ?, event_date = ?, description = ?, image_url = ? WHERE id = ?',
      [category, title, eventDate, description, imageUrl, id]
    );

    return NextResponse.json({ success: true, message: "Updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
