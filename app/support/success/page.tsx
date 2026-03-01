'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { verifyStripeSession } from '@/actions/stripe';

function SuccessPageContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (authLoading) {
            return; // Wait until user auth state is resolved
        }

        if (!sessionId) {
            router.push('/support');
            return;
        }

        if (!user) {
             toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to verify a payment.',
            });
            router.push('/login');
            return;
        }

        async function verifySession() {
            const isSuccess = await verifyStripeSession(sessionId!, user!.uid);

            if (isSuccess) {
                setStatus('success');
                setMessage('Thank you! Your support means a lot and helps keep this space running.');
                
                toast({
                    title: 'Thank you for your support!',
                    description: 'Redirecting you to the settings page...',
                });

                setTimeout(() => {
                    router.push('/settings');
                }, 3000);
            } else {
                setStatus('error');
                setMessage('We could not verify your payment. If you believe this is an error, please contact support.');
                toast({
                    variant: 'destructive',
                    title: 'Payment Verification Failed',
                    description: 'There was an issue confirming your support.',
                });
            }
        }
        
        verifySession();

    }, [sessionId, user, authLoading, router, toast]);

    if (authLoading) {
         return (
            <div className="container mx-auto max-w-2xl p-4 md:p-8 flex items-center justify-center h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
         <div className="container mx-auto max-w-2xl p-4 md:p-8 flex items-center justify-center h-[60vh]">
            <Card className="w-full shadow-lg">
                <CardHeader className="text-center items-center">
                    {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                    {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
                    {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
                    <CardTitle className="text-2xl font-headline mt-4">
                        {status === 'loading' && 'Verifying Payment'}
                        {status === 'success' && 'Payment Successful!'}
                        {status === 'error' && 'Payment Error'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">{message}</p>
                    {status !== 'loading' && (
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function SupportSuccessPage() {
    return (
        <Suspense fallback={<div className="container mx-auto max-w-2xl p-4 md:p-8 flex items-center justify-center h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <SuccessPageContent />
        </Suspense>
    )
}
