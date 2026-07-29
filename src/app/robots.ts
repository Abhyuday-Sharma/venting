import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/feed',
        '/showcase',
        '/vent',
        '/bright-spots',
        '/updates',
        '/about',
        '/privacy',
        '/terms',
        '/legal/',
        '/moments',
        '/support',
      ],
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/settings/',
        '/profile/',
        '/notifications/',
        '/report-history/',
        '/login/',
        '/signup/',
        '/create-username/',
      ],
    },
    sitemap: 'https://venting.in/sitemap.xml',
  };
}
