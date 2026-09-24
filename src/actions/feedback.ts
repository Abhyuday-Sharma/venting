"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_FEEDBACK_TEXT_LENGTH = 2000;
const FEEDBACK_RATE_LIMIT_MAX = 5;
const FEEDBACK_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 5 per 10 minutes

export async function submitFeedbackServerAction(data: {
  userId: string;
  userName: string;
  rating: number;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  const ip = await getClientIp();
  const rateCheck = checkRateLimit(`${ip}:feedback`, FEEDBACK_RATE_LIMIT_MAX, FEEDBACK_RATE_LIMIT_WINDOW_MS);
  if (!rateCheck.success) {
    return { success: false, error: `Too many submissions. Please wait ${Math.ceil(rateCheck.resetInSeconds / 60)} minutes.` };
  }

  if (!data.text || data.text.trim().length === 0) {
    return { success: false, error: "Feedback text cannot be empty." };
  }
  if (data.text.length > MAX_FEEDBACK_TEXT_LENGTH) {
    return { success: false, error: "Feedback text exceeds maximum allowed length." };
  }

  const rating = Math.max(1, Math.min(5, Math.round(Number(data.rating) || 5)));
  const safeUserId = String(data.userId || "anonymous").slice(0, 128);
  const safeUserName = String(data.userName || "Anonymous").slice(0, 50);

  try {
    const feedbackCollection = collection(db, "feedback");
    await addDoc(feedbackCollection, {
      userId: safeUserId,
      userName: safeUserName,
      rating,
      text: data.text.trim(),
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Server Action Feedback submission error:", error);
    return { success: false, error: error?.message || "Failed to submit feedback." };
  }
}
