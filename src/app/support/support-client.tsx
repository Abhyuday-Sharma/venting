'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, Sparkles } from 'lucide-react';

export default function SupportClient() {
    return (
        <div className="container mx-auto max-w-2xl p-4 md:p-8">
            <Button asChild variant="ghost" size="icon" className="mb-4">
                <Link href="/feed">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back to feed</span>
                </Link>
            </Button>
            <Card className="shadow-lg border-primary/20 bg-card/60 backdrop-blur-sm">
                <CardHeader className="text-center items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Support Venting</CardTitle>
                    <CardDescription className="max-w-md">
                        This platform is built to provide a safe, free space for emotional expression.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center py-6">
                    <div className="p-6 rounded-xl bg-accent/30 border border-border/50 max-w-lg mx-auto space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                            <Sparkles className="w-3 h-3" />
                            Contributions Paused
                        </span>
                        <h3 className="text-lg font-semibold text-foreground">Direct Support is Temporarily Unavailable</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We are currently updating our payment systems. In the meantime, Venting remains completely free, private, and open for everyone.
                        </p>
                        <p className="text-xs text-muted-foreground pt-2">
                            The best way to support us right now is to share Venting with someone who might need a safe space to express what they are going through.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-center">
                        <Button asChild variant="default">
                            <Link href="/feed">
                                Back to Public Feed
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
