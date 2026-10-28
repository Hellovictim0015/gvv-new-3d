// Server-only: Articles / Blogs, stored in the `blogs` table and managed from
// admin → Articles / Blogs. Every post is served at /<slug> (the URL it had on
// the old WordPress site) by src/app/[slug]/page.tsx.
//
// The table is created on first use and, while empty, seeded with the 123 posts
// imported from the old site (src/data/blogs.json) — so a fresh deploy needs no
// manual migration. If the DB is unreachable, readers fall back to that file so
// the old URLs never 404.

import sanitizeHtml from 'sanitize-html';
import pool from '@/lib/db';
import { BLOG_SEED, SEO_LANDING_PAGES, type BlogPost } from '@/lib/legacyContent';
import { LEGACY_REDIRECTS } from '@/lib/legacyRedirects';

export type BlogRow = BlogPost & { id: number | null; isPublished: boolean };

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS \`blogs\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`slug\` VARCHAR(191) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`excerpt\` TEXT NULL,
  \`content\` MEDIUMTEXT NOT NULL,
  \`seo_title\` VARCHAR(255) NULL,
  \`meta_description\` VARCHAR(500) NULL,
  \`image_url\` VARCHAR(255) NULL,
  \`published_date\` DATE NOT NULL,
  \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_blogs_slug\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

declare global {
  // eslint-disable-next-line no-var
  var __gvvBlogsReady: Promise<void> | undefined;
}

async function setUp(): Promise<void> {
  await pool.query(CREATE_TABLE);
  const [countRows]: any = await pool.query('SELECT COUNT(*) AS n FROM blogs');
  if (countRows[0].n > 0) return;
  for (let i = 0; i < BLOG_SEED.length; i += 25) {
    const batch = BLOG_SEED.slice(i, i + 25).map((p) => [
      p.slug, p.title, p.excerpt, p.html, p.seoTitle, p.metaDescription, p.image, p.date, 1,
    ]);
    await pool.query(
      `INSERT IGNORE INTO blogs
         (slug, title, excerpt, content, seo_title, meta_description, image_url, published_date, is_published)
       VALUES ?`,
      [batch],
    );
  }
}

export function ensureBlogsTable(): Promise<void> {
  if (!globalThis.__gvvBlogsReady) {
    globalThis.__gvvBlogsReady = setUp().catch((err) => {
      globalThis.__gvvBlogsReady = undefined; // retry on the next request
      throw err;
    });
  }
  return globalThis.__gvvBlogsReady;
}

// mysql2 returns DATE columns as a Date at local midnight; read it back in
// local time (toISOString would shift it a day back in IST).
export function toDateString(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value ?? '').slice(0, 10);
}

function fromRow(r: any): BlogRow {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? '',
    html: r.content,
    seoTitle: r.seo_title || `${r.title} | Garima Vidya Vihar`,
    metaDescription: r.meta_description || (r.excerpt ?? '').slice(0, 160),
    image: r.image_url || null,
    date: toDateString(r.published_date),
    modified: toDateString(r.updated_at ?? r.published_date),
    isPublished: Boolean(r.is_published),
  };
}

const seedFallback = (): BlogRow[] => BLOG_SEED.map((p) => ({ ...p, id: null, isPublished: true }));

// Public site: published posts, newest first.
export async function listPublishedBlogs(): Promise<BlogRow[]> {
  try {
    await ensureBlogsTable();
    const [rows]: any = await pool.query(
      'SELECT * FROM blogs WHERE is_published = 1 ORDER BY published_date DESC, id DESC',
    );
    return rows.map(fromRow);
  } catch (err) {
    console.error('listPublishedBlogs failed, using imported posts:', err);
    return seedFallback();
  }
}

export async function getPublishedBlog(slug: string): Promise<BlogRow | null> {
  try {
    await ensureBlogsTable();
    const [rows]: any = await pool.query('SELECT * FROM blogs WHERE slug = ? AND is_published = 1 LIMIT 1', [slug]);
    return rows[0] ? fromRow(rows[0]) : null;
  } catch (err) {
    console.error('getPublishedBlog failed, using imported posts:', err);
    return seedFallback().find((p) => p.slug === slug) ?? null;
  }
}

// --- Admin helpers ---------------------------------------------------------

export async function listAllBlogs(): Promise<BlogRow[]> {
  await ensureBlogsTable();
  const [rows]: any = await pool.query('SELECT * FROM blogs ORDER BY published_date DESC, id DESC');
  return rows.map(fromRow);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

// Slugs a blog can't take: real routes, the footer SEO/policy pages and the
// old-site URLs that redirect elsewhere.
const RESERVED_SLUGS = new Set<string>([
  'about', 'academic', 'admin', 'admission', 'api', 'articles', 'co-curricular', 'contact', 'events',
  'fees', 'mandatory-disclosures', 'process', 'robotics', 'tc-download', 'test', 'uniform',
  'wp-content', 'wp-admin', 'sitemap.xml', 'robots.txt', 'favicon.ico', 'feed', 'page', 'category',
  'tag', 'author',
  ...SEO_LANDING_PAGES.map((p) => p.slug),
  ...LEGACY_REDIRECTS.map((r) => r.source.split('/')[1]).filter((s) => s && !s.includes(':')),
]);

export function slugProblem(slug: string): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'URL slug may only use lowercase letters, numbers and single hyphens (e.g. my-new-post).';
  }
  if (RESERVED_SLUGS.has(slug)) return `"/${slug}" is already used by another page. Choose a different URL.`;
  return null;
}

// Admin-entered HTML is rendered as-is on the public site, so keep it to the
// same small tag set the imported posts use.
export function cleanBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h2', 'h3', 'h4', 'h5', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'a', 'img',
      'blockquote', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'loading'],
      iframe: ['src', 'allowfullscreen', 'loading'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    transformTags: {
      h1: 'h2',
      h6: 'h5',
      div: 'p',
      a: (tagName, attribs) =>
        /^https?:\/\//.test(attribs.href || '')
          ? { tagName, attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } }
          : { tagName, attribs },
    },
  }).trim();
}

export function excerptFrom(html: string): string {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
  return text.length > 220 ? `${text.slice(0, 220).replace(/\s+\S*$/, '')}…` : text;
}
