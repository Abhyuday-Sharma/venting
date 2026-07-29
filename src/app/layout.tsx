import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppHeader } from '@/components/layout/header';
import { MoodCheckInManager } from '@/components/dashboard/mood-checkin-manager';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ThemeProvider } from '@/components/theme-provider';
import { SafetySupportModal } from '@/components/layout/safety-support-modal';
import { PWAManager } from '@/components/layout/pwa-manager';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import ShaderBackground from '@/components/layout/shader-background-wrapper';

export const metadata: Metadata = {
  metadataBase: new URL('https://venting.in'),
  title: {
    default: 'Express. Release. Grow. | Venting.in',
    template: '%s | Venting.in',
  },
  description: 'AI-powered anonymous emotional wellness. A safe, private space to express your thoughts, release what weighs you down, and grow through your emotions.',
  keywords: [
    'emotional wellness',
    'anonymous venting',
    'mental health support',
    'safe space',
    'mood tracker',
    'anonymous mental health',
    'online venting',
    'feelings journal',
    'venting platform',
    'venting.in',
  ],
  authors: [{ name: 'Venting.in Team', url: 'https://venting.in' }],
  category: 'Emotional Wellness',
  publisher: 'Venting.in',
  creator: 'Venting.in',
  applicationName: 'Venting',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://venting.in',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Venting – Anonymous Emotional Wellness Platform',
    description: 'Join Venting.in, the anonymous emotional wellness platform. A safe, private, and supportive space to express your thoughts, track your mood, and heal together.',
    url: 'https://venting.in',
    siteName: 'Venting.in',
    images: [
      {
        url: 'https://venting.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Venting.in Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Express. Release. Grow. | Venting.in',
    description: 'AI-powered anonymous emotional wellness. A safe, private space to express your thoughts, release what weighs you down, and grow through your emotions.',
    images: ['https://venting.in/og-image.png'],
    creator: '@venting_in',
  },
  icons: {
    icon: [
      { url: '/icon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.png', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/venting_180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Venting.in',
    url: 'https://venting.in',
    logo: 'https://venting.in/og-image.png',
    description: 'Anonymous emotional wellness and mental health support platform.',
    sameAs: [],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Venting.in',
    url: 'https://venting.in',
    description: 'Express your thoughts anonymously, track your mood, and connect with a supportive community.',
    publisher: {
      '@type': 'Organization',
      name: 'Venting.in',
      logo: 'https://venting.in/og-image.png',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Venting',
    operatingSystem: 'All',
    applicationCategory: 'HealthApplication',
    description: 'Anonymous emotional wellness platform and mood tracking application.',
    url: 'https://venting.in',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/venting_180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Venting" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased animated-gradient min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ShaderBackground />
          <AuthProvider>
            <FirebaseErrorListener />
            <SafetySupportModal />
            <div className="flex flex-col min-h-screen bg-background/40 backdrop-blur-[2px]">
              <AppHeader />
              {children}
            </div>
            <BottomNavigation />
            <MoodCheckInManager />
            <PWAManager />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
