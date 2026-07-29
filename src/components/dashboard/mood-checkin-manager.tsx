
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Vent } from "@/lib/types";
import { MoodCheckInModal } from "./mood-checkin-modal";
import { usePathname, useSearchParams } from "next/navigation";

const LOCAL_STORAGE_KEY = 'moodCheckInLastShown';

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

    if (user.settings?.disableMoodTracking) {
      return;
    }

    const showFromQuery = searchParams.get('showMoodCheckIn') === 'true';

    try {
      const lastShownTimestamp = localStorage.getItem(LOCAL_STORAGE_KEY);
      let canShow = true;

      if (lastShownTimestamp) {
          const lastTime = parseInt(lastShownTimestamp, 10);
          const timeSinceLastShow = Date.now() - lastTime;
          // 12 hours in milliseconds = 12 * 60 * 60 * 1000 = 43200000
          if (timeSinceLastShow < 43200000) {
              canShow = false;
          }
      }

      const isFirstTime = user.hasCompletedOnboarding && (!user.ventCount || user.ventCount === 0);

      if (showFromQuery) {
          if (isFirstTime) setIsFirstSession(true);
          setShowMoodCheckIn(true);
          localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
      } else if (canShow) {
          if (isFirstTime) setIsFirstSession(true);
          
          const timer = setTimeout(() => {
              setShowMoodCheckIn(true);
              localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
          }, 500);

          return () => clearTimeout(timer);
      }
    } catch (error) {
        // localStorage is not available on the server, so we catch the error.
        // This effect will re-run on the client where localStorage is available.
        console.log("localStorage not available, will run on client.");
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
