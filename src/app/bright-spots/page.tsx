import { Metadata } from 'next';
import { MomentsClient } from '../(main)/moments/moments-client';

export const metadata: Metadata = {
  title: 'Bright Spots & Daily Moments',
  description: 'A private, reflective space to record your small victories, gratitude, and quiet daily moments on Venting.in.',
  alternates: {
    canonical: 'https://venting.in/bright-spots',
  },
  openGraph: {
    title: 'Bright Spots & Daily Moments | Venting.in',
    description: 'A private, reflective space to record your small victories, gratitude, and quiet daily moments.',
    url: 'https://venting.in/bright-spots',
    siteName: 'Venting.in',
    images: [
      {
        url: 'https://venting.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bright Spots on Venting.in',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bright Spots & Daily Moments | Venting.in',
    description: 'A private, reflective space to record your small victories, gratitude, and quiet daily moments.',
    images: ['https://venting.in/og-image.png'],
    creator: '@venting_in',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BrightSpotsPage() {
  return <MomentsClient />;
}
