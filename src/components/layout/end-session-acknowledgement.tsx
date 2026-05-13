'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EndSessionAcknowledgementProps {
  show: boolean;
  onDismiss: () => void;
}

export function EndSessionAcknowledgement({ show, onDismiss }: EndSessionAcknowledgementProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleDismiss = React.useCallback(() => {
    setIsVisible(false);
    // Allow fade-out animation to complete before calling parent's onDismiss
    setTimeout(() => {
      onDismiss();
    }, 500); // This duration should match the CSS transition duration
  }, [onDismiss]);

  useEffect(() => {
    let dismissTimer: NodeJS.Timeout;
    let showTimer: NodeJS.Timeout;
    if (show) {
      showTimer = setTimeout(() => setIsVisible(true), 100);
      dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 5000); // Auto-dismiss after 5 seconds
    }
    
    return () => {
        clearTimeout(showTimer);
        clearTimeout(dismissTimer);
    };
  }, [show, handleDismiss]);

  if (!show) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-label="Session acknowledgement"
      className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 cursor-pointer',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      onClick={handleDismiss}
    >
      <div
        className={cn(
          'bg-card border text-card-foreground shadow-xl p-4 rounded-lg text-center max-w-sm'
        )}
      >
        <p className="text-base font-semibold">
          You don’t have to stay.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Come back if you want.
        </p>
      </div>
    </div>
  );
}
