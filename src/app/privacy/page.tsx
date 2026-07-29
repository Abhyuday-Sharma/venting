import { Metadata } from 'next';
import PrivacyPolicyPage from '../legal/privacy-policy/page';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Protection',
  description: 'Read how Venting.in protects your personal data, guarantees privacy, and enforces strict security standards.',
  alternates: {
    canonical: 'https://venting.in/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Data Protection | Venting.in',
    description: 'Read how Venting.in protects your personal data, guarantees privacy, and enforces strict security standards.',
    url: 'https://venting.in/privacy',
    siteName: 'Venting.in',
    images: [
      {
        url: 'https://venting.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Venting Privacy Policy',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy & Data Protection | Venting.in',
    description: 'Read how Venting.in protects your personal data, guarantees privacy, and enforces strict security standards.',
    images: ['https://venting.in/og-image.png'],
    creator: '@venting_in',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyAliasPage() {
  return <PrivacyPolicyPage />;
}
