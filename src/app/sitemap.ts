import type { MetadataRoute } from 'next';
import { SEO_PAGES } from '@/lib/seoPages';
import { ACADEMIC_PAGES, EVENT_PAGES } from '@/lib/infoPages';
import { SEO_LANDING_PAGES } from '@/lib/legacyContent';
import { listPublishedBlogs } from '@/lib/blogs';
import { SITE_URL } from '@/lib/siteUrl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await listPublishedBlogs();
  const routes = new Set<string>([
    ...SEO_PAGES.map((p) => p.route),
    ...Object.keys(ACADEMIC_PAGES).map((slug) => `/academic/${slug}`),
    ...Object.keys(EVENT_PAGES).map((slug) => `/events/${slug}`),
    '/about/educators',
    '/admission/prospectus',
    '/mandatory-disclosures',
    ...SEO_LANDING_PAGES.map((p) => `/${p.slug}`),
  ]);

  return [
    ...[...routes].map((route) => ({
      url: `${SITE_URL}${route === '/' ? '' : route}`,
      changeFrequency: 'monthly' as const,
      priority: route === '/' ? 1 : 0.7,
    })),
    ...blogs.map((post) => ({
      url: `${SITE_URL}/${post.slug}`,
      lastModified: post.modified,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
