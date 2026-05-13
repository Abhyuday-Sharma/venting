
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Vent } from "@/lib/types";
import { MoodCheckInModal } from "./mood-checkin-modal";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_STORAGE_KEY = 'moodCheckInShown';

export function MoodCheckInManager() {
  const { user, loading } = useAuth();
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const forbiddenPages = ['/login', '/create-username', '/about'];
    if (loading || !user || forbiddenPages.includes(pathname)) {
      return;
    }

    const showFromQuery = searchParams.get('showMoodCheckIn') === 'true';

    try {
      const hasBeenShownInSession = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';

      const isFirstTime = user.hasCompletedOnboarding && (!user.ventCount || user.ventCount === 0);

      if (showFromQuery) {
          if (isFirstTime) setIsFirstSession(true);
          setShowMoodCheckIn(true);
          sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      } else if (!hasBeenShownInSession) {
          if (isFirstTime) setIsFirstSession(true);
          
          const timer = setTimeout(() => {
              setShowMoodCheckIn(true);
              sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
          }, 500);

          return () => clearTimeout(timer);
      }
    } catch (error) {
        // sessionStorage is not available on the server, so we catch the error.
        // This effect will re-run on the client where sessionStorage is available.
        console.log("sessionStorage not available, will run on client.");
    }

  }, [user, loading, pathname, searchParams]);
  
  const handleMoodSaved = (newVent: Vent) => {
    // In the future, we could update a global state here if needed
    // For now, the modal handles the feedback itself.
  }

  const handleOpenChange = (isOpen: boolean) => {
    setShowMoodCheckIn(isOpen);
  }

  if (!user) {
    return null;
  }

  return (
    <MoodCheckInModal 
        isOpen={showMoodCheckIn} 
        onOpenChange={handleOpenChange} 
        user={user} 
        onMoodSaved={handleMoodSaved}
        isFirstSession={isFirstSession}
    />
  );
}
