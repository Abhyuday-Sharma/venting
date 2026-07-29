import { Metadata } from 'next';
import TermsOfServicePage from '../legal/terms-of-service/page';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Understand the terms, guidelines, and community rules for using the Venting platform.',
  alternates: {
    canonical: 'https://venting.in/terms',
  },
  openGraph: {
    title: 'Terms of Service | Venting.in',
    description: 'Understand the terms, guidelines, and community rules for using the Venting platform.',
    url: 'https://venting.in/terms',
    siteName: 'Venting.in',
    images: [
      {
        url: 'https://venting.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Venting Terms of Service',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Venting.in',
    description: 'Understand the terms, guidelines, and community rules for using the Venting platform.',
    images: ['https://venting.in/og-image.png'],
    creator: '@venting_in',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsAliasPage() {
  return <TermsOfServicePage />;
}
