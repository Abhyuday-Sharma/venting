
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HeartHandshake, PenLine } from "lucide-react";

interface EmpathyNudgeProps {
  suggestion: string;
  onEdit: () => void;
  onPostAnyway: () => void;
  isPosting: boolean;
}

export function EmpathyNudge({ suggestion, onEdit, onPostAnyway, isPosting }: EmpathyNudgeProps) {
  return (
    <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-300">
        <HeartHandshake className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-sm font-semibold">A gentle thought</AlertTitle>
        <AlertDescription className="text-xs leading-relaxed">
          {suggestion}
        </AlertDescription>
      </Alert>
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <PenLine className="mr-1.5 h-3.5 w-3.5" />
          Edit Comment
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground"
          onClick={onPostAnyway}
          disabled={isPosting}
        >
          Post Anyway
        </Button>
      </div>
    </div>
  );
}
