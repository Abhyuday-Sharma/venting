
"use client";

import { useState, useEffect } from 'react';
import { 
  signInWithRedirect, 
  signInWithPopup,
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';
import { LegalDocViewer } from './legal-doc-viewer';
import { Loader2 } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" role="img" aria-label="Google icon">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.35 6.53C12.55 13.43 17.86 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.13c4.51-4.18 7.09-10.36 7.09-17.78z" />
        <path fill="#FBBC05" d="M10.91 28.75c-.32-.97-.5-2.02-.5-3.12s.18-2.15.5-3.12l-8.35-6.53C.73 18.25 0 21.03 0 24s.73 5.75 2.56 8.28l8.35-6.53z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6.13c-2.15 1.45-4.92 2.3-8.16 2.3-6.14 0-11.44-4.18-13.23-9.8l-8.35 6.53C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
    </svg>
);

const Logo = () => (
  <Image
    src="/venting_logo.png"
    alt="Venting Logo"
    width={200}
    height={74}
    priority
    className="dark:invert"
  />
);

export function LoginForm() {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState<null | 'google' | 'email-signup' | 'email-signin'>(null);
  
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showLegal, setShowLegal] = useState<"terms" | "privacy" | null>(null);
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const quotes = [
    "You don't have to have it all figured out.",
    "It's okay to not be okay.",
    "Take a deep breath. You are safe here.",
    "Your feelings are valid.",
    "One day at a time.",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const isSignUpButtonDisabled = !!loading || !agreedToTerms || !agreedToPolicy;

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast({ variant: 'destructive', title: 'Enter your email', description: 'Please type your email address above.' });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSent(true);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Reset Failed', description: error.message });
    } finally {
      setResetLoading(false);
    }
  };


  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  }

  const handleGoogleSignIn = async () => {
    if (activeTab === 'signup' && (!agreedToTerms || !agreedToPolicy)) {
        toast({
            variant: "destructive",
            title: "Agreement Required",
            description: "You must accept the Terms and Conditions and Privacy Policy to continue.",
        });
        return;
    }
    setLoading('google');
    const provider = new GoogleAuthProvider();
      
    try {
      await signInWithPopup(auth, provider);
      // AuthProvider will detect the auth state change and handle redirection
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Could not complete the sign-in process. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleEmailSignIn = async () => {
     if (!signInEmail || !signInPassword) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please enter your email and password." });
      return;
    }
    setLoading('email-signin');
    try {
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      // AuthProvider will handle redirection.
    } catch (error: any) {
      console.error("Email Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message,
      });
    } finally {
      setLoading(null);
    }
  };
  
  const handleEmailSignUp = async () => {
    if (!agreedToTerms || !agreedToPolicy) {
      toast({
          variant: "destructive",
          title: "Agreement Required",
          description: "You must accept the Terms and Conditions and Privacy Policy to continue.",
      });
      return;
    }
     if (!signUpEmail || !signUpPassword) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please enter an email and password." });
      return;
    }

    setLoading('email-signup');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const user = userCredential.user;
      const defaultDisplayName = user.email?.split('@')[0] || 'User';
      const photoURL = `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`;

      await updateProfile(user, {
          displayName: defaultDisplayName,
          photoURL: photoURL
      });
      // The AuthProvider will now handle creating the database document and redirecting.
    } catch (error: any) {
      console.error("Email Sign-Up Error:", error);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    } finally {
      setLoading(null);
    }
  };


  return (
    <>
    <LegalDocViewer type={showLegal} onOpenChange={() => setShowLegal(null)} />
    <div className="absolute inset-0 animated-gradient -z-10" />
    <div className="relative w-full h-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 p-4">
        
        {/* Floating Quotes - Hidden on mobile, visible on large screens */}
        <div className="hidden lg:flex flex-col justify-center max-w-md w-full h-[300px]">
           <div className="relative h-32 w-full flex items-center justify-center text-center">
             {quotes.map((quote, idx) => (
               <p
                 key={idx}
                 className={`absolute text-3xl font-headline font-medium text-foreground/80 leading-snug transition-all duration-1000 ${
                   idx === quoteIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                 }`}
               >
                 "{quote}"
               </p>
             ))}
           </div>
        </div>

        <Card className="w-full max-w-sm z-10 glass-card">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <Logo />
                </div>
                <p className="font-medium text-foreground/80 tracking-wide pb-2">Express. Release. Reflect.</p>
                <CardDescription>A safe space for your thoughts. Sign in to continue.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Tabs defaultValue="signin" className="w-full" onValueChange={(value) => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">Email</Label>
                    <Input id="email-signin" type="email" placeholder="m@example.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required disabled={!!loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signin">Password</Label>
                    <Input id="password-signin" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required disabled={!!loading} />
                  </div>
                  <Button onClick={handleEmailSignIn} disabled={!!loading} className="w-full">
                      {loading === 'email-signin' ? <Loader2 className="animate-spin" /> : 'Sign In'}
                  </Button>

                  {/* Forgot Password */}
                  {!showForgotPassword ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center mt-1"
                      onClick={() => { setShowForgotPassword(true); setResetEmail(signInEmail); setResetSent(false); }}
                    >
                      Forgot password?
                    </button>
                  ) : resetSent ? (
                    <p className="text-xs text-center text-green-600 dark:text-green-400 mt-1">
                      ✓ Reset link sent! Check your inbox.
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={resetLoading}
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => setShowForgotPassword(false)}>Cancel</Button>
                        <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleForgotPassword} disabled={resetLoading}>
                          {resetLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Send Reset Link'}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" type="email" placeholder="m@example.com" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required disabled={!!loading}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required disabled={!!loading}/>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))} disabled={!!loading}/>
                        <Label htmlFor="terms" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I agree to the <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setShowLegal("terms")}>Terms and Conditions</Button>.
                        </Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="policy" checked={agreedToPolicy} onCheckedChange={(checked) => setAgreedToPolicy(Boolean(checked))} disabled={!!loading}/>
                        <Label htmlFor="policy" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I agree to the <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setShowLegal("privacy")}>Privacy Policy</Button>.
                        </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleDecline} disabled={!!loading}>Decline</Button>
                    <Button onClick={handleEmailSignUp} disabled={isSignUpButtonDisabled}>
                        {loading === 'email-signup' ? <Loader2 className="animate-spin" /> : 'Sign Up'}
                    </Button>
                  </div>

                </TabsContent>
              </Tabs>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {activeTab === 'signin' ? 'Or sign in with' : 'Or sign up with'}
                  </span>
                </div>
              </div>

              <Button variant="outline" onClick={handleGoogleSignIn} disabled={!!loading || (activeTab === 'signup' && isSignUpButtonDisabled)}>
                  {loading === 'google' ? <Loader2 className="animate-spin" /> : <><GoogleIcon /> {activeTab === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</>}
              </Button>
            </CardContent>
        </Card>
    </div>
    </>
  );
}
