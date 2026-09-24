"use server";

import { generateReflectionPrompts as aiGenerateReflectionPrompts, type ReflectionInput } from "@/ai/flows/ai-reflection-prompter";
import { analyzeContentSafety as aiAnalyzeContentSafety, type SafetyModerationInput } from "@/ai/flows/ai-safety-moderation";
import { generateMoodInsights as aiGenerateMoodInsights, type MoodSummaryInput } from "@/ai/flows/ai-mood-summarizer";
import { checkCommentEmpathy as aiCheckCommentEmpathy, type EmpathyCheckInput } from "@/ai/flows/ai-empathy-check";
import { generateActionItemFlow, type ActionItemOutput } from "@/ai/flows/ai-action-item";
import type { ReflectionOutput } from "@/ai/flows/ai-reflection-prompter";
import type { SafetyModerationOutput } from "@/ai/flows/ai-safety-moderation";
import type { MoodSummaryOutput } from "@/ai/flows/ai-mood-summarizer";
import type { EmpathyCheckOutput } from "@/ai/flows/ai-empathy-check";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_VENT_TEXT_LENGTH = 5000;
const MAX_COMMENT_TEXT_LENGTH = 2000;
const MAX_INSIGHT_VENTS = 30;

// Rate limit: 30 AI requests per minute per IP
const AI_RATE_LIMIT_MAX = 30;
const AI_RATE_LIMIT_WINDOW_MS = 60 * 1000;

async function assertRateLimit(actionName: string): Promise<string | null> {
  const ip = await getClientIp();
  const rateCheck = checkRateLimit(`${ip}:${actionName}`, AI_RATE_LIMIT_MAX, AI_RATE_LIMIT_WINDOW_MS);
  if (!rateCheck.success) {
    return `Rate limit exceeded. Please try again in ${rateCheck.resetInSeconds} seconds.`;
  }
  return null;
}

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
  if (text.length > MAX_VENT_TEXT_LENGTH) {
    return { success: false, error: "Text exceeds maximum allowed length." };
  }

  const rateLimitError = await assertRateLimit("reflection");
  if (rateLimitError) return { success: false, error: rateLimitError };

  const clampedMood = Math.max(1, Math.min(10, Math.round(mood || 5)));
  const safeCategory = String(category || "General").slice(0, 50);

  try {
    const result = await aiGenerateReflectionPrompts({ text, mood: clampedMood, category: safeCategory });
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
  const maxLen = contentType === 'comment' ? MAX_COMMENT_TEXT_LENGTH : MAX_VENT_TEXT_LENGTH;
  if (text.length > maxLen) {
    return { success: false, error: "Content exceeds maximum allowed length." };
  }

  const rateLimitError = await assertRateLimit("safety");
  if (rateLimitError) return { success: false, error: rateLimitError };

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
  if (vents.length > MAX_INSIGHT_VENTS) {
    vents = vents.slice(0, MAX_INSIGHT_VENTS);
  }

  const rateLimitError = await assertRateLimit("mood-insights");
  if (rateLimitError) return { success: false, error: rateLimitError };

  const sanitizedVents = vents.map(v => ({
    text: String(v.text || "").slice(0, 1000),
    mood: Math.max(1, Math.min(10, Number(v.mood) || 5)),
    category: String(v.category || "General").slice(0, 50),
    date: String(v.date || "").slice(0, 30),
  }));
  const safeUsername = String(username || "User").slice(0, 30);

  try {
    const result = await aiGenerateMoodInsights({ vents: sanitizedVents, username: safeUsername });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating AI mood insights, using graceful fallback:", error);
    try {
      const avgMood = sanitizedVents.reduce((acc, v) => acc + v.mood, 0) / sanitizedVents.length;
      const recent = sanitizedVents.slice(0, Math.ceil(sanitizedVents.length / 2));
      const older = sanitizedVents.slice(Math.ceil(sanitizedVents.length / 2));
      const recentAvg = recent.reduce((acc, v) => acc + v.mood, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((acc, v) => acc + v.mood, 0) / older.length : recentAvg;

      let overallTrend: 'improving' | 'stable' | 'declining' | 'fluctuating' = 'stable';
      if (recentAvg - olderAvg > 0.8) overallTrend = 'improving';
      else if (olderAvg - recentAvg > 0.8) overallTrend = 'declining';
      else if (Math.abs(recentAvg - olderAvg) > 0.4) overallTrend = 'fluctuating';

      const lowCategories = Array.from(
        new Set(sanitizedVents.filter(v => v.mood <= 5).map(v => v.category).filter(Boolean))
      );
      const highCategories = Array.from(
        new Set(sanitizedVents.filter(v => v.mood > 5).map(v => v.category).filter(Boolean))
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
  if (commentText.length > MAX_COMMENT_TEXT_LENGTH) {
    return { success: false, error: "Comment text exceeds maximum allowed length." };
  }

  const rateLimitError = await assertRateLimit("empathy");
  if (rateLimitError) return { success: false, error: rateLimitError };

  const safeVentText = String(ventText || "").slice(0, MAX_VENT_TEXT_LENGTH);

  try {
    const result = await aiCheckCommentEmpathy({ commentText, ventText: safeVentText });
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
  if (text.length > MAX_VENT_TEXT_LENGTH) {
    return { success: false, error: "Text exceeds maximum allowed length." };
  }

  const rateLimitError = await assertRateLimit("micro-action");
  if (rateLimitError) return { success: false, error: rateLimitError };

  const safeCategory = String(category || "General").slice(0, 50);

  try {
    const result = await generateActionItemFlow({ text, category: safeCategory });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating micro-action item:", error);
    return { success: false, error: "Failed to generate action item." };
  }
}
