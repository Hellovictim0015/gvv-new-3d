# Old site (garimaschool.com, WordPress) → this site

## In code

- **Blogs (123)** and **footer SEO pages + policy pages (11)** are served at their **old URLs**
  (`/<slug>`) by `src/app/[slug]/page.tsx`, so their Google rankings carry over with no redirect.
  Content: `src/data/blogs.json`, `src/data/seoLandingPages.json`; images in `public/wp-content/uploads/`
  (same paths as the old site). Listing: `/articles`.
- **Blogs are managed in admin → Articles / Blogs** (`blogs` table; `src/lib/blogs.ts`, `/api/blogs`).
  The table is created on first use and, while empty, seeded from `src/data/blogs.json`, so a fresh
  server needs no manual step. That JSON is also the fallback if the DB is down.
  Admin HTML is sanitised on save (`cleanBlogHtml`). Images uploaded in the editor go to `uploads/blogs/`.
- `python scripts/import-old-site.py` re-imports from the old site, but only fills an **empty** `blogs`
  table — once the admin is in use, add new posts there instead.
- **301 redirects** for every other old page + WordPress archives/sitemaps/PDFs: `src/lib/legacyRedirects.ts`
  (wired into `next.config.ts`).
- **sitemap.xml / robots.txt**: `src/app/sitemap.ts`, `src/app/robots.ts`.
  Domain comes from `NEXT_PUBLIC_SITE_URL` (default `https://www.garimaschool.com`, see `src/lib/siteUrl.ts`).

## Added through the admin (data, not code)

Fees 2026-27 (6 rows), 15 book-list PDFs, Mandatory Disclosure (17 entries, 11 PDFs),
Our Educators (124 staff), Gallery (50 photos).

## Before going live

1. Admin login is OFF (bypassed in `src/proxy.ts` and `isAuthorizedAdminRequest` in
   `src/lib/auth.ts`). Until it is re-enabled, every admin API and the enquiry list is open to anyone.
   Every write API (Fees included) already calls `isAuthorizedAdminRequest`, so re-enabling only
   needs those two places plus `ADMIN_PASSWORD_HASH` / `ADMIN_SESSION_SECRET` on the server.
2. Point the garimaschool.com domain at this app and keep `NEXT_PUBLIC_SITE_URL` on it.
3. Submit `https://www.garimaschool.com/sitemap.xml` in Google Search Console.
4. Still missing content (school must supply): Syllabus, Pedagogy, Courses Offered, Evaluation Pattern,
   Exam Date Sheet, Board Results; TC search by PEN number.
