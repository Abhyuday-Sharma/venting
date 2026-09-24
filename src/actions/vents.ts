"use server";

import { transliterate as aiTransliterate } from "@/ai/flows/ai-transliteration";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_TRANSLITERATE_LENGTH = 2000;
const TRANSLITERATE_RATE_LIMIT_MAX = 30;
const TRANSLITERATE_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function transliterateText(text: string): Promise<{ success: boolean; text?: string; error?: string }> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: "No text to transliterate." };
  }
  if (text.length > MAX_TRANSLITERATE_LENGTH) {
    return { success: false, error: "Text exceeds maximum allowed length of 2,000 characters." };
  }

  const ip = await getClientIp();
  const rateCheck = checkRateLimit(`${ip}:transliterate`, TRANSLITERATE_RATE_LIMIT_MAX, TRANSLITERATE_RATE_LIMIT_WINDOW_MS);
  if (!rateCheck.success) {
    return { success: false, error: `Rate limit exceeded. Please wait ${rateCheck.resetInSeconds} seconds.` };
  }

  try {
    const result = await aiTransliterate({ text: text, targetLanguageStyle: 'Romanized' });
    return { success: true, text: result.result };
  } catch (error) {
    console.error("Error transliterating text:", error);
    return { success: false, error: "Failed to transliterate text." };
  }
}
