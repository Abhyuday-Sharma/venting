
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Short/legacy aliases that used to serve duplicate copies of a page. They
  // redirect so each page has one canonical URL, while links already shared
  // elsewhere (store listings, old posts) keep working.
  async redirects() {
    return [
      { source: '/privacy', destination: '/legal/privacy-policy', permanent: true },
      { source: '/terms', destination: '/legal/terms-of-service', permanent: true },
      { source: '/bright-spots', destination: '/moments', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
