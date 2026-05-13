import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="w-full h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
