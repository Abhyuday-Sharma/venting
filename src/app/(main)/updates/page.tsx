import { Metadata } from 'next';
import UpdatesClient from './updates-client';

export const metadata: Metadata = {
  title: 'Update Log & Platform Enhancements',
  description: 'Track all new features, improvements, and discover how & where AI runs securely to support your emotional well-being on Venting.in.',
  alternates: {
    canonical: 'https://venting.in/updates',
  },
  openGraph: {
    title: 'Update Log & Platform Enhancements | Venting.in',
    description: 'Track all new features, improvements, and discover how & where AI runs securely to support your emotional well-being.',
    url: 'https://venting.in/updates',
    siteName: 'Venting.in',
    images: [
      {
        url: 'https://venting.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Venting Platform Updates',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Update Log & Platform Enhancements | Venting.in',
    description: 'Track all new features, improvements, and discover how & where AI runs securely to support your emotional well-being.',
    images: ['https://venting.in/og-image.png'],
    creator: '@venting_in',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UpdatesPage() {
  return <UpdatesClient />;
}
