
'use server';

/**
 * @fileOverview AI-powered reflective journaling prompt generator.
 *
 * After a user submits a private vent, this flow generates 1-2 gentle,
 * open-ended reflection prompts to help them process their emotions.
 *
 * - generateReflectionPrompts - Main function to generate reflection prompts.
 * - ReflectionInput - The input type.
 * - ReflectionOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReflectionInputSchema = z.object({
  text: z.string().describe('The text content of the user\'s vent.'),
  mood: z.number().min(1).max(10).describe('The user\'s mood score from 1 (very low) to 10 (very good).'),
  category: z.string().describe('The category of the vent (e.g., Work, Relationships, Family, Health, Personal Growth, General).'),
});
export type ReflectionInput = z.infer<typeof ReflectionInputSchema>;

const ReflectionOutputSchema = z.object({
  prompts: z.array(z.object({
    emoji: z.string().describe('A single emoji that captures the tone of the prompt.'),
    text: z.string().describe('The reflection prompt text. Must be an open-ended question.'),
  })).min(1).max(2).describe('1-2 reflection prompts for the user.'),
  acknowledgement: z.string().describe('A brief, warm 1-sentence acknowledgement of what the user shared. Must validate their feelings without judging.'),
});
export type ReflectionOutput = z.infer<typeof ReflectionOutputSchema>;


export async function generateReflectionPrompts(input: ReflectionInput): Promise<ReflectionOutput> {
  return reflectionFlow(input);
}


const reflectionPrompt = ai.definePrompt({
  name: 'reflectionPrompt',
  input: { schema: ReflectionInputSchema },
  output: { schema: ReflectionOutputSchema },
  prompt: `You are a gentle, emotionally intelligent journaling companion on a mental wellness platform. A user has just finished writing a private vent. Your role is to help them reflect and find their own insights — NOT to give advice, diagnose, or be a therapist.

**Critical Rules:**
1. **NEVER diagnose** mental health conditions or suggest medical treatments.
2. **NEVER give direct advice** like "you should..." or "try to...". Only ask open-ended questions.
3. **ALWAYS validate** their feelings first. Acknowledge what they're going through.
4. **Be mood-aware:** If their mood is low (1-4), be extra gentle and comforting. If their mood is neutral-high (5-10), you can be more exploratory and growth-oriented.
5. **Be culturally sensitive** and use inclusive, non-assuming language.
6. **Keep prompts short** — each prompt should be 1-2 sentences max.
7. **Match the category context** — tailor prompts to the domain (Work, Relationships, Family, etc.).

**Examples of GOOD reflection prompts:**
- "What would you say to a friend going through this exact same thing?"
- "Is there a small thing that brought you even a tiny bit of comfort today?"
- "What does your ideal outcome look like, even if it feels far away?"

**Examples of BAD responses (DO NOT do these):**
- "You seem to have anxiety. Consider talking to a therapist." (diagnosis + advice)
- "Just try to be positive!" (dismissive + advice)
- "You should set boundaries with your manager." (direct advice)

**User's Vent:**
Category: {{{category}}}
Mood: {{{mood}}}/10
Content: "{{{text}}}"

Generate 1-2 reflection prompts and a brief acknowledgement based on this vent.`,
});


const reflectionFlow = ai.defineFlow(
  {
    name: 'reflectionFlow',
    inputSchema: ReflectionInputSchema,
    outputSchema: ReflectionOutputSchema,
  },
  async (input) => {
    const { output } = await reflectionPrompt(input);
    return output!;
  }
);
