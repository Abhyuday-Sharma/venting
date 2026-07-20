
'use server';

/**
 * @fileOverview AI-powered mood pattern summarizer for the dashboard.
 *
 * Aggregates a user's recent vents and generates qualitative insights
 * about emotional triggers, resilience factors, and patterns.
 *
 * - generateMoodInsights - Main function to generate insights.
 * - MoodSummaryInput - The input type.
 * - MoodSummaryOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VentSummarySchema = z.object({
  text: z.string().describe('The text content of the vent.'),
  mood: z.number().describe('The mood score from 1-10.'),
  category: z.string().describe('The category of the vent.'),
  date: z.string().describe('The date of the vent in a readable format.'),
});

const MoodSummaryInputSchema = z.object({
  vents: z.array(VentSummarySchema).min(3).describe('An array of the user\'s recent vents (minimum 3) to analyze for patterns.'),
  username: z.string().describe('The user\'s display name for personalization.'),
});
export type MoodSummaryInput = z.infer<typeof MoodSummaryInputSchema>;

const MoodSummaryOutputSchema = z.object({
  summary: z.string().describe('A warm, 2-3 sentence empathetic overview of the user\'s emotional landscape over the analyzed period.'),
  triggers: z.array(z.string()).describe('1-3 short descriptions of categories, themes, or situations that correlate with lower mood scores.'),
  strengths: z.array(z.string()).describe('1-3 short descriptions of categories, themes, or activities that correlate with higher mood scores or resilience.'),
  gentleReframe: z.string().describe('A single soft cognitive reframing observation. Not advice — just a perspective shift framed as a question or observation.'),
  overallTrend: z.enum(['improving', 'stable', 'declining', 'fluctuating']).describe('The overall mood trend direction based on the data.'),
});
export type MoodSummaryOutput = z.infer<typeof MoodSummaryOutputSchema>;


export async function generateMoodInsights(input: MoodSummaryInput): Promise<MoodSummaryOutput> {
  return moodSummaryFlow(input);
}


const moodSummaryPrompt = ai.definePrompt({
  name: 'moodSummaryPrompt',
  input: { schema: MoodSummaryInputSchema },
  output: { schema: MoodSummaryOutputSchema },
  prompt: `You are a compassionate emotional patterns analyst on a mental wellness journaling platform. A user named "{{username}}" has asked to see insights about their recent vents.

**Critical Rules:**
1. **NEVER diagnose** conditions or suggest professional treatment unprompted.
2. **NEVER give direct life advice.** You observe and reflect, not prescribe.
3. **Be warm and validating.** The user is trusting you with their vulnerable moments.
4. **Be specific to their data.** Don't make generic observations. Reference actual themes and categories from their vents.
5. **Frame everything as observations and questions,** not conclusions.
6. **If the data shows a declining trend, be extra gentle.** Acknowledge the difficulty without catastrophizing.
7. **Celebrate small wins.** If any vents show resilience, gratitude, or growth, highlight them.

**The user's recent vents:**
{{#each vents}}
- **{{date}}** | Mood: {{mood}}/10 | Category: {{category}}
  "{{text}}"
{{/each}}

**Your task:**
1. Write a warm summary of what you observe in their emotional landscape.
2. Identify 1-3 triggers (themes/situations linked to lower moods).
3. Identify 1-3 strengths (themes/situations linked to higher moods or resilience).
4. Offer ONE gentle reframe — a question or observation that might help them see a pattern differently.
5. Assess the overall trend direction.

Remember: This person has been brave enough to write down their feelings. Honor that.`,
});


const moodSummaryFlow = ai.defineFlow(
  {
    name: 'moodSummaryFlow',
    inputSchema: MoodSummaryInputSchema,
    outputSchema: MoodSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await moodSummaryPrompt(input);
    return output!;
  }
);
