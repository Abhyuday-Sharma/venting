

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db, changeUsername, deleteUserAccount, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { moderateImage } from "@/ai/flows/ai-image-moderation";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PrivacyPolicyText, TermsOfServiceText } from "@/components/auth/legal-text";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "./theme-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function SettingsForm() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [defaultPostingMode, setDefaultPostingMode] = useState('private');
  const [language, setLanguage] = useState('en-US');
  const [disableMoodTracking, setDisableMoodTracking] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameCooldownDays, setUsernameCooldownDays] = useState(0);

  useEffect(() => {
    if (user) {
        setNewPhotoURL(user.photoURL || '');
        setProfileVisibility(user.settings?.profileVisibility || 'public');
        setDefaultPostingMode(user.settings?.defaultPostingMode || 'private');
        setLanguage(user.settings?.language || 'en-US');
        setDisableMoodTracking(user.settings?.disableMoodTracking || false);
        setNewUsername(user.username || '');
        if (user.usernameLastChanged) {
            const lastChangedDate = (user.usernameLastChanged as Timestamp).toDate();
            const now = new Date();
            const thirtyDaysFromChange = new Date(lastChangedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            if (now < thirtyDaysFromChange) {
                const remainingDays = Math.ceil((thirtyDaysFromChange.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                setUsernameCooldownDays(remainingDays);
            } else {
                 setUsernameCooldownDays(0);
            }
        } else {
            setUsernameCooldownDays(0);
        }
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleSettingChange = (setting: { [key: string]: string | boolean }) => {
    if (!user) return;
    setIsSubmitting(true);
    const userDocRef = doc(db, 'users', user.uid);
    const updatedSettings = {
      settings: {
        ...(user.settings || {}),
        ...setting,
      }
    };

    updateDoc(userDocRef, updatedSettings)
      .then(() => {
        toast({ title: "Setting Saved", description: "Your preference has been updated." });
      })
      .catch(async (serverError) => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updatedSettings,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error saving setting:", serverError);
            toast({ variant: "destructive", title: "Save Failed", description: serverError.message });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: 'Please select an image smaller than 2MB.'
            });
            return;
        }
        setSelectedFile(file);
        setNewPhotoURL(URL.createObjectURL(file)); // Create a temporary URL for preview
    }
  };

  const handlePhotoUpload = async () => {
    if (!user || !auth.currentUser || !selectedFile) {
        return;
    }

    setIsSubmitting(true);
    let storagePath = '';
    const userDocRef = doc(db, 'users', user.uid);
    let updateData = {};

    try {
        // Upload to storage
        storagePath = `avatars/${user.uid}/${selectedFile.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, selectedFile);
        const uploadedUrl = await getDownloadURL(storageRef);

        // Moderate image
        const moderationResult = await moderateImage({ imageUrl: uploadedUrl });

        if (!moderationResult.isSafe) {
            toast({
                variant: "destructive",
                title: "Inappropriate Image",
                description: moderationResult.reason || "This image cannot be used as it violates content policy."
            });
            // Delete the inappropriate image from storage
            await deleteObject(storageRef);
            throw new Error("Image moderation failed.");
        }

        // Update profile
        await updateProfile(auth.currentUser, { photoURL: uploadedUrl });
        
        updateData = { photoURL: uploadedUrl };
        await updateDoc(userDocRef, updateData);

        toast({ title: "Success!", description: "Your profile picture has been updated." });
        setSelectedFile(null); // Reset file input
        setNewPhotoURL(uploadedUrl); // Update state to permanent URL

    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error updating profile picture:", error);
            if (error.message !== "Image moderation failed.") {
                 toast({ variant: "destructive", title: "Update Failed", description: error.message || "Could not update your profile picture." });
            }
            // Reset preview to old photo URL if upload fails
            setNewPhotoURL(user.photoURL || '');
            setSelectedFile(null);
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const validateUsername = (uname: string) => {
    if (uname.length < 3) return "Username must be at least 3 characters long.";
    if (uname.length > 20) return "Username must be at most 20 characters long.";
    if (!/^[a-zA-Z0-9_.]+$/.test(uname)) return "Can only contain letters, numbers, underscores, and periods.";
    if (uname.includes(' ')) return "Username cannot contain spaces.";
    if (uname.startsWith('.') || uname.endsWith('.')) return "Cannot start or end with a period.";
    return null;
  };

  const handleUsernameChange = async () => {
    if (!user || !user.username) return;

    if (usernameCooldownDays > 0) {
        setUsernameError(`You can change your username again in ${usernameCooldownDays} day(s).`);
        return;
    }

    setUsernameError(null);
    const validationError = validateUsername(newUsername);
    if (validationError) {
        setUsernameError(validationError);
        return;
    }

    if (newUsername.toLowerCase() === user.username.toLowerCase()) {
        setIsUsernameDialogOpen(false);
        return;
    }

    setIsSubmitting(true);
    try {
        await changeUsername(user.uid, user.username, newUsername);
        toast({ title: "Username Changed!", description: `Your new username is ${newUsername}.`});
        setIsUsernameDialogOpen(false);
    } catch(error: any) {
        console.error("Error changing username:", error);
        setUsernameError(error.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        await deleteUserAccount(user);
        toast({ title: "Account Deleted", description: "Your account has been permanently removed." });
        // The onAuthStateChanged listener will handle the redirect to /login
    } catch (error: any) {
        console.error("Error deleting account:", error);
        toast({ variant: "destructive", title: "Deletion Failed", description: error.message || "Could not delete your account."});
        setIsSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and platform preferences.</p>
      </div>

       {user.hasSupported && (
          <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Heart className="h-5 w-5 text-primary"/>
                  <div>
                      <CardTitle className="text-base text-primary">Thank you for your support</CardTitle>
                      <CardDescription className="text-xs">
                          Your contribution helps keep this platform running and free for everyone.
                      </CardDescription>
                  </div>
              </CardHeader>
          </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account & Profile</CardTitle>
          <CardDescription>Control your identity, access, and how you appear on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

           <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-end gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={newPhotoURL ?? ''} alt={user.username ?? 'User'} />
                    <AvatarFallback className="text-2xl">{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center gap-2">
                    <Input
                        id="photoUrl"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleFileSelect}
                        className="flex-1 p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 file:h-10 file:px-4 file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:text-sm file:font-medium hover:file:bg-accent hover:file:text-accent-foreground"
                        disabled={isSubmitting}
                    />
                    <Button onClick={handlePhotoUpload} disabled={isSubmitting || !selectedFile}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Save"}
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">Upload a new profile picture. Max 2MB.</p>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <Input id="username" value={user.username ?? ""} disabled />
               <AlertDialog open={isUsernameDialogOpen} onOpenChange={setIsUsernameDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={isSubmitting || usernameCooldownDays > 0}>Change</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Username</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter your new username. This can only be done once every 30 days.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="new-username">New Username</Label>
                        <Input id="new-username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                         {usernameError && <p className="text-sm text-destructive">{usernameError}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUsernameChange} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Username"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
             {usernameCooldownDays > 0 ? (
                <p className="text-xs text-muted-foreground">You can change your username again in {usernameCooldownDays} day(s).</p>
            ) : (
                <p className="text-xs text-muted-foreground">Your unique username on the platform.</p>
            )}
          </div>
          
          <Separator />

          <div className="space-y-4">
            <Label>Profile Visibility</Label>
            <RadioGroup 
                value={profileVisibility} 
                onValueChange={(value: 'public' | 'anonymous') => {
                    setProfileVisibility(value);
                    handleSettingChange({ profileVisibility: value });
                }}
                disabled={isSubmitting}
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="vis-public" />
                    <Label htmlFor="vis-public" className="font-normal">Public</Label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">Your username and avatar are visible on your public vents.</p>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anonymous" id="vis-anonymous" />
                    <Label htmlFor="vis-anonymous" className="font-normal">Anonymous</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Your username and avatar are hidden on all your public content.</p>
            </RadioGroup>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <Label>Default Posting Mode</Label>
            <RadioGroup 
                value={defaultPostingMode} 
                onValueChange={(value: 'private' | 'public') => {
                    setDefaultPostingMode(value);
                    handleSettingChange({ defaultPostingMode: value });
                }}
                disabled={isSubmitting}
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="mode-private" />
                    <Label htmlFor="mode-private" className="font-normal">Private vents by default</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="mode-public" />
                    <Label htmlFor="mode-public" className="font-normal">Public vents by default</Label>
                </div>
            </RadioGroup>
          </div>
          
          <Separator />

          <div className="space-y-2">
            <Label>Language Preference</Label>
              <Select 
                  value={language}
                  onValueChange={(value: string) => {
                      setLanguage(value);
                      handleSettingChange({ language: value });
                  }}
                  disabled={isSubmitting}
              >
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                      <SelectItem value="es-ES">Español (España)</SelectItem>
                      <SelectItem value="fr-FR">Français (France)</SelectItem>
                  </SelectContent>
              </Select>
            <p className="text-xs text-muted-foreground">This sets your preferred language for features like Speech-to-Text.</p>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Daily Mood Check-ins</Label>
                <p className="text-sm text-muted-foreground">Prompt me to log my mood every 12 hours.</p>
              </div>
              <Switch 
                checked={!disableMoodTracking} 
                onCheckedChange={(checked) => {
                  setDisableMoodTracking(!checked);
                  handleSettingChange({ disableMoodTracking: !checked });
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Theme</Label>
            <ThemeToggle />
            <p className="text-xs text-muted-foreground">Select your preferred color theme for the application.</p>
          </div>

          <Separator />

           <div className="space-y-2">
            <Label>Connected Accounts</Label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 py-2">
              <p className="text-sm font-medium text-muted-foreground">Google</p>
            </div>
          </div>

          <Separator />
          
           <div className="space-y-2">
            <Label>Legal</Label>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="terms">
                <AccordionTrigger>Terms of Service</AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-60 w-full rounded-md border p-4">
                    <TermsOfServiceText />
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="privacy">
                <AccordionTrigger>Privacy Policy</AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-60 w-full rounded-md border p-4">
                    <PrivacyPolicyText />
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <Separator />
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push('/support')} disabled={isSubmitting}>
              <Heart className="mr-2 h-4 w-4" /> Support Platform
            </Button>
            <Button variant="outline" onClick={handleSignOut} disabled={isSubmitting}>Log Out</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isSubmitting}>Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your account, vents, and all associated data. This action is irreversible.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete my account"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
