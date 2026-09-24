import { Metadata } from 'next';
import { MomentsClient } from './moments-client';

export const metadata: Metadata = {
  title: 'Bright Spots & Daily Moments',
  description: 'A private, reflective space to record your small victories, gratitude, and quiet daily moments on Venting.in.',
  alternates: {
    canonical: 'https://venting.in/moments',
  },
  openGraph: {
    title: 'Bright Spots & Daily Moments | Venting',
    description: 'A private, reflective space to record your small victories, gratitude, and quiet daily moments.',
    url: 'https://venting.in/moments',
    siteName: 'Venting',
    images: [
      {
        url: 'https://venting.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bright Spots on Venting',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bright Spots & Daily Moments | Venting',
    description: 'A private, reflective space to record your small victories, gratitude, and quiet daily moments.',
    images: ['https://venting.in/og-image.png'],
    creator: '@venting_in',
  },
  // Private, sign-in-only feature: keep it out of search results.
  robots: {
    index: false,
    follow: false,
  },
};

export default function MomentsPage() {
  return <MomentsClient />;
}
