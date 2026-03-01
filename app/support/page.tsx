
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createCheckoutSession } from '@/actions/stripe';
import { Input } from '@/components/ui/input';

const donationAmounts = [50, 100, 250, 500];

export default function SupportPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
    const [customAmount, setCustomAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (searchParams.get('canceled')) {
            toast({
                variant: 'destructive',
                title: 'Payment Canceled',
                description: 'Your donation process was canceled.',
            });
        }
    }, [searchParams, toast]);


    const handleDonation = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'You must be logged in',
                description: 'Please sign in to support the platform.',
            });
            return;
        }
        
        const amount = selectedAmount;

        if (!amount || amount < 50) {
             toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please select or enter a donation amount of at least ₹50.',
            });
            return;
        }

        setIsLoading(true);
        try {
            // This server action will redirect the user to Stripe Checkout
            await createCheckoutSession(amount, user);
        } catch (error) {
            console.error('Error creating checkout session:', error);
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: 'Could not initiate the donation process. Please try again.',
            });
            setIsLoading(false);
        }
    };
    
    const handleAmountSelect = (amount: number | null) => {
        setCustomAmount('');
        setSelectedAmount(amount);
    }
    
    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setCustomAmount(value);
            const numValue = parseInt(value, 10);
            setSelectedAmount(isNaN(numValue) ? null : numValue);
        }
    }

    return (
        <div className="container mx-auto max-w-2xl p-4 md:p-8">
             <Button asChild variant="ghost" size="icon" className="mb-4">
                <Link href="/dashboard">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back to App</span>
                </Link>
            </Button>
            <Card className="shadow-lg">
                <CardHeader className="text-center items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Support the Platform</CardTitle>
                    <CardDescription className="max-w-md">
                        This platform is free and built to provide a safe space for emotional expression. If you find it helpful, you may choose to support its development.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <Separator />
                    <section className="space-y-4 text-center">
                        <h2 className="text-xl font-bold font-headline">Your Support Matters</h2>
                        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                            Voluntary contributions from users like you help cover server costs, infrastructure, moderation systems, and allow for continued maintenance and improvements. Donating is completely optional, and all core features of the platform will always remain free for everyone.
                        </p>
                    </section>
                    
                    <section className="space-y-4">
                         <h3 className="text-center font-semibold">Choose an amount (INR)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                           {donationAmounts.map(amount => (
                                <Button 
                                    key={amount}
                                    variant={selectedAmount === amount && !customAmount ? 'default' : 'outline'} 
                                    size="lg"
                                    onClick={() => handleAmountSelect(amount)}
                                >
                                    ₹{amount}
                                </Button>
                            ))}
                        </div>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input 
                                type="text"
                                placeholder="Custom Amount"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                                className="pl-6 text-center"
                            />
                        </div>
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleDonation}
                            disabled={isLoading || !selectedAmount || selectedAmount < 50}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Support with Stripe'}
                        </Button>
                    </section>
                    
                    <Separator />

                    <section className="text-center space-y-2">
                        <h3 className="font-semibold text-md">Trust & Privacy</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                           Payments are handled securely by Stripe, which charges a standard transaction fee. We do not store your card details. We also do not link donations to your vent content, mood data, or any other activity on the platform. All donations are voluntary and non-refundable.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
