import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { ensureBlogsTable, listAllBlogs } from "@/lib/blogs";
import { readBlogForm, saveBlogImage, revalidateBlogPages, isDuplicateSlugError } from "@/lib/blogForm";

// GET API - All posts for the admin list (without the article body; GET
// /api/blogs/[id] returns that). Drafts are only listed for the admin.
export async function GET(request: Request) {
  try {
    const isAdmin = await isAuthorizedAdminRequest(request);
    const rows = (await listAllBlogs()).filter((b) => isAdmin || b.isPublished);
    const data = rows.map(({ html: _html, ...rest }) => rest);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST API - Create a post
export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { input, error } = readBlogForm(await request.formData());
    if (!input) return NextResponse.json({ success: false, error }, { status: 400 });

    await ensureBlogsTable();
    const imageUrl = input.imageFile ? await saveBlogImage(input.imageFile) : null;

    const [result]: any = await pool.query(
      `INSERT INTO blogs (slug, title, excerpt, content, seo_title, meta_description, image_url, published_date, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [input.slug, input.title, input.excerpt, input.content, input.seoTitle, input.metaDescription,
        imageUrl, input.publishedDate, input.isPublished ? 1 : 0]
    );

    revalidateBlogPages(input.slug);
    return NextResponse.json(
      { success: true, message: "Blog added successfully", insertId: result.insertId, slug: input.slug },
      { status: 201 }
    );
  } catch (error: any) {
    if (isDuplicateSlugError(error)) {
      return NextResponse.json({ success: false, error: "Another blog already uses this URL. Change the URL slug." }, { status: 409 });
    }
    console.error("POST Blog Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
