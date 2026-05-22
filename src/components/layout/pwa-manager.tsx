"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Share, PlusSquare, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// Detect if device is iOS
const isIos = () => {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Detect if running as standalone PWA
const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
};

export function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosInstruction, setShowIosInstruction] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Service worker registration failed:", err);
        });
      });
    }

    // 2. Do not show anything if already installed
    if (isStandalone()) {
      return;
    }

    // 3. Listen for Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a bit before showing to not disrupt initial page load
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Fallback for iOS
    if (isIos()) {
        const hasSeenIosPrompt = localStorage.getItem("hasSeenIosPwaPrompt");
        if (!hasSeenIosPrompt) {
            setTimeout(() => setShowIosInstruction(true), 5000);
        }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    setShowInstallBanner(false);
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }
    setDeferredPrompt(null);
  };

  const closeIosInstruction = () => {
      setShowIosInstruction(false);
      localStorage.setItem("hasSeenIosPwaPrompt", "true");
  }

  const closeInstallBanner = () => {
      setShowInstallBanner(false);
  }

  return (
    <>
      {/* Android / Chrome Install Banner */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed top-16 md:top-20 left-4 right-4 md:left-auto md:right-8 z-50 md:w-96 card-reveal glass-card rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h4 className="font-semibold text-sm">Install Venting App</h4>
                    <p className="text-xs text-muted-foreground">Add to home screen for the best experience.</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" onClick={handleInstallClick} className="w-full">
                    Install
                </Button>
                <Button size="sm" variant="ghost" onClick={closeInstallBanner} className="w-full h-8 text-xs">
                    Not Now
                </Button>
            </div>
        </div>
      )}

      {/* iOS Safari Install Drawer */}
      <div 
        className={cn(
            "fixed inset-x-0 bottom-0 z-[100] transform transition-transform duration-500 ease-out",
            showIosInstruction ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="bg-background/90 backdrop-blur-xl border-t border-border shadow-2xl rounded-t-[2rem] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={closeIosInstruction} className="rounded-full bg-muted/50 w-8 h-8">
                    <X className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="text-center mb-6">
                <div className="w-16 h-1 bg-muted mx-auto rounded-full mb-6" />
                <h3 className="font-bold text-lg mb-2">Install Venting App</h3>
                <p className="text-sm text-muted-foreground">
                    Get the full app experience directly on your iPhone.
                </p>
            </div>

            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Share className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm">
                        1. Tap the <span className="font-semibold">Share</span> button in Safari
                    </p>
                </div>
                <div className="w-px h-6 bg-border ml-5" />
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <PlusSquare className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm">
                        2. Scroll down and select <span className="font-semibold">Add to Home Screen</span>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
