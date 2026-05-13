
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function CreateUsernameForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUsername = (uname: string) => {
    if (uname.length < 3) return "Username must be at least 3 characters long.";
    if (uname.length > 20) return "Username must be at most 20 characters long.";
    if (!/^[a-zA-Z0-9_.]+$/.test(uname)) {
      return "Can only contain letters, numbers, underscores, and periods.";
    }
    if (uname.includes(' ')) {
      return "Username cannot contain spaces.";
    }
    if (uname.startsWith('.') || uname.endsWith('.')) {
      return "Cannot start or end with a period.";
    }
    return null;
  };

  const handleCreateUsername = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to create a username." });
        return;
    }
    setLoading(true);
    setError(null);

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const lowerCaseUsername = username.toLowerCase();
    const userDocRef = doc(db, 'users', user.uid);
    const usernameDocRef = doc(db, 'usernames', lowerCaseUsername);

    try {
        await runTransaction(db, async (transaction) => {
            const usernameDoc = await transaction.get(usernameDocRef);
            if (usernameDoc.exists()) {
                throw new Error("This username is already taken. Please choose another.");
            }

            // 1. Reserve the username
            transaction.set(usernameDocRef, { uid: user.uid });
            
            // 2. Update the user's profile with the new username
            transaction.update(userDocRef, { 
                username: username,
                displayName: username, // Also update displayName
            });
        });

        // 3. Update the auth profile's displayName to match the username
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: username });
        }

        toast({ title: "Success!", description: "Your username has been set." });
        router.push('/welcome');

    } catch (err: any) {
        console.error("Username creation error", err);
        setError(err.message || "Could not create username. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle>Create Your Username</CardTitle>
            <CardDescription>Choose a unique username for your profile. This cannot be changed later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                    id="username" 
                    placeholder="your_unique_name" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                />
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>
            <Button onClick={handleCreateUsername} disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : "Save Username"}
            </Button>
        </CardContent>
    </Card>
  );
}
