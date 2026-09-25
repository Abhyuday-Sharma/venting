"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isAuthorizedAdminEmail } from "@/lib/admin-config";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Lock, LogOut, ArrowRight, Loader2, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [signingIn, setSigningIn] = useState(false);

  const handleAdminGoogleSignIn = async () => {
    setSigningIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Admin Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: error.message || "Failed to sign in with Google.",
      });
    } finally {
      setSigningIn(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut(auth);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-primary absolute -bottom-1 -right-1" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Verifying credentials…</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State: Show Admin Login Screen
  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-background via-muted/10 to-background relative">
        <div className="h-4" />

        {/* Center Login Card */}
        <div className="flex-1 flex items-center justify-center py-6">
          <Card className="w-full max-w-md border-border/60 shadow-2xl glass-card backdrop-blur-xl">
            <CardHeader className="text-center space-y-4 pb-4 pt-7 px-6">
              {/* Big Centered Venting Logo */}
              <div className="flex justify-center pb-1">
                <Image
                  src="/ventingmain.png"
                  alt="Venting Logo"
                  width={727}
                  height={213}
                  priority
                  className="w-52 sm:w-60 h-auto dark:invert drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight font-headline flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" />
                  <span>Command Center</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Admin
                  </span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Restricted portal for community moderation and operator review.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 px-6 pb-7">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Authorized platform administrators only. All access attempts are verified and recorded.
                </span>
              </div>

              <Button
                onClick={handleAdminGoogleSignIn}
                disabled={signingIn}
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-3 shadow-md"
              >
                {signingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Google…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="https://venting.in"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <span>Return to venting.in</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <footer className="w-full text-center py-2 text-xs text-muted-foreground">
          Venting &copy; {new Date().getFullYear()} &bull; Internal Platform Administration
        </footer>
      </div>
    );
  }

  // 3. Unauthorized User State: Logged in with an unauthorized email
  const isAuthorized =
    isAuthorizedAdminEmail(user.email) ||
    user.role === "owner" ||
    user.role === "admin" ||
    user.role === "moderator";

  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-background relative">
        <div className="h-4" />

        <div className="flex-1 flex items-center justify-center py-6">
          <Card className="w-full max-w-md border-destructive/40 shadow-xl glass-card">
            <CardHeader className="text-center space-y-4 pb-4 pt-7 px-6">
              {/* Big Centered Venting Logo */}
              <div className="flex justify-center pb-1">
                <Image
                  src="/ventingmain.png"
                  alt="Venting Logo"
                  width={727}
                  height={213}
                  priority
                  className="w-52 sm:w-60 h-auto dark:invert drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold font-headline text-destructive flex items-center justify-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-destructive" />
                  <span>403 &bull; Access Restricted</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  The signed-in account is not authorized for administrator access.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 px-6 pb-7">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">Operator Access Required:</p>
                <p className="text-muted-foreground leading-relaxed">
                  This command center is strictly restricted to designated platform operators. If you believe this is an error, please sign in with your administrative account.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleSwitchAccount}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign in with different account</span>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="https://venting.in/feed">Go to Public App</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="w-full text-center py-2 text-xs text-muted-foreground">
          Venting &copy; {new Date().getFullYear()} &bull; Internal Platform Administration
        </footer>
      </div>
    );
  }

  // 4. Authorized Operator: Render Admin App
  return <>{children}</>;
}
