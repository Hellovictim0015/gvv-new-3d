// Public origin of the live site, used for the sitemap, robots.txt and
// canonical URLs. Set NEXT_PUBLIC_SITE_URL on the server; defaults to the
// school's real domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.garimaschool.com').replace(/\/+$/, '');

// Only the real domain should be indexed — a staging host (e.g. m.techbytex.in)
// would otherwise compete with it in Google as duplicate content.
export const IS_PRODUCTION_SITE = /^https:\/\/(www\.)?garimaschool\.com$/.test(SITE_URL);
