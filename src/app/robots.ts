import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // No trailing slashes: robots rules are prefix matches, and "/dashboard/"
        // would leave "/dashboard" itself crawlable.
        disallow: [
          '/api',
          '/admin',
          '/dashboard',
          '/settings',
          '/profile',
          '/moments',
          '/welcome',
          '/feedback',
          '/notifications',
          '/report-history',
          '/login',
          '/signup',
          '/create-username',
          '/support/success',
        ],
      },
      {
        // The AdSense crawler only reads pages to match ads to them; Google
        // recommends leaving it unrestricted.
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
    ],
    sitemap: 'https://venting.in/sitemap.xml',
  };
}
