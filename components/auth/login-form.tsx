
"use client";

import { useState } from 'react';
import { 
  signInWithRedirect, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

  const isSignUpButtonDisabled = !!loading || !agreedToTerms || !agreedToPolicy;


  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  }

  const handleGoogleSignIn = () => {
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
      
    // This initiates the redirect. The user will be sent to Google to sign in.
    // The browser will navigate away, so we don't 'await' it.
    // The result is handled in the AuthProvider when the user returns to the app.
    signInWithRedirect(auth, provider).catch(error => {
      console.error("Google Sign-In Initiation Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Could not start the sign-in process. Please check your connection and try again.",
      });
      setLoading(null);
    });
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
    <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
        <Card className="w-full max-w-sm z-10 shadow-2xl bg-background/80 backdrop-blur-sm">
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
