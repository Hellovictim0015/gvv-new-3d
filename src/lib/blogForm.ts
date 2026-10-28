// Shared by POST /api/blogs and PUT /api/blogs/[id]: reads + validates the
// admin form and saves the cover image.

import { revalidatePath } from 'next/cache';
import { cleanBlogHtml, excerptFrom, slugify, slugProblem, toDateString } from '@/lib/blogs';
import { saveUploadedFile, isUsableUploadedFile } from '@/lib/upload';

export type BlogInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string | null;
  metaDescription: string | null;
  publishedDate: string;
  isPublished: boolean;
  imageFile: File | null;
  removeImage: boolean;
};

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
};

export function readBlogForm(fd: FormData): { input?: BlogInput; error?: string } {
  const title = str(fd, 'title');
  const content = cleanBlogHtml(str(fd, 'content'));
  const slug = slugify(str(fd, 'slug') || title);
  const publishedDate = str(fd, 'published_date') || toDateString(new Date());

  if (!title) return { error: 'Title is required.' };
  if (!content) return { error: 'Blog content is required.' };
  const problem = slugProblem(slug);
  if (problem) return { error: problem };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedDate)) return { error: 'Invalid publish date.' };

  const image = fd.get('image');
  return {
    input: {
      slug,
      title,
      content,
      excerpt: str(fd, 'excerpt') || excerptFrom(content),
      seoTitle: str(fd, 'seo_title') || null,
      metaDescription: str(fd, 'meta_description') || null,
      publishedDate,
      isPublished: str(fd, 'is_published') !== '0',
      imageFile: isUsableUploadedFile(image) ? image : null,
      removeImage: str(fd, 'remove_image') === '1',
    },
  };
}

export async function saveBlogImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Only image files can be uploaded.');
  return saveUploadedFile(file, 'blogs');
}

// Refresh the cached public pages that show this post.
export function revalidateBlogPages(...slugs: (string | null | undefined)[]) {
  revalidatePath('/articles');
  revalidatePath('/sitemap.xml');
  for (const slug of new Set(slugs)) if (slug) revalidatePath(`/${slug}`);
}

export function isDuplicateSlugError(err: any): boolean {
  return err?.code === 'ER_DUP_ENTRY';
}
