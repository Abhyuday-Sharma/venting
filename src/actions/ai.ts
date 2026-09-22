
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
    console.error("Error generating AI mood insights, using graceful fallback:", error);
    try {
      const avgMood = vents.reduce((acc, v) => acc + v.mood, 0) / vents.length;
      const recent = vents.slice(0, Math.ceil(vents.length / 2));
      const older = vents.slice(Math.ceil(vents.length / 2));
      const recentAvg = recent.reduce((acc, v) => acc + v.mood, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((acc, v) => acc + v.mood, 0) / older.length : recentAvg;

      let overallTrend: 'improving' | 'stable' | 'declining' | 'fluctuating' = 'stable';
      if (recentAvg - olderAvg > 0.8) overallTrend = 'improving';
      else if (olderAvg - recentAvg > 0.8) overallTrend = 'declining';
      else if (Math.abs(recentAvg - olderAvg) > 0.4) overallTrend = 'fluctuating';

      const lowCategories = Array.from(
        new Set(vents.filter(v => v.mood <= 5).map(v => v.category).filter(Boolean))
      );
      const highCategories = Array.from(
        new Set(vents.filter(v => v.mood > 5).map(v => v.category).filter(Boolean))
      );

      const triggers = lowCategories.length > 0
        ? lowCategories.slice(0, 3).map(c => `Emotional heaviness and pressure related to ${c.toLowerCase()}.`)
        : ['Periods of high mental fatigue and emotional exhaustion.'];

      const strengths = highCategories.length > 0
        ? highCategories.slice(0, 3).map(c => `Moments of comfort and perspective during ${c.toLowerCase()}.`)
        : ['Showing up consistently to write down and process thoughts honestly.'];

      let summary = `Over your recent entries, your mood has averaged around ${avgMood.toFixed(1)}/10. Taking time to put complex emotions into words is a meaningful step toward mental balance.`;
      if (overallTrend === 'declining') {
        summary = `You've been navigating some especially heavy feelings lately (averaging ${avgMood.toFixed(1)}/10). Acknowledging when things are difficult is an act of real courage, and it's completely okay to take things one day at a time.`;
      } else if (overallTrend === 'improving') {
        summary = `Your recent entries reflect a gradual upward lift in emotional balance (averaging ${avgMood.toFixed(1)}/10). Giving yourself space to express feelings is helping you build steady emotional momentum.`;
      }

      const gentleReframe = overallTrend === 'declining'
        ? 'When things feel heavy, what is one small pressure you can give yourself permission to let go of today?'
        : 'Notice how writing about your feelings creates space for relief. What helped you find even a brief moment of calm?';

      return {
        success: true,
        data: {
          summary,
          triggers,
          strengths,
          gentleReframe,
          overallTrend,
        },
      };
    } catch (fallbackError) {
      console.error("Fallback generation failed:", fallbackError);
      return { success: false, error: "Failed to generate mood insights." };
    }
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

