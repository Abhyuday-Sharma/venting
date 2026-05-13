
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (e: Error) => {
      if (process.env.NODE_ENV === 'development') {
        // In dev, throw to use the Next.js overlay for rich errors
        throw e;
      } else {
        // In production, log to console and show a user-friendly toast
        console.error("Caught Firestore Permission Error:", e.message);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You do not have permission to perform this action.",
        });
      }
    };

    const unsubscribe = errorEmitter.on('permission-error', handleError);

    return () => {
      unsubscribe(); // Cleanup the listener
    };
  }, [toast]);

  return null;
}
