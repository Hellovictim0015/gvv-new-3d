import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/auth";
import { isUsableUploadedFile } from "@/lib/upload";
import { saveBlogImage } from "@/lib/blogForm";

// POST API - Upload an image to place inside a blog post's body (admin editor's
// "Image" button). Returns the URL to insert.
export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const file = (await request.formData()).get("image");
    if (!isUsableUploadedFile(file)) {
      return NextResponse.json({ success: false, error: "Image file is required" }, { status: 400 });
    }
    const url = await saveBlogImage(file);
    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
