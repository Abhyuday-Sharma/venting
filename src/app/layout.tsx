
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
  metadataBase: new URL('https://www.venting.in'),
  title: 'Venting – Anonymous Emotional Wellness Platform | Venting.in',
  description: 'Join Venting.in, the anonymous emotional wellness platform. A safe, private, and supportive space to express your thoughts, track your mood, and heal together.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Venting – Anonymous Emotional Wellness Platform',
    description: 'Join Venting.in, the anonymous emotional wellness platform. A safe, private space to express your thoughts and heal.',
    url: 'https://www.venting.in',
    siteName: 'Venting.in',
    images: [
      {
        url: '/app_icon.png',
        width: 512,
        height: 512,
        alt: 'Venting.in Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Venting – Anonymous Emotional Wellness Platform',
    description: 'Join Venting.in, the anonymous emotional wellness platform. A safe, private space to express your thoughts and heal.',
    images: ['/app_icon.png'],
  },
  icons: [
    {
      media: '(prefers-color-scheme: light)',
      url: '/icon-light.png',
      href: '/icon-light.png',
    },
    {
      media: '(prefers-color-scheme: dark)',
      url: '/icon-dark.png',
      href: '/icon-dark.png',
    }
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
