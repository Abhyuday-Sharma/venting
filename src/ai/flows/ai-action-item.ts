'use server';

/**
 * @fileOverview AI-powered micro-action item generator.
 *
 * Suggests a single, gentle, 5-minute self-care action item based on a vent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ActionItemInputSchema = z.object({
  text: z.string().describe('The text content of the user\'s vent.'),
  category: z.string().describe('The category of the vent (e.g., Work, Relationships, Personal Growth, etc.).'),
});
export type ActionItemInput = z.infer<typeof ActionItemInputSchema>;

const ActionItemOutputSchema = z.object({
  actionItem: z.string().describe('A single, gentle, practical action item that takes 5 minutes or less to do. Must be 1 sentence.'),
  comfortMessage: z.string().describe('A brief, warm sentence explaining how this action item supports them in this moment.'),
});
export type ActionItemOutput = z.infer<typeof ActionItemOutputSchema>;

const actionPrompt = ai.definePrompt({
  name: 'actionPrompt',
  input: { schema: ActionItemInputSchema },
  output: { schema: ActionItemOutputSchema },
  // Explicitly target OpenAI's gpt-4o-mini model
  model: 'openai/gpt-4o-mini',
  prompt: `You are a gentle, supportive self-care companion. The user has just shared a vulnerable vent.
Your task is to suggest a single, realistic micro-action item they can do right now in 5 minutes or less to help ground themselves, clear their head, or take a tiny step forward.

**Strict Guidelines:**
1. **Never prescribe clinical advice**, diagnostics, or heavy actions.
2. **Make it extremely low-effort.** Under 5 minutes. (e.g., drinking a glass of water, stretching for 1 minute, doing a breathing exercise, writing down one single word, taking a 2-minute screen break).
3. **Keep the tone polite, comforting, and completely non-greedy.** Absolutely no gamified language, "streaks", or pressuring tone.
4. **Be context-aware:** Tailor the action item to the category.
5. **No direct advice/shoulds:** Frame it as a gentle invite (e.g. "You might enjoy...", "Perhaps you could...", "Consider taking a moment to...").

**User's Vent:**
Category: {{{category}}}
Content: "{{{text}}}"

Generate the action item and a short, validating explanation.`,
});

export async function generateActionItemFlow(input: ActionItemInput): Promise<ActionItemOutput> {
  const { output } = await actionPrompt(input, { model: 'openai/gpt-4o-mini' });
  return output!;
}
