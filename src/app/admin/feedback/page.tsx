"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db, adminDeleteFeedback } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import type { FeedbackItem } from "@/lib/types";
import {
  MessageSquareHeart,
  Star,
  Search,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDistanceToNow } from "date-fns";

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const feedbackQ = query(collection(db, "feedback"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      feedbackQ,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FeedbackItem[];
        setFeedbackList(fetched);
        setLoading(false);
      },
      (error) => {
        console.warn("Could not load feedback:", error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDeleteFeedback = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      await adminDeleteFeedback(id, user);
      toast({
        title: "Feedback Deleted",
        description: "The feedback entry has been removed.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: e.message || "Failed to delete feedback.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics
  const total = feedbackList.length;
  const avgRating = total
    ? (feedbackList.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total).toFixed(1)
    : "—";

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbackList.forEach((f) => {
      const r = Math.round(f.rating || 0);
      if (counts[r] !== undefined) counts[r]++;
    });
    return counts;
  }, [feedbackList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return feedbackList.filter((item) => {
      if (ratingFilter !== "all" && item.rating !== ratingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = item.text?.toLowerCase().includes(q);
        const matchesUser = item.userId?.toLowerCase().includes(q);
        if (!matchesText && !matchesUser) return false;
      }
      return true;
    });
  }, [feedbackList, ratingFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline flex items-center gap-2.5">
            <MessageSquareHeart className="w-7 h-7 text-primary" />
            <span>User Feedback Inbox</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review user ratings, comments, and suggestions submitted through the in-app feedback modal.
          </p>
        </div>
      </div>

      {/* KPI & Rating Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <Card className="flex flex-col justify-center items-center p-6 text-center border shadow-sm">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
            Average Score
          </span>
          <div className="text-4xl font-extrabold font-headline text-foreground flex items-center gap-2">
            <span>{avgRating}</span>
            <span className="text-lg text-muted-foreground font-normal">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  avgRating !== "—" && i < Math.round(Number(avgRating))
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground mt-2">
            Based on {total} total user submission{total === 1 ? "" : "s"}
          </span>
        </Card>

        {/* Rating Breakdown Bars */}
        <Card className="md:col-span-2 p-6 border shadow-sm flex flex-col justify-center">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-3">
            Star Rating Distribution
          </span>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars] || 0;
              const pct = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-medium flex items-center gap-1 shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-muted-foreground text-[11px] shrink-0">
                    {count} ({Math.round(pct)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-4 rounded-xl border border-border/50">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Filter Stars:</span>
          {(["all", 5, 4, 3, 2, 1] as const).map((r) => (
            <Button
              key={String(r)}
              variant={ratingFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRatingFilter(r)}
              className="h-8 px-2.5 text-xs"
            >
              {r === "all" ? "All" : `${r} ★`}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search feedback text…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Feedback Items List */}
      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Loading user feedback…</span>
          </div>
        </Card>
      ) : filteredList.length === 0 ? (
        <Card className="glass-card text-center p-12 border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">No Feedback Found</CardTitle>
          <CardDescription className="text-xs mt-1">
            No feedback entries match your current filter criteria.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <Card key={item.id} className="border border-border/60 hover:border-border transition-all flex flex-col justify-between">
              <CardHeader className="p-4 sm:p-5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 text-xs font-semibold">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {item.rating}/5
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      UID: {item.userId?.slice(0, 10)}…
                    </span>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    {item.timestamp
                      ? formatDistanceToNow((item.timestamp as Timestamp).toDate(), { addSuffix: true })
                      : ""}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0 flex-1">
                <div className="bg-muted/40 p-3.5 rounded-lg border border-border/30 h-full">
                  <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed break-words">
                    &quot;{item.text}&quot;
                  </p>
                </div>
              </CardContent>

              <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-border/30 mt-2">
                <a
                  href={`https://console.firebase.google.com/project/studio-6635404237-5ab92/firestore/databases/-default-/data/~2Ffeedback~2F${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <span>Firebase Record</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Feedback Entry?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs">
                        This feedback submission will be permanently removed from Firestore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
