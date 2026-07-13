
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db, getVentsForUser, resetWrittenVents } from "@/lib/firebase";
import type { Vent } from "@/lib/types";
import { VentHistory } from "@/components/dashboard/vent-history";
import { MoodChart } from "@/components/dashboard/mood-chart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, BarChart3, Trash2, Info } from "lucide-react";
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { useSearchParams } from "next/navigation";
import { EndSessionAcknowledgement } from "@/components/layout/end-session-acknowledgement";

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [vents, setVents] = useState<Vent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);

  console.log("DashboardClient Render:", { authLoading, loading, user: user?.uid || null });

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setLoading(true);
      const unsubscribe = getVentsForUser(user.uid, (userVents) => {
        setVents(userVents);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Load guest vents from localStorage
      try {
        const localVentsRaw = localStorage.getItem('guest_vents');
        if (localVentsRaw) {
          const parsed = JSON.parse(localVentsRaw);
          const mapped = parsed.map((v: any) => ({
            ...v,
            timestamp: v.timestamp ? new Date(v.timestamp) : new Date()
          }));
          setVents(mapped);
        } else {
          setVents([]);
        }
      } catch (e) {
        console.error("Failed to load guest vents:", e);
        setVents([]);
      }
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    try {
      const endSessionTrigger = sessionStorage.getItem('acknowledgementTrigger');
      if (endSessionTrigger === 'true') {
        setShowAcknowledgement(true);
        sessionStorage.removeItem('acknowledgementTrigger');
      }

      const supportMessageTrigger = sessionStorage.getItem('showSupportMessage');
      if (supportMessageTrigger === 'true') {
        toast({
            title: "This vent sounds heavy. You’re not alone.",
            description: "If you’re feeling unsafe, please consider reaching out to someone you trust or a local support service.",
            duration: 10000,
        });
        sessionStorage.removeItem('showSupportMessage');
      }
    } catch (e) {
      // sessionStorage is not available
    }
  }, [toast]);

  const { writtenVents } = useMemo(() => {
    const writtenVents = vents.filter(vent => vent.text && vent.text.trim().length > 0);
    return { writtenVents };
  }, [vents]);


  const handleDeleteVent = async (ventId: string) => {
    if (!user) {
      try {
        const localVentsRaw = localStorage.getItem('guest_vents');
        if (localVentsRaw) {
          const parsed = JSON.parse(localVentsRaw);
          const filtered = parsed.filter((v: any) => v.id !== ventId);
          localStorage.setItem('guest_vents', JSON.stringify(filtered));
          setVents(filtered.map((v: any) => ({
            ...v,
            timestamp: v.timestamp ? new Date(v.timestamp) : new Date()
          })));
          toast({
            title: "Vent Deleted",
            description: "Your local vent has been removed.",
          });
        }
      } catch (error) {
        console.error("Error deleting local vent:", error);
      }
      return;
    }
  
    const privateVentRef = doc(db, 'users', user.uid, 'vents', ventId);
    const publicVentRef = doc(db, 'publicVents', ventId);
  
    try {
      // Check if the public document exists before trying to delete it
      const publicDoc = await getDoc(publicVentRef);
      if (publicDoc.exists()) {
        await deleteDoc(publicVentRef);
      }
  
      // Delete the private vent
      await deleteDoc(privateVentRef);
  
      // Local state will be updated by the real-time listener.
  
      toast({
        title: "Vent Deleted",
        description: "Your vent has been successfully removed.",
      });
  
    } catch (error) {
      console.error("Error deleting vent:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the vent. Please try again.",
      });
    }
  };

  const handleResetReflections = async () => {
    if (!user) {
      localStorage.removeItem('guest_vents');
      setVents([]);
      toast({
        title: "Reflections Reset",
        description: "All of your local vents have been deleted.",
      });
      return;
    }

    try {
      await resetWrittenVents(user.uid);
      // The onSnapshot listener will automatically update the UI.
      toast({
        title: "Reflections Reset",
        description: "All of your written vents have been deleted.",
      });
    } catch (error) {
      console.error("Error resetting reflections:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Could not reset your reflections. Please try again.",
      });
    }
  };


  if (authLoading || loading) {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
            </div>
      </div>
    )
  }
  
  return (
    <>
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {!user && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-300">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-sm font-semibold">Explore Mode</AlertTitle>
            <AlertDescription className="text-xs">
              You are exploring the dashboard as a guest. These reflections are only saved on this device. <Link href="/login" className="underline font-medium hover:text-amber-800 dark:hover:text-amber-200">Sign in</Link> to back up your vents, share with the community, and write unlimited entries.
            </AlertDescription>
          </Alert>
        )}
        {vents.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card/50">
            <h2 className="text-2xl font-semibold mb-2 font-headline">I'm glad you came, {user?.username || 'Guest'}!</h2>
            <p className="text-muted-foreground mb-6">You haven't recorded any vents yet. Let it all out!</p>
            <Button asChild size="lg">
              <Link href="/vent"><PlusCircle className="mr-2 h-4 w-4" />Create Your First Vent</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold font-headline">{user?.username || 'Guest'}'s Reflections</h1>
                <p className="text-muted-foreground">Visualize your mood trends from written vents and review your history.</p>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={writtenVents.length === 0}>
                      <Trash2 className="mr-2" /> Reset Reflections
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your written vents. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetReflections} className="bg-destructive hover:bg-destructive/90">
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/mood-tracks"><BarChart3 className="mr-2"/>View Mood Tracks</Link>
                </Button>
              </div>
            </div>
            <MoodChart vents={writtenVents} chartTitle="Vent Mood Journey" chartDescription="A visualization of your moods from written vents." />
            <VentHistory vents={writtenVents} onDeleteVent={handleDeleteVent} />
          </>
        )}
      </div>
      <EndSessionAcknowledgement show={showAcknowledgement} onDismiss={() => setShowAcknowledgement(false)} />
    </>
  );
}
