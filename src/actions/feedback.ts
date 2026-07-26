"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function submitFeedbackServerAction(data: {
  userId: string;
  userName: string;
  rating: number;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const feedbackCollection = collection(db, "feedback");
    await addDoc(feedbackCollection, {
      userId: data.userId,
      userName: data.userName,
      rating: data.rating,
      text: data.text,
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Server Action Feedback submission error:", error);
    return { success: false, error: error?.message || "Failed to submit feedback." };
  }
}
