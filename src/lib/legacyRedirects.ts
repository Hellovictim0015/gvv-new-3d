// 301 redirects from the old WordPress site (garimaschool.com) to this site, so
// old Google results and backlinks don't 404. Used by next.config.ts.
//
// Not listed here because they are served at their OLD URL unchanged
// (src/app/[slug]/page.tsx): every blog post, the footer "Best School in ..."
// pages and the policy pages. Old URLs that match a new route as-is
// (/about, /admission, /articles, /mandatory-disclosures, /tc-download) need
// nothing either.
// Relative imports only — next.config.ts can't resolve the "@/" alias.

type Redirect = { source: string; destination: string; permanent: true };

// old page slug -> new route
const PAGES: Record<string, string> = {
  home: '/',
  'contact-us': '/contact',
  'admission-open': '/process',
  'admission-open-2026': '/admission',
  'admission-2026': '/admission',
  'admission-2025': '/admission',
  'admission-form': '/process',
  inquiry: '/admission',
  'thank-you': '/',
  'thankyou-page': '/',
  'no-access': '/',
  'best-schools-in-indore-with-low-fees': '/fees',
  'fee-payment': '/fees',
  'book-list': '/academic/books',
  staff: '/about/educators',
  'our-committee': '/about/committees',
  management: '/about/management',
  gallery: '/about/gallery-media',
  'annual-report': '/about/report',
  'academic-calendar-2024-25': '/academic/calendar',
  'annual-curriculum-planner-2024-25': '/academic/planner',
  'gvv-uniform-2': '/uniform',
  'mandatory-disclosure-2026': '/mandatory-disclosures',
  'early-stage': '/about/school-wings',
  'lower-stage': '/about/school-wings',
  'middle-stage': '/about/school-wings',
  'upper-stage': '/about/school-wings',
  'our-infrastructure': '/about/what-we-offer',
  'recreational-activities': '/events/clubs',
  'dance-music-theatre': '/events/clubs',
  'academic-enhancement-activities': '/robotics',
  'visits-and-outings': '/events/tours',
  'annual-day': '/events/school-events',
  'event-and-celebrations': '/events/school-events',
  'masti-ki-paathshaala-season-ii': '/events/school-events',
  'world-environment-day-world-conservation-day-van-mahotsav': '/events/school-events',
  'school-students-council-election': '/events/school-events',
  'independence-day-and-republic-day-celebration': '/events/school-events',
  'international-day-of-yoga': '/events/school-events',
};

// WordPress archive/system URLs that Google may have indexed.
const PATTERNS: [string, string][] = [
  ['/category/:path*', '/articles'],
  ['/tag/:path*', '/articles'],
  ['/author/:path*', '/articles'],
  ['/page/:n', '/articles'],
  ['/articles/page/:n', '/articles'],
  ['/feed', '/articles'],
  ['/comments/feed', '/articles'],
  ['/sitemap_index.xml', '/sitemap.xml'],
  ['/post-sitemap.xml', '/sitemap.xml'],
  ['/page-sitemap.xml', '/sitemap.xml'],
  ['/category-sitemap.xml', '/sitemap.xml'],
  ['/wp-login.php', '/'],
  ['/wp-admin/:path*', '/'],
  // Old PDF downloads (book lists, disclosure documents, calendars) now live
  // behind the admin-managed pages.
  ['/wp-content/uploads/:year/:month/:file(.*[Bb]ook.*\\.pdf)', '/academic/books'],
  ['/wp-content/uploads/:year/:month/:file(Grade-.*\\.pdf)', '/academic/books'],
  ['/wp-content/uploads/:year/:month/:file(.*\\.pdf)', '/mandatory-disclosures'],
];

export const LEGACY_REDIRECTS: Redirect[] = [
  ...Object.entries(PAGES).map(([slug, destination]) => ({
    source: `/${slug}`,
    destination,
    permanent: true as const,
  })),
  ...PATTERNS.map(([source, destination]) => ({ source, destination, permanent: true as const })),
];
