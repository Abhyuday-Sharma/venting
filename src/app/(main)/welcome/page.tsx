"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Heart, Edit3, Shield, Smartphone } from "lucide-react";

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const completeOnboarding = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { hasCompletedOnboarding: true });
      router.push("/vent");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // Even if update fails, we should let them proceed
      router.push("/vent");
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4 sm:p-8 animated-gradient">
      <div className="w-full max-w-lg mx-auto relative h-[400px] flex items-center justify-center">
        
        {/* Step 0: Welcome */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${step === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
          <h1 className="text-4xl sm:text-5xl font-headline text-center mb-6">
            Welcome, <span className="text-primary">{user.displayName || user.username || 'Friend'}</span>.
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            This is your space.
          </p>
          <Button size="lg" variant="ghost" onClick={nextStep} className="rounded-full px-8 border border-border/40 dark:border-white/10 bg-card/60 dark:bg-white/[0.06] backdrop-blur-md text-foreground hover:bg-card/80 dark:hover:bg-white/[0.12] hover:text-foreground hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer">
            Begin
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Step 1: Vent Privately */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${step === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-headline text-center mb-4">Vent Privately</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-sm">
            Everything you write is private by default. Let go of your thoughts without judgment.
          </p>
          <Button size="lg" variant="ghost" onClick={nextStep} className="rounded-full px-8 border border-border/40 dark:border-white/10 bg-card/60 dark:bg-white/[0.06] backdrop-blur-md text-foreground hover:bg-card/80 dark:hover:bg-white/[0.12] hover:text-foreground hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer">
            Next
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Step 2: Share when ready */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${step === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <div className="h-20 w-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-orange-500" />
          </div>
          <h2 className="text-3xl font-headline text-center mb-4">Share when ready</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-sm">
            Connect with a supportive community. Share anonymously, or with your username.
          </p>
          <Button size="lg" variant="ghost" onClick={nextStep} className="rounded-full px-8 border border-border/40 dark:border-white/10 bg-card/60 dark:bg-white/[0.06] backdrop-blur-md text-foreground hover:bg-card/80 dark:hover:bg-white/[0.12] hover:text-foreground hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer">
            Next
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Step 3: Add to Homescreen */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${step === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
            <Smartphone className="h-10 w-10 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-headline text-center mb-4">Add to Home Screen</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-sm">
            For easy app-like access, tap the Share button in your browser and select "Add to Home Screen".
          </p>
          <Button size="lg" variant="ghost" onClick={nextStep} className="rounded-full px-8 border border-border/40 dark:border-white/10 bg-card/60 dark:bg-white/[0.06] backdrop-blur-md text-foreground hover:bg-card/80 dark:hover:bg-white/[0.12] hover:text-foreground hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer">
            Next
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Step 4: Write your first thought */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
           <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
            <Edit3 className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-headline text-center mb-4">Track your mood</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-sm">
            Check in with yourself every day and build a timeline of your emotional health.
          </p>
          <Button size="lg" onClick={completeOnboarding} className="rounded-full px-10 py-6 text-lg font-medium shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground">
            Write your first thought
          </Button>
        </div>

      </div>
      
      {/* Progress Dots */}
      <div className="absolute bottom-12 flex space-x-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-primary' : 'w-2 bg-primary/30'}`} 
          />
        ))}
      </div>
    </div>
  );
}
