import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign In",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col min-h-[100dvh]">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
