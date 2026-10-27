import type { MetadataRoute } from 'next';
import { SITE_URL, IS_PRODUCTION_SITE } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  // Keep staging/preview hosts out of Google until the site goes live on the
  // real domain (set NEXT_PUBLIC_SITE_URL to it).
  if (!IS_PRODUCTION_SITE) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/test'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
