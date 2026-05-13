
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, Vent } from '@/lib/types';
import { Timestamp, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile;
  onMoodSaved: (vent: Vent) => void;
  isFirstSession?: boolean;
}

const moodOptions = [
  { emoji: '😭', label: 'Very Sad', mood: 1, text: "Feeling very sad today." },
  { emoji: '😢', label: 'Sad', mood: 2, text: "Feeling sad." },
  { emoji: '☁️', label: 'Under the weather', mood: 4, text: "Feeling a bit under the weather." },
  { emoji: '🙂', label: 'Fine', mood: 6, text: "Feeling fine." },
  { emoji: '😊', label: 'Good', mood: 7, text: "Feeling good." },
  { emoji: '😄', label: 'Happy', mood: 9, text: "Feeling happy!" },
  { emoji: '😁', label: 'Very Happy', mood: 10, text: "Feeling very happy today!" },
];

async function saveQuickVent(user: UserProfile, moodOption: typeof moodOptions[0]): Promise<{ success: boolean; ventId?: string; error?: string; newVent?: Vent }> {
    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    // A quick mood check-in has no text. It's just a mood data point.
    const ventData: Omit<Vent, 'id' | 'timestamp'> & { timestamp: any } = {
      text: "", // Important: No auto-generated text
      mood: moodOption.mood,
      isPublic: false,
      userId: user.uid,
      authorName: user.username ?? 'Anonymous',
      authorPhotoURL: user.photoURL,
      timestamp: serverTimestamp(),
    };

    try {
        const privateVentsCollection = collection(db, "users", user.uid, "vents");
        const newVentRef = doc(privateVentsCollection);
        
        await setDoc(newVentRef, ventData);
        
        const newVent: Vent = {
            ...ventData,
            id: newVentRef.id,
            timestamp: Timestamp.now(), // Approximate for UI
        }

        return { success: true, ventId: newVentRef.id, newVent };
    } catch (error: any) {
        console.error("Error saving quick vent:", error);
        return { success: false, error: error.message || "Failed to save mood." };
    }
}


export function MoodCheckInModal({ isOpen, onOpenChange, user, onMoodSaved, isFirstSession }: MoodCheckInModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleMoodSelect = async (moodOption: typeof moodOptions[0]) => {
    if (!user || isSaving) return;
    setIsSaving(true);
    
    const result = await saveQuickVent(user, moodOption);

    if (result.success && result.newVent) {
      toast({
        title: `I'm glad you came, ${user.username}!`,
        duration: 3000,
      });
      onMoodSaved(result.newVent);
    } else {
      toast({
        variant: "destructive",
        title: "Oh no!",
        description: result.error || "Could not save your mood.",
      });
    }
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isFirstSession 
              ? "Before you begin — how are you feeling right now?" 
              : `How are you today, ${user.username}?`}
          </DialogTitle>
          <DialogDescription>
            Select a mood to quickly log how you're feeling right now.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 py-4">
          {moodOptions.map((option) => (
            <div key={option.label} className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                className="w-20 h-20 text-4xl rounded-full"
                onClick={() => handleMoodSelect(option)}
                disabled={isSaving}
                aria-label={option.label}
              >
                {option.emoji}
              </Button>
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
