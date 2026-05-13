'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HeartHandshake, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SafetySupportModal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if this needs to trigger
    try {
      const shouldShow = sessionStorage.getItem('showSupportMessage');
      if (shouldShow === 'true') {
        // Clear it so it doesn't repeat annoyingly, then show the modal
        sessionStorage.removeItem('showSupportMessage');
        
        // Tiny delay to ensure transitions are ready
        setTimeout(() => {
          setOpen(true);
        }, 800);
      }
    } catch (e) {
      /* Ignore session storage failures */
    }
  }, [pathname]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md sm:rounded-2xl border-orange-100 dark:border-orange-950/30 shadow-2xl">
        <AlertDialogHeader className="items-center text-center">
          <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
            <HeartHandshake className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-2xl font-headline text-balance">
            We care about you, and you are not alone.
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2 text-balance">
            It sounds like you are carrying a very heavy load right now. Please know there is support available to help you through this moment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
            <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border/50">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm">USA — 988 Suicide & Crisis Lifeline</h4>
                    <p className="text-sm text-muted-foreground">Call or text <span className="font-bold text-foreground">988</span> — free and confidential, 24/7.</p>
                </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border/50">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm">India — iCall</h4>
                    <p className="text-sm text-muted-foreground">Call <span className="font-bold text-foreground">9152987821</span> — free, confidential counselling.</p>
                </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border/50">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm">UK — Samaritans</h4>
                    <p className="text-sm text-muted-foreground">Call <span className="font-bold text-foreground">116 123</span> — free, available any time of day or night.</p>
                </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border/50">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm">Everywhere else — Find a Helpline</h4>
                    <p className="text-sm text-muted-foreground">Visit <span className="font-bold text-foreground">findahelpline.com</span> to find free crisis support in your country.</p>
                </div>
            </div>
        </div>

        <AlertDialogFooter className="sm:justify-center gap-2 sm:flex-col-reverse">
          <AlertDialogAction asChild>
             <Button className="w-full rounded-xl" onClick={() => setOpen(false)}>
                I understand, thank you
             </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
