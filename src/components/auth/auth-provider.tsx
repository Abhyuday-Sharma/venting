
"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, getRedirectResult, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, onSnapshot, setDoc, Unsubscribe } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribeAuth: Unsubscribe | undefined;
    let unsubscribeProfile: Unsubscribe | undefined;

    const initAuth = async () => {
      // First, handle the redirect result from Google Sign-In.
      // This completes the sign-in flow and allows onAuthStateChanged to get the correct user.
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // This toast confirms the redirect was successfully processed.
          toast({
            title: "Signed in successfully!",
            description: `Welcome, ${result.user.displayName}!`,
          });
        }
      } catch (error) {
        console.error("Google Sign-In Redirect Error:", error);
        toast({
          variant: "destructive",
          title: "Google Sign-In Failed",
          description: "There was an error completing your sign-in. Please try again.",
        });
      }

      // THEN, attach the onAuthStateChanged listener.
      // This will now correctly fire with the signed-in user after the redirect is complete.
      unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        // If a profile listener is already active, unsubscribe before creating a new one.
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }

        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          
          unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            const ownerEmails = ['mrsharmaabhyuday@gmail.com'];
            const adminEmails = ['ventingsupport@gmail.com'];
            const moderatorEmails = ['ventingmoderation@gmail.com'];
            const userEmail = firebaseUser.email || '';

            if (docSnap.exists()) {
              const data = docSnap.data();
              let expectedRole = data.role;
              if (!expectedRole) {
                if (ownerEmails.includes(userEmail)) expectedRole = 'owner';
                else if (moderatorEmails.includes(userEmail)) expectedRole = 'moderator';
                else if (adminEmails.includes(userEmail)) expectedRole = 'admin';
                else expectedRole = 'user';
              }

              const userProfile = {
                uid: docSnap.id,
                ...data,
                role: expectedRole,
              } as UserProfile;
              setUser(userProfile);
              setLoading(false);
            } else {
              // This is a new user, so their profile needs to be created.
              const { displayName, email, photoURL, uid } = firebaseUser;
              const ownerEmails = ['mrsharmaabhyuday@gmail.com'];
              const adminEmails = ['ventingsupport@gmail.com'];
              const moderatorEmails = ['ventingmoderation@gmail.com'];
              
              let role: 'owner' | 'admin' | 'moderator' | 'user' = 'user';
              const userEmail = email || '';

              if (ownerEmails.includes(userEmail)) {
                role = 'owner';
              } else if (moderatorEmails.includes(userEmail)) {
                role = 'moderator';
              } else if (adminEmails.includes(userEmail)) {
                role = 'admin';
              }

              const newUserProfile: UserProfile = {
                uid,
                email,
                displayName: displayName || email?.split('@')[0] || 'New User',
                photoURL: photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${email}`,
                username: null, // Username is set in a separate step.
                role,
                hasCompletedOnboarding: false,
              };
              
              // Set the new profile document. The onSnapshot listener will then fire again with the new data.
              setDoc(userDocRef, newUserProfile).catch(error => {
                console.error("Failed to create user profile:", error);
                auth.signOut(); // Sign out if profile creation fails.
              });
            }
          }, (error) => {
              console.error("Error fetching user profile:", error);
              setUser(null);
              setLoading(false);
          });

        } else {
          // If no Firebase user is signed in, clear our state.
          setUser(null);
          setLoading(false);
        }
      });
    };

    initAuth();

    // Clean up listeners on component unmount.
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [toast]);


  // This effect handles redirecting the user based on their authentication status and profile completeness.
  useEffect(() => {
    if (loading) {
      return; // Don't do anything while auth state is being determined.
    }

    const isAuthPage = pathname === "/login" || pathname === "/create-username";
    const protectedRoutes = ['/settings', '/moments', '/feedback', '/dashboard'];
    const isProtectedRoute = protectedRoutes.some(p => pathname.startsWith(p));

    if (!user) {
      // If user is not signed in and is trying to access a protected route, redirect to login.
      if (isProtectedRoute) {
        router.push("/login");
      }
    } else {
      if (!user.username && pathname !== "/create-username") {
        // If user is signed in but has no username, force them to the creation page.
        router.push("/create-username");
      } else if (user.username && user.hasCompletedOnboarding === false && pathname !== "/welcome") {
        // Force new users to complete the onboarding flow
        router.push("/welcome");
      } else if (user.username && user.hasCompletedOnboarding !== false && isAuthPage) {
        // If user is signed in, has a username, has completed onboarding, and is on an auth page, send them to the feed.
        const redirectTo = pathname.includes('showMoodCheckIn=true') ? '/feed?showMoodCheckIn=true' : '/feed';
        router.push(redirectTo);
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <Skeleton className="h-screen w-screen" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
