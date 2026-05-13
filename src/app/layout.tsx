
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppHeader } from '@/components/layout/header';
import { MoodCheckInManager } from '@/components/dashboard/mood-checkin-manager';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ThemeProvider } from '@/components/theme-provider';
import { SafetySupportModal } from '@/components/layout/safety-support-modal';

export const metadata: Metadata = {
  title: 'Venting',
  description: 'A safe and private space for your thoughts.',
  manifest: '/manifest.json',
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
        <link rel="apple-touch-icon" href="/app_icon.png" />
      </head>
      <body className="font-body antialiased animated-gradient min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FirebaseErrorListener />
            <SafetySupportModal />
            <div className="flex flex-col min-h-screen bg-background/40 backdrop-blur-[2px]">
              <AppHeader />
              {children}
              <MoodCheckInManager />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
