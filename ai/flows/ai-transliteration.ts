
'use server';

/**
 * @fileOverview A multilingual text understanding and normalization engine for transliteration.
 *
 * - transliterate - A function that handles text transliteration.
 * - TransliterateInput - The input type for the transliterate function.
 * - TransliterateOutput - The return type for the transliterate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransliterateInputSchema = z.object({
  text: z.string().describe('The text to be transliterated. This can be in a native script like Devanagari (e.g., "नमस्ते").'),
  targetLanguageStyle: z.enum(['Romanized', 'Native']).default('Romanized').describe('The desired output script style. "Romanized" means converting to the English alphabet (e.g., Hinglish).'),
});
export type TransliterateInput = z.infer<typeof TransliterateInputSchema>;

const TransliterateOutputSchema = z.object({
  result: z.string().describe('The resulting transliterated text.'),
});
export type TransliterateOutput = z.infer<typeof TransliterateOutputSchema>;


export async function transliterate(input: TransliterateInput): Promise<TransliterateOutput> {
  return transliterateFlow(input);
}


const prompt = ai.definePrompt({
  name: 'transliteratePrompt',
  input: { schema: TransliterateInputSchema },
  output: { schema: TransliterateOutputSchema },
  prompt: `You are an expert multilingual text transliteration engine. Your primary goal is to convert text from its native script (like Hindi in Devanagari) into a Romanized (English alphabet) version. This is commonly known as Hinglish, Roman Urdu, etc.

**Rules:**
1.  **Detect Language:** Identify the language of the input text: "{{{text}}}".
2.  **Transliterate, Do Not Translate:** Convert the script character-for-character or phonetically. Do NOT translate the meaning. For example, 'नमस्ते' must become 'Namaste', not 'Hello'.
3.  **Preserve Mixed Language:** If the input contains a mix of scripts (e.g., Devanagari and English), transliterate only the native script part and keep the English part as is. Example Input: 'यह awesome है' -> Example Output: 'Yeh awesome hai'.
4.  **Preserve Intent:** The emotional tone, slang, and informalities must be preserved. Do not correct grammar or spelling.
5.  **Output Format:** Your final output must be only the resulting string.

**Task:**
Transliterate the following text to a Romanized (English alphabet) script based on the rules above.

**Input Text:**
"{{{text}}}"
`,
});


const transliterateFlow = ai.defineFlow(
  {
    name: 'transliterateFlow',
    inputSchema: TransliterateInputSchema,
    outputSchema: TransliterateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
