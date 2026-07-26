
"use server";

import { generateReflectionPrompts as aiGenerateReflectionPrompts, type ReflectionInput } from "@/ai/flows/ai-reflection-prompter";
import { analyzeContentSafety as aiAnalyzeContentSafety, type SafetyModerationInput } from "@/ai/flows/ai-safety-moderation";
import { generateMoodInsights as aiGenerateMoodInsights, type MoodSummaryInput } from "@/ai/flows/ai-mood-summarizer";
import { checkCommentEmpathy as aiCheckCommentEmpathy, type EmpathyCheckInput } from "@/ai/flows/ai-empathy-check";
import type { ReflectionOutput } from "@/ai/flows/ai-reflection-prompter";
import type { SafetyModerationOutput } from "@/ai/flows/ai-safety-moderation";
import type { MoodSummaryOutput } from "@/ai/flows/ai-mood-summarizer";
import type { EmpathyCheckOutput } from "@/ai/flows/ai-empathy-check";


/**
 * Generates 1-2 reflection prompts based on a user's vent.
 */
export async function generateReflectionPrompts(
  text: string,
  mood: number,
  category: string
): Promise<{ success: boolean; data?: ReflectionOutput; error?: string }> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: "No text provided for reflection." };
  }
  try {
    const result = await aiGenerateReflectionPrompts({ text, mood, category });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating reflection prompts:", error);
    return { success: false, error: "Failed to generate reflection prompts." };
  }
}


/**
 * Analyzes content safety using AI semantic understanding.
 */
export async function analyzeContentSafety(
  text: string,
  contentType: 'vent' | 'comment'
): Promise<{ success: boolean; data?: SafetyModerationOutput; error?: string }> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: "No text provided for safety analysis." };
  }
  try {
    const result = await aiAnalyzeContentSafety({ text, contentType });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error analyzing content safety:", error);
    // If AI safety check fails, fall back to allowing the content
    // (the client-side regex check already ran as a pre-filter)
    return {
      success: true,
      data: {
        isSafe: true,
        severity: 'none',
        intentTag: 'fallback_allowed',
        action: {
          publish: true,
          showSupportMessage: false,
          blockImmediately: false,
          safetyFlag: false,
          disableComments: false,
        },
        reason: 'AI safety check failed, falling back to allow.',
      },
    };
  }
}


/**
 * Generates qualitative mood insights from a user's recent vents.
 */
export async function generateMoodInsights(
  vents: Array<{ text: string; mood: number; category: string; date: string }>,
  username: string
): Promise<{ success: boolean; data?: MoodSummaryOutput; error?: string }> {
  if (!vents || vents.length < 3) {
    return { success: false, error: "At least 3 vents are needed to generate insights." };
  }
  try {
    const result = await aiGenerateMoodInsights({ vents, username });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating mood insights:", error);
    return { success: false, error: "Failed to generate mood insights." };
  }
}


/**
 * Checks whether a comment is empathetic before posting.
 */
export async function checkCommentEmpathy(
  commentText: string,
  ventText: string
): Promise<{ success: boolean; data?: EmpathyCheckOutput; error?: string }> {
  if (!commentText || commentText.trim().length === 0) {
    return { success: false, error: "No comment text provided." };
  }
  try {
    const result = await aiCheckCommentEmpathy({ commentText, ventText });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error checking comment empathy:", error);
    // If empathy check fails, allow the comment to be posted
    return {
      success: true,
      data: {
        isEmpathetic: true,
        tone: 'neutral',
      },
    };
  }
}

import { generateActionItemFlow, type ActionItemOutput } from "@/ai/flows/ai-action-item";

/**
 * Generates a 5-minute micro-action item based on a user's vent.
 */
export async function generateMicroActionItem(
  text: string,
  category: string
): Promise<{ success: boolean; data?: ActionItemOutput; error?: string }> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: "No text provided for generating action item." };
  }
  try {
    const result = await generateActionItemFlow({ text, category });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating micro-action item:", error);
    return { success: false, error: "Failed to generate action item." };
  }
}

