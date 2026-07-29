import { Metadata } from 'next';
import { Suspense } from 'react';
import SupportClient from './support-client';

export const metadata: Metadata = {
  title: 'Support Platform',
  description: 'Support Venting.in to help keep this emotional wellness platform free, safe, and available for everyone.',
  alternates: {
    canonical: 'https://venting.in/support',
  },
  openGraph: {
    title: 'Support Platform | Venting.in',
    description: 'Support Venting.in to help keep this emotional wellness platform free, safe, and available for everyone.',
    url: 'https://venting.in/support',
    siteName: 'Venting.in',
    images: [
      {
        url: 'https://venting.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Support Venting.in',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support Platform | Venting.in',
    description: 'Support Venting.in to help keep this emotional wellness platform free, safe, and available for everyone.',
    images: ['https://venting.in/og-image.png'],
    creator: '@venting_in',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-2xl p-4 md:p-8">Loading...</div>}>
      <SupportClient />
    </Suspense>
  );
}
