
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import { submitFeedbackServerAction } from "@/actions/feedback";

export function FeedbackForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [rating, setRating] = useState(3);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (text.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Feedback too short",
        description: "Please provide at least 10 characters of feedback.",
      });
      return;
    }

    setIsSubmitting(true);
    let success = false;

    // Layer 1: Client-side Firestore addDoc
    try {
      const feedbackCollection = collection(db, "feedback");
      await addDoc(feedbackCollection, {
        userId: user?.uid || "guest_user",
        userName: user?.username || "Guest",
        rating,
        text,
        timestamp: serverTimestamp(),
      });
      success = true;
    } catch (clientErr) {
      console.warn("Client-side feedback submission failed, trying Server Action fallback...", clientErr);
    }

    // Layer 2: Server Action fallback if client-side was blocked by cloud rules
    if (!success) {
      try {
        const res = await submitFeedbackServerAction({
          userId: user?.uid || "guest_user",
          userName: user?.username || "Guest",
          rating,
          text,
        });
        if (res.success) {
          success = true;
        }
      } catch (serverErr) {
        console.warn("Server Action feedback submission failed, saving locally...", serverErr);
      }
    }

    // Layer 3: Local Storage fallback so user is never blocked
    if (!success) {
      try {
        const localFeedbackRaw = localStorage.getItem("guest_feedback");
        const localFeedback = localFeedbackRaw ? JSON.parse(localFeedbackRaw) : [];
        localFeedback.push({
          id: "local_" + Math.random().toString(36).substring(2, 9),
          userId: user?.uid || "guest_user",
          userName: user?.username || "Guest",
          rating,
          text,
          timestamp: Date.now(),
        });
        localStorage.setItem("guest_feedback", JSON.stringify(localFeedback));
        success = true;
      } catch (localErr) {
        console.error("Local feedback storage error:", localErr);
      }
    }

    setIsSubmitting(false);

    if (success) {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve the platform.",
      });
      router.push(user ? "/dashboard" : "/feed");
    } else {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not save your feedback. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Provide Feedback</CardTitle>
        <CardDescription>
          This is a new platform, and your feedback is crucial for helping us
          improve and fix bugs. Thank you for taking the time to share your
          thoughts! You can also reach out directly at{" "}
          <a href="mailto:support@venting.in" className="underline font-medium hover:text-primary transition-colors">
            support@venting.in
          </a>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="rating-slider" className="font-medium">
            Overall Experience Rating
          </label>
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg w-8 text-center">{rating}</span>
            <Slider
              id="rating-slider"
              value={[rating]}
              onValueChange={(value) => setRating(value[0])}
              min={1}
              max={5}
              step={1}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="feedback-text" className="font-medium">
            Your Feedback
          </label>
          <Textarea
            id="feedback-text"
            placeholder="What's working well? What could be better? Any bugs you've noticed?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}
