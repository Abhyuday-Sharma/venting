
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
import { deleteDoc, doc, getDoc, Timestamp, collection, query, orderBy, onSnapshot, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
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
import { ReflectionPromptCard } from "@/components/dashboard/reflection-prompt-card";
import { MoodInsightsCard } from "@/components/dashboard/mood-insights-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ModDashboardClient } from "@/components/dashboard/mod-dashboard-client";
import { useStaggerAnimate } from "@/hooks/use-anime";

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const containerRef = useStaggerAnimate<HTMLDivElement>(".dash-item", { delayStagger: 100 });
  const [vents, setVents] = useState<Vent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const [goals, setGoals] = useState<any[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (user?.uid) {
      const q = query(collection(db, "users", user.uid, "goals"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userGoals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGoals(userGoals);
        setLoadingGoals(false);
      });
      return () => unsubscribe();
    } else if (!user) {
      try {
        const localGoalsRaw = localStorage.getItem('guest_goals');
        if (localGoalsRaw) {
          setGoals(JSON.parse(localGoalsRaw));
        } else {
          setGoals([]);
        }
      } catch (e) {
        console.error("Failed to load guest goals:", e);
      }
      setLoadingGoals(false);
    }
  }, [user?.uid, authLoading]);

  const handleToggleGoal = async (goalId: string, currentCompleted: boolean) => {
    try {
      if (user) {
        const goalRef = doc(db, "users", user.uid, "goals", goalId);
        await updateDoc(goalRef, { completed: !currentCompleted });
      } else {
        const localGoalsRaw = localStorage.getItem('guest_goals');
        if (localGoalsRaw) {
          const parsed = JSON.parse(localGoalsRaw);
          const updated = parsed.map((g: any) => g.id === goalId ? { ...g, completed: !currentCompleted } : g);
          localStorage.setItem('guest_goals', JSON.stringify(updated));
          setGoals(updated);
        }
      }
    } catch (e) {
      console.error("Error toggling goal completed state:", e);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      if (user) {
        const goalRef = doc(db, "users", user.uid, "goals", goalId);
        await deleteDoc(goalRef);
      } else {
        const localGoalsRaw = localStorage.getItem('guest_goals');
        if (localGoalsRaw) {
          const parsed = JSON.parse(localGoalsRaw);
          const filtered = parsed.filter((g: any) => g.id !== goalId);
          localStorage.setItem('guest_goals', JSON.stringify(filtered));
          setGoals(filtered);
        }
      }
      toast({
        title: "Goal Removed",
        description: "Your micro-goal has been removed.",
      });
    } catch (e) {
      console.error("Error deleting goal:", e);
    }
  };

  console.log("DashboardClient Render:", { authLoading, loading, user: user?.uid || null });

  useEffect(() => {
    if (authLoading) return;

    if (user?.uid) {
      setLoading(true);
      const unsubscribe = getVentsForUser(user.uid, (userVents) => {
        setVents(userVents);
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!user) {
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
  }, [user?.uid, authLoading]);

  useEffect(() => {
    try {
      const endSessionTrigger = sessionStorage.getItem('acknowledgementTrigger');
      if (endSessionTrigger === 'true') {
        setShowAcknowledgement(true);
        setShowReflection(true);
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

  if (user && (user.role === 'owner' || user.role === 'moderator')) {
    return <ModDashboardClient />;
  }

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
      <div ref={containerRef} className="container mx-auto p-4 md:p-8 space-y-8">
        {!user && (
          <Alert className="dash-item border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-300">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-sm font-semibold">Explore Mode</AlertTitle>
            <AlertDescription className="text-xs">
              You are exploring the dashboard as a guest. These reflections are only saved on this device. <Link href="/login" className="underline font-medium hover:text-amber-800 dark:hover:text-amber-200">Sign in</Link> to back up your vents, share with the community, and write unlimited entries.
            </AlertDescription>
          </Alert>
        )}
        {vents.length === 0 ? (
          <div className="dash-item text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card/50">
            <h2 className="text-2xl font-semibold mb-2 font-headline">I&apos;m glad you came, {user?.username || 'Guest'}!</h2>
            <p className="text-muted-foreground mb-6">You haven&apos;t recorded any vents yet. Let it all out!</p>
            <Button asChild size="lg">
              <Link href="/vent"><PlusCircle className="mr-2 h-4 w-4" />Create Your First Vent</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="dash-item space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">{user?.username || 'Guest'}&apos;s Reflections</h1>
                <p className="text-sm text-muted-foreground">Visualize your mood trends from written vents and review your history.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={writtenVents.length === 0}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Reset Reflections
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
                  <Link href="/dashboard/mood-tracks"><BarChart3 className="mr-1.5 h-3.5 w-3.5"/>View Mood Tracks</Link>
                </Button>
              </div>
            </div>
            {user && showReflection && writtenVents.length > 0 && (
              <div className="dash-item">
                <ReflectionPromptCard vent={writtenVents[0]} />
              </div>
            )}

            {/* Pinned Micro-Goals Checklist */}
            <Card className="dash-item bg-card/50 backdrop-blur-sm border border-border/50 shadow-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Your 5-Minute Micro-Goals
                  </CardTitle>
                  <CardDescription className="text-xs">Small steps you committed to during reflection.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {goals.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">No active micro-goals right now. Try generating one after your next vent.</p>
                ) : (
                  <div className="space-y-2">
                    {goals.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleToggleGoal(goal.id, goal.completed)} className="text-muted-foreground hover:text-primary transition-colors focus:outline-none">
                            {goal.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
                          </button>
                          <span className={cn("text-sm transition-all text-left", goal.completed && "line-through text-muted-foreground")}>{goal.text}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="dash-item">
              <MoodChart vents={writtenVents} chartTitle="Vent Mood Journey" chartDescription="A visualization of your moods from written vents." />
            </div>
            {user && (
              <div className="dash-item">
                <MoodInsightsCard vents={writtenVents} user={user} />
              </div>
            )}
            <div className="dash-item">
              <VentHistory vents={writtenVents} onDeleteVent={handleDeleteVent} />
            </div>
          </>
        )}
      </div>
      <EndSessionAcknowledgement show={showAcknowledgement} onDismiss={() => setShowAcknowledgement(false)} />
    </>
  );
}
