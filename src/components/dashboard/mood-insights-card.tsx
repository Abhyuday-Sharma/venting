"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateMoodInsights } from "@/actions/ai";
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Activity, Lightbulb, AlertTriangle, Sparkles, Info, RefreshCw } from "lucide-react";
import type { Vent, UserProfile, MoodInsights } from "@/lib/types";
import { format } from "date-fns";
import { getDate } from "@/lib/date-utils";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface MoodInsightsCardProps {
  vents: Vent[];
  user: UserProfile;
  /** Has vented on more than one day; see isReturningUser. */
  isReturning: boolean;
}

const trendConfig = {
  improving: { label: "Improving", icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  stable: { label: "Stable", icon: Minus, className: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" },
  declining: { label: "Declining", icon: TrendingDown, className: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
  fluctuating: { label: "Fluctuating", icon: Activity, className: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // insights refresh at most once a week, on request, to preserve Groq quota

export function MoodInsightsCard({ vents, user, isReturning }: MoodInsightsCardProps) {
  // Load cached insights immediately from user profile or localStorage to prevent any Groq call on refresh
  const [insights, setInsights] = useState<MoodInsights | null>(() => {
    if (user.currentInsights) return user.currentInsights;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`mood_insights_${user.uid}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(() => {
    const fromUser = getDate(user.lastInsightGeneratedAt);
    if (fromUser) return fromUser;
    if (typeof window !== "undefined") {
      try {
        const cachedTime = localStorage.getItem(`mood_insights_time_${user.uid}`);
        if (cachedTime) return new Date(Number(cachedTime));
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const hasEnoughVents = vents.length >= 3;

  // Sync with user profile if it updates from Firestore
  useEffect(() => {
    if (user.currentInsights) {
      setInsights(user.currentInsights);
      try {
        localStorage.setItem(`mood_insights_${user.uid}`, JSON.stringify(user.currentInsights));
      } catch (e) {}
    }
    const fromUser = getDate(user.lastInsightGeneratedAt);
    if (fromUser) {
      setLastGeneratedAt(fromUser);
    }
  }, [user.currentInsights, user.lastInsightGeneratedAt, user.uid]);

  // Handle countdown timer for refresh cooldown
  useEffect(() => {
    if (!lastGeneratedAt) {
      setCooldownRemaining(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - lastGeneratedAt.getTime();
      const remaining = Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));
      setCooldownRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastGeneratedAt]);

  const nextRefreshLabel = lastGeneratedAt
    ? format(new Date(lastGeneratedAt.getTime() + COOLDOWN_MS), "MMM d")
    : null;

  const runInsightGeneration = async () => {
    if (loading || cooldownRemaining > 0) return;

    setLoading(true);
    setError(null);

    const ventData = vents.slice(0, 20).map((vent) => {
      const date = getDate(vent.timestamp);
      return {
        text: vent.text,
        mood: vent.mood,
        category: vent.category || "General",
        date: date ? format(date, "MMM d, yyyy") : "Unknown date",
      };
    });

    const result = await generateMoodInsights(ventData, user.username || 'Friend');

    if (result.success && result.data) {
      const now = new Date();
      setInsights(result.data);
      setLastGeneratedAt(now);

      try {
        localStorage.setItem(`mood_insights_${user.uid}`, JSON.stringify(result.data));
        localStorage.setItem(`mood_insights_time_${user.uid}`, now.getTime().toString());
        await updateDoc(doc(db, "users", user.uid), {
          currentInsights: result.data,
          lastInsightGeneratedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to save insights to profile:", e);
      }
    } else {
      if (!insights) {
        setError(result.error || "Failed to generate mood insights.");
      }
    }
    setLoading(false);
  };

  if (!hasEnoughVents || !isReturning) {
    const ventsNeeded = 3 - vents.length;
    return (
      <Card className="shadow-sm border-dashed border-primary/20 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-muted-foreground/50" />
            <CardTitle className="text-lg font-headline text-muted-foreground">AI Mood Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8 space-y-3">
          <BrainCircuit className="h-10 w-10 text-muted-foreground/20 mx-auto" />
          {!hasEnoughVents ? (
            <p className="text-sm text-muted-foreground">
              You need <strong>{ventsNeeded} more</strong> written {ventsNeeded === 1 ? 'vent' : 'vents'} to unlock AI mood insights.
              Venting needs a little more data to find meaningful patterns in your emotional journey.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Insights look for patterns over time, so they open up once you have written on more than one day.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const trend = insights ? trendConfig[insights.overallTrend] : null;
  const TrendIcon = trend?.icon;

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-headline">AI Mood Insights</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {trend && (
              <Badge variant="outline" className={trend.className}>
                {TrendIcon && <TrendIcon className="h-3.5 w-3.5 mr-1" />}
                {trend.label}
              </Badge>
            )}
            {insights && (
              <Button
                variant="outline"
                size="sm"
                onClick={runInsightGeneration}
                disabled={loading || cooldownRemaining > 0}
                className="h-8 text-xs border-primary/20 hover:bg-primary/5 transition-all"
                title={cooldownRemaining > 0 ? `Insights refresh once a week. Next update on ${nextRefreshLabel}.` : "Refresh AI insights"}
              >
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} />
                {loading ? "Analyzing..." : cooldownRemaining > 0 ? `Next update ${nextRefreshLabel}` : "Refresh Insights"}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Discover patterns in your emotional journey, powered by AI. Updates once a week, only when you ask.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!insights && !loading && !error && (
          <div className="text-center py-8 space-y-4">
            <Sparkles className="h-10 w-10 text-primary/70 mx-auto animate-pulse" />
            <div className="max-w-md mx-auto space-y-1">
              <p className="text-sm font-medium text-foreground">
                Ready to analyze your emotional journey
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have {vents.length} written vents. Tap below whenever you want to generate a personal emotional summary, uncover triggers, and see your inner strengths.
              </p>
            </div>
            <Button onClick={runInsightGeneration} size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate AI Insights
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Analyzing patterns across your recent vents...</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg mt-2" />
          </div>
        )}

        {error && !insights && (
          <div className="text-center py-6 space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive/60 mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => runInsightGeneration()} size="sm">
              Try Again
            </Button>
          </div>
        )}

        {insights && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            <p className="text-sm text-foreground/90 leading-relaxed">
              {insights.summary}
            </p>

            {/* Triggers & Strengths Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Triggers */}
              {insights.triggers.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                  <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                    Potential Triggers
                  </h4>
                  <ul className="space-y-1">
                    {insights.triggers.map((trigger, i) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths */}
              {insights.strengths.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                  <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                    Your Strengths
                  </h4>
                  <ul className="space-y-1">
                    {insights.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Gentle Reframe */}
            {insights.gentleReframe && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/85 leading-relaxed italic">
                  {insights.gentleReframe}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {insights && (
        <CardFooter className="flex-col items-start gap-1.5 pt-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Info className="h-3 w-3" />
            <span>AI-generated reflections based on {vents.length} vents · Not clinical assessments</span>
          </div>
          {lastGeneratedAt && (
            <div className="text-[11px] text-muted-foreground/40">
              Last updated {format(lastGeneratedAt, "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
