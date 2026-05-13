
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getVentsForUser, resetMoodLogs } from "@/lib/firebase";
import type { Vent } from "@/lib/types";
import { MoodChart } from "./mood-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, ChevronLeft, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

export function MoodTracksClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vents, setVents] = useState<Vent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = getVentsForUser(user.uid, (userVents) => {
        setVents(userVents);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const { moodLogs } = useMemo(() => {
    const moodLogs = vents.filter(vent => !vent.text || vent.text.trim().length === 0);
    return { moodLogs };
  }, [vents]);

  const handleResetMoodTracks = async () => {
    if (!user) return;

    try {
      await resetMoodLogs(user.uid);
      // The onSnapshot listener will automatically update the UI.
      toast({
        title: "Mood Tracks Reset",
        description: "All of your daily mood check-ins have been deleted.",
      });
    } catch (error) {
      console.error("Error resetting mood tracks:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Could not reset your mood tracks. Please try again.",
      });
    }
  };

  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline">{user?.username}'s Mood Tracks</h1>
                <p className="text-muted-foreground">A history of your daily mood check-ins.</p>
            </div>
             <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard"><ChevronLeft className="mr-2 h-4 w-4"/>Back to Dashboard</Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={moodLogs.length === 0}>
                            <Trash2 className="mr-2" /> Reset Mood Tracks
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all your mood track history. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetMoodTracks} className="bg-destructive hover:bg-destructive/90">
                            Delete All
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

        {moodLogs.length > 0 ? (
            <MoodChart 
                vents={moodLogs} 
                chartTitle="Daily Mood Check-in History"
                chartDescription="A visualization of your mood logs over time."
            />
        ) : (
            <Card className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                        <BarChart3 className="mr-2 h-8 w-8 text-muted-foreground" />
                        No Mood Tracks Yet
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        You haven't logged any quick mood check-ins. They will appear here once you do.
                    </p>
                    <Link href="/dashboard" className="text-sm text-primary hover:underline">
                        Return to Dashboard
                    </Link>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
