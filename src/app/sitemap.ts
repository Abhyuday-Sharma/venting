import type { MetadataRoute } from 'next';
import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/site-config';

/**
 * Public, indexable pages only, each under its canonical URL. Left out on
 * purpose: sign-in-only pages (/dashboard, /moments, /settings…), the /vent
 * composer, redirecting aliases (/privacy, /terms, /bright-spots), and /showcase
 * (its canonical is "/").
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/feed`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/updates`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/legal/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/legal/terms-of-service`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/legal/notes`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/support`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/account-deletion`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const guides: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updated ?? g.published),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...pages, ...guides];
}
