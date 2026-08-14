
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { generateMoodInsights } from "@/actions/ai";
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Activity, Lightbulb, AlertTriangle, Sparkles, Info } from "lucide-react";
import type { Vent, UserProfile, MoodInsights } from "@/lib/types";
import { format, differenceInDays } from "date-fns";
import { getDate } from "@/lib/date-utils";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MoodInsightsCardProps {
  vents: Vent[];
  user: UserProfile;
}

const trendConfig = {
  improving: { label: "Improving", icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  stable: { label: "Stable", icon: Minus, className: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" },
  declining: { label: "Declining", icon: TrendingDown, className: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
  fluctuating: { label: "Fluctuating", icon: Activity, className: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

export function MoodInsightsCard({ vents, user }: MoodInsightsCardProps) {
  const [insights, setInsights] = useState<MoodInsights | null>(user.currentInsights || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ultimate safeguard to prevent infinite API loops
  const hasGeneratedThisSession = useRef(false);

  const hasEnoughVents = vents.length >= 3;

  useEffect(() => {
    if (!hasEnoughVents) return;
    if (hasGeneratedThisSession.current) return;

    const checkAndGenerateInsights = async () => {
      const now = new Date();
      const lastGeneratedDate = user.lastInsightGeneratedAt?.toDate();
      const daysSinceLastGeneration = lastGeneratedDate ? differenceInDays(now, lastGeneratedDate) : Infinity;

      const latestVentTimestamp = vents.length > 0 && vents[0].timestamp ? vents[0].timestamp.toDate() : new Date(0);
      const hasNewVents = lastGeneratedDate ? latestVentTimestamp > lastGeneratedDate : true;

      const shouldGenerate = (daysSinceLastGeneration >= 7 && hasNewVents) || !user.currentInsights;

      if (shouldGenerate) {
        hasGeneratedThisSession.current = true;
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
          setInsights(result.data);
          try {
            await updateDoc(doc(db, "users", user.uid), {
              currentInsights: result.data,
              lastInsightGeneratedAt: serverTimestamp()
            });
          } catch (e) {
            console.error("Failed to save insights to profile:", e);
          }
        } else {
          setError(result.error || "Something went wrong.");
        }
        setLoading(false);
      } else if (user.currentInsights && !insights) {
          setInsights(user.currentInsights);
      }
    };

    checkAndGenerateInsights();
  }, [hasEnoughVents, user.uid, vents.length]); // Re-run if they cross the 3 vent threshold or user changes. We use vents.length as a simple trigger, the inner logic prevents infinite loops.


  if (!hasEnoughVents) {
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
          <p className="text-sm text-muted-foreground">
            You need <strong>{ventsNeeded} more</strong> written {ventsNeeded === 1 ? 'vent' : 'vents'} to unlock AI mood insights. 
            Venting needs a little more data to find meaningful patterns in your emotional journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  const trend = insights ? trendConfig[insights.overallTrend] : null;
  const TrendIcon = trend?.icon;

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-headline">AI Mood Insights</CardTitle>
          </div>
          {trend && (
            <Badge variant="outline" className={trend.className}>
              {TrendIcon && <TrendIcon className="h-3.5 w-3.5 mr-1" />}
              {trend.label}
            </Badge>
          )}
        </div>
        <CardDescription>
          Discover patterns in your emotional journey, powered by AI.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!insights && !loading && !error && (
          <div className="text-center py-6 space-y-3">
            <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Analyzing your recent vents to uncover emotional patterns, triggers, and strengths...
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-2">
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

        {error && (
          <div className="text-center py-6 space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive/60 mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} size="sm">
              Reload Page
            </Button>
          </div>
        )}

        {insights && (
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
        <CardFooter className="flex-col items-start gap-2 pt-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Info className="h-3 w-3" />
            <span>AI-generated reflections based on {vents.length} vents · Not clinical assessments</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 mt-1">
            <Sparkles className="h-3 w-3" />
            <span>Insights update automatically each week based on new vents.</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
