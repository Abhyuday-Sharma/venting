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

interface SafetySupportModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAcknowledge?: () => void;
  /** The vent was meant to be public but is being kept private. */
  savedPrivately?: boolean;
}

const helplines = [
  { region: 'India — Tele-MANAS (Govt. of India)', number: '14416', detail: 'free, 24/7, in many Indian languages.' },
  { region: 'India — iCall', number: '9152987821', detail: 'free, confidential counselling.' },
  { region: 'USA — 988 Suicide & Crisis Lifeline', number: '988', detail: 'call or text, free and confidential, 24/7.' },
  { region: 'UK — Samaritans', number: '116 123', detail: 'free, any time of day or night.' },
];

export function SafetySupportModal({ open: controlledOpen, onOpenChange: controlledOnOpenChange, onAcknowledge, savedPrivately }: SafetySupportModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const pathname = usePathname();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen);
    }
  };

  useEffect(() => {
    if (isControlled) return;
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
  }, [pathname, isControlled]);

  const handleAcknowledge = () => {
    if (onAcknowledge) {
      onAcknowledge();
    } else {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl h-[85vh] md:h-auto overflow-y-auto sm:rounded-2xl border-orange-100 dark:border-orange-950/30 shadow-2xl">
        <AlertDialogHeader className="items-center text-center">
          <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
            <HeartHandshake className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-2xl font-headline text-balance">
            We care about you, and you are not alone.
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2 text-balance">
            It sounds like you are carrying something really heavy right now. Before anything else, please pause for a moment and talk to someone trained to help. A counsellor or helpline is free, confidential, and there for you right now.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p className="text-sm text-center font-medium text-foreground bg-orange-50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 rounded-xl px-4 py-3">
          If you might act on these thoughts or you are in danger right now, call your local emergency number: <a href="tel:112" className="underline">112</a> in India, <a href="tel:911" className="underline">911</a> in the US, <a href="tel:999" className="underline">999</a> in the UK.
        </p>

        <div className="space-y-3 py-2">
            {helplines.map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number.replace(/\s/g, '')}`}
                className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border/50 hover:bg-muted transition-colors"
              >
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-sm">{line.region}</h4>
                    <p className="text-sm text-muted-foreground">Call <span className="font-bold text-foreground">{line.number}</span>, {line.detail}</p>
                </div>
              </a>
            ))}

            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border/50 hover:bg-muted transition-colors"
            >
                <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-sm">Everywhere else — Find a Helpline</h4>
                    <p className="text-sm text-muted-foreground">Visit <span className="font-bold text-foreground">findahelpline.com</span> to find free crisis support in your country.</p>
                </div>
            </a>
        </div>

        {savedPrivately && (
          <p className="text-xs text-center text-muted-foreground">
            Your vent will be saved privately. Only you can see it.
          </p>
        )}

        <AlertDialogFooter className="sm:justify-center gap-2 sm:flex-col-reverse">
          <AlertDialogAction asChild>
             <Button className="w-full rounded-xl" onClick={handleAcknowledge}>
                I understand, thank you
             </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
