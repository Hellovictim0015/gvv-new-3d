import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import PageShell from '@/components/landing/PageShell';
import { BLOG_POSTS, formatBlogDate } from '@/lib/legacyContent';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return getPageMetadata('/articles');
}

export default function ArticlesPage() {
  return (
    <PageShell>
      <section className="relative px-6 pb-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/25 via-transparent to-transparent pointer-events-none z-0" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="mb-6 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-900 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-7xl">
            ARTICLES / BLOGS
          </h1>
          <p className="mx-auto text-lg leading-relaxed text-blue-200/70 md:text-xl">
            Updates on school life, academics, parenting and events from Garima Vidhya Vihar.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-blue-400/50 hover:bg-white/[0.07]"
          >
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                decoding="async"
                className="aspect-[16/9] w-full object-cover"
              />
            )}
            <div className="flex flex-1 flex-col p-5">
              <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#EED165]">
                <CalendarDays size={13} /> {formatBlogDate(post.date)}
              </p>
              <h2 className="mb-3 text-lg font-bold leading-snug text-white group-hover:text-blue-200">{post.title}</h2>
              <p className="line-clamp-3 text-sm leading-relaxed text-blue-100/70">{post.excerpt}</p>
              <span className="mt-auto pt-4 text-sm font-bold text-[#F5C842]">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
