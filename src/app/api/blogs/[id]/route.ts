import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { ensureBlogsTable, toDateString } from "@/lib/blogs";
import { deleteUploadedFile } from "@/lib/upload";
import { readBlogForm, saveBlogImage, revalidateBlogPages, isDuplicateSlugError } from "@/lib/blogForm";

// GET API - One post including its body (admin edit form)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await ensureBlogsTable();
    const [rows]: any = await pool.query("SELECT * FROM blogs WHERE id = ?", [id]);
    const row = rows[0];
    if (!row || (!row.is_published && !(await isAuthorizedAdminRequest(request)))) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, data: { ...row, published_date: toDateString(row.published_date) } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT API - Update a post
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { input, error } = readBlogForm(await request.formData());
    if (!input) return NextResponse.json({ success: false, error }, { status: 400 });

    await ensureBlogsTable();
    const [rows]: any = await pool.query("SELECT slug, image_url FROM blogs WHERE id = ?", [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let imageUrl: string | null = rows[0].image_url;
    if (input.imageFile || input.removeImage) {
      await deleteUploadedFile(imageUrl); // only removes files uploaded through the admin
      imageUrl = input.imageFile ? await saveBlogImage(input.imageFile) : null;
    }

    await pool.query(
      `UPDATE blogs SET slug = ?, title = ?, excerpt = ?, content = ?, seo_title = ?, meta_description = ?,
         image_url = ?, published_date = ?, is_published = ? WHERE id = ?`,
      [input.slug, input.title, input.excerpt, input.content, input.seoTitle, input.metaDescription,
        imageUrl, input.publishedDate, input.isPublished ? 1 : 0, id]
    );

    revalidateBlogPages(rows[0].slug, input.slug);
    return NextResponse.json({ success: true, message: "Updated successfully", slug: input.slug }, { status: 200 });
  } catch (error: any) {
    if (isDuplicateSlugError(error)) {
      return NextResponse.json({ success: false, error: "Another blog already uses this URL. Change the URL slug." }, { status: 409 });
    }
    console.error("PUT Blog Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE API - Remove a post (and its uploaded cover image)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await ensureBlogsTable();
    const [rows]: any = await pool.query("SELECT slug, image_url FROM blogs WHERE id = ?", [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await deleteUploadedFile(rows[0].image_url);
    await pool.query("DELETE FROM blogs WHERE id = ?", [id]);

    revalidateBlogPages(rows[0].slug);
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
