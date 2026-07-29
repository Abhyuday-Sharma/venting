import { CreateUsernameForm } from '@/components/auth/create-username-form';
import ProtectedPage from '@/components/auth/protected-page';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Create Username",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CreateUsernamePage() {
  return (
    <ProtectedPage>
        <div className="w-full h-[80vh] flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Loading...</div>}>
                <CreateUsernameForm />
            </Suspense>
        </div>
    </ProtectedPage>
  );
}
