
"use server";

import { transliterate as aiTransliterate } from "@/ai/flows/ai-transliteration";

export async function transliterateText(text: string): Promise<{ success: boolean; text?: string; error?: string }> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text to transliterate." };
    }
  try {
    const result = await aiTransliterate({ text: text, targetLanguageStyle: 'Romanized' });
    return { success: true, text: result.result };
  } catch (error) {
    console.error("Error transliterating text:", error);
    return { success: false, error: "Failed to transliterate text." };
  }
}
