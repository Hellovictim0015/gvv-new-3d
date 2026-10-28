import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import PageShell from '@/components/landing/PageShell';
import { SEO_LANDING_PAGES, findLandingPage, formatBlogDate } from '@/lib/legacyContent';
import { getPublishedBlog, listPublishedBlogs } from '@/lib/blogs';

// Old-site URLs that live at the root: every blog post (admin → Articles /
// Blogs) and the footer SEO / policy pages. Real routes (/about, /fees, ...)
// always win over this dynamic segment; any other slug 404s. New posts added
// in the admin are rendered on first visit (dynamicParams) and then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  const blogs = await listPublishedBlogs();
  return [...SEO_LANDING_PAGES, ...blogs].map(({ slug }) => ({ slug }));
}

async function resolve(slug: string) {
  const landing = findLandingPage(slug);
  if (landing) return { page: landing, blog: null };
  const blog = await getPublishedBlog(slug);
  return blog ? { page: blog, blog } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await resolve(slug);
  if (!found) return {};
  const { page, blog } = found;
  return {
    title: page.seoTitle,
    description: page.metaDescription,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: page.seoTitle,
      description: page.metaDescription,
      type: blog ? 'article' : 'website',
      ...(blog ? { publishedTime: blog.date, modifiedTime: blog.modified } : {}),
      ...(page.image ? { images: [page.image] } : {}),
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await resolve(slug);
  if (!found) notFound();
  const { page, blog } = found;

  return (
    <PageShell>
      <article className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <header className="mb-10 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#EED165]">
            {blog ? 'Articles / Blogs' : 'Garima Vidhya Vihar'}
          </p>
          <h1 className="mb-5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-700 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent md:text-5xl">
            {page.title}
          </h1>
          {blog && (
            <p className="inline-flex items-center gap-1.5 text-sm text-blue-200/70">
              <CalendarDays size={14} /> {formatBlogDate(blog.date)}
            </p>
          )}
        </header>

        {blog?.image && !blog.html.includes(blog.image) && (
          <img
            src={blog.image}
            alt={blog.title}
            className="mb-10 w-full rounded-2xl border border-white/10 object-cover"
          />
        )}

        {/* Sanitised to a small tag whitelist: by scripts/import-old-site.py for
            imported content, by cleanBlogHtml (src/lib/blogs.ts) for admin edits. */}
        <div className="legacy-content" dangerouslySetInnerHTML={{ __html: page.html }} />

        {blog && (
          <div className="mt-14 border-t border-white/10 pt-8">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/60 px-5 py-2.5 text-sm font-bold text-blue-100 transition-colors hover:bg-blue-500/20"
            >
              <ArrowLeft size={15} /> All articles
            </Link>
          </div>
        )}
      </article>
    </PageShell>
  );
}
