
import { CreateUsernameForm } from '@/components/auth/create-username-form';
import ProtectedPage from '@/components/auth/protected-page';
import { Suspense } from 'react';

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
