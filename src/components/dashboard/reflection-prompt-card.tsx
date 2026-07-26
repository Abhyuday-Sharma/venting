
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateReflectionPrompts, generateMicroActionItem } from "@/actions/ai";
import { Sparkles, X, ChevronDown, ChevronUp, Loader2, Pin } from "lucide-react";
import type { Vent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ReflectionPromptCardProps {
  vent: Vent;
}

interface ReflectionPrompt {
  emoji: string;
  text: string;
}

export function ReflectionPromptCard({ vent }: ReflectionPromptCardProps) {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<ReflectionPrompt[]>([]);
  const [acknowledgement, setAcknowledgement] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(false);

  const [actionItem, setActionItem] = useState<string>("");
  const [comfortMessage, setComfortMessage] = useState<string>("");
  const [generatingAction, setGeneratingAction] = useState(false);
  const [pinned, setPinned] = useState(false);

  const handleGenerateAction = async () => {
    setGeneratingAction(true);
    const result = await generateMicroActionItem(vent.text, vent.category || "General");
    if (result.success && result.data) {
      setActionItem(result.data.actionItem);
      setComfortMessage(result.data.comfortMessage);
    }
    setGeneratingAction(false);
  };

  const handlePinAction = async () => {
    if (!actionItem) return;
    try {
      if (user) {
        await addDoc(collection(db, "users", user.uid, "goals"), {
          text: actionItem,
          category: vent.category || "General",
          completed: false,
          createdAt: serverTimestamp(),
        });
      } else {
        const localGoalsRaw = localStorage.getItem("guest_goals");
        const localGoals = localGoalsRaw ? JSON.parse(localGoalsRaw) : [];
        localGoals.push({
          id: "goal_" + Math.random().toString(36).substr(2, 9),
          text: actionItem,
          category: vent.category || "General",
          completed: false,
          createdAt: Date.now(),
        });
        localStorage.setItem("guest_goals", JSON.stringify(localGoals));
      }
      setPinned(true);
    } catch (e) {
      console.error("Failed to pin goal:", e);
    }
  };

  useEffect(() => {
    if (!vent.text || vent.isPublic) {
      setLoading(false);
      return;
    }

    const fetchPrompts = async () => {
      setLoading(true);
      const result = await generateReflectionPrompts(
        vent.text,
        vent.mood,
        vent.category || "General"
      );

      if (result.success && result.data) {
        setPrompts(result.data.prompts);
        setAcknowledgement(result.data.acknowledgement);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    fetchPrompts();
  }, [vent]);

  if (dismissed || error || vent.isPublic) {
    return null;
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (prompts.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-card to-primary/5 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-headline">A moment to reflect</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse reflection prompts" : "Expand reflection prompts"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss reflection prompts"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          These are gentle prompts based on what you shared — no rush, no pressure.
        </CardDescription>
      </CardHeader>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="space-y-3 pt-2">
          {acknowledgement && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
              {acknowledgement}
            </p>
          )}

          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border border-border/50"
              >
                <span className="text-xl mt-0.5 flex-shrink-0">{prompt.emoji}</span>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {prompt.text}
                </p>
              </div>
            ))}
          </div>

          {!actionItem && !generatingAction && (
            <div className="mt-4 pt-4 border-t border-border/30 flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground text-center">Would you like a gentle, 5-minute action item based on this reflection?</p>
              <Button variant="outline" size="sm" onClick={handleGenerateAction} className="text-xs border-primary/20 hover:bg-primary/5">
                Generate 5-minute action item
              </Button>
            </div>
          )}

          {generatingAction && (
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Generating a mindful action for you...</span>
            </div>
          )}

          {actionItem && (
            <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-left relative overflow-hidden">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Suggested Micro-Goal</span>
                <p className="text-sm font-medium mt-1 text-foreground">{actionItem}</p>
                {comfortMessage && <p className="text-xs text-muted-foreground mt-2 italic">"{comfortMessage}"</p>}
              </div>
              {!pinned ? (
                <Button size="sm" onClick={handlePinAction} className="w-full text-xs gap-1.5">
                  <Pin className="h-3 w-3" />
                  Add to My Dashboard Goals
                </Button>
              ) : (
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold text-center py-1">✓ Added to your goals list</p>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground/60 text-center pt-2">
            AI-generated reflections · Not clinical advice
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
