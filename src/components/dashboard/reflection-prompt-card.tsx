
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateReflectionPrompts } from "@/actions/ai";
import { Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Vent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReflectionPromptCardProps {
  vent: Vent;
}

interface ReflectionPrompt {
  emoji: string;
  text: string;
}

export function ReflectionPromptCard({ vent }: ReflectionPromptCardProps) {
  const [prompts, setPrompts] = useState<ReflectionPrompt[]>([]);
  const [acknowledgement, setAcknowledgement] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(false);

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

          <p className="text-[11px] text-muted-foreground/60 text-center pt-1">
            AI-generated reflections · Not clinical advice
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
