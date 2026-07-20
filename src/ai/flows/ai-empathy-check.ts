
'use server';

/**
 * @fileOverview AI-powered empathy check for community comments.
 *
 * Before a user posts a comment on someone's vent, this flow analyzes
 * the tone and offers a gentle suggestion if the comment might feel
 * dismissive or invalidating.
 *
 * - checkCommentEmpathy - Main function to check comment empathy.
 * - EmpathyCheckInput - The input type.
 * - EmpathyCheckOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EmpathyCheckInputSchema = z.object({
  commentText: z.string().describe('The draft comment text the user wants to post.'),
  ventText: z.string().describe('The original vent text that the user is commenting on, for context.'),
});
export type EmpathyCheckInput = z.infer<typeof EmpathyCheckInputSchema>;

const EmpathyCheckOutputSchema = z.object({
  isEmpathetic: z.boolean().describe('Whether the comment is empathetic and supportive enough to post without guidance.'),
  suggestion: z.string().optional().describe('A gentle suggestion for how to reframe the comment, only provided if isEmpathetic is false.'),
  tone: z.enum(['supportive', 'neutral', 'dismissive', 'invalidating', 'cold']).describe('The detected emotional tone of the comment.'),
});
export type EmpathyCheckOutput = z.infer<typeof EmpathyCheckOutputSchema>;


export async function checkCommentEmpathy(input: EmpathyCheckInput): Promise<EmpathyCheckOutput> {
  return empathyCheckFlow(input);
}


const empathyPrompt = ai.definePrompt({
  name: 'empathyCheckPrompt',
  input: { schema: EmpathyCheckInputSchema },
  output: { schema: EmpathyCheckOutputSchema },
  prompt: `You are an empathy coach on a mental health support platform. A user is about to post a comment in response to someone else's vulnerable vent. Your job is to gently assess whether the comment might feel dismissive or invalidating to the person who vented.

**IMPORTANT: You are NOT a censor. You are a coach.** Most comments should pass. Only flag comments that are genuinely cold, dismissive, or invalidating.

**The original vent:**
"{{{ventText}}}"

**The draft comment:**
"{{{commentText}}}"

**Decision Framework:**

✅ **Mark as empathetic (isEmpathetic = true) if the comment:**
- Acknowledges or validates feelings ("That sounds really hard")
- Shares a relatable experience ("I've been there too")
- Offers encouragement ("You're stronger than you think")
- Asks caring questions ("How are you holding up?")
- Is neutral but harmless ("Thanks for sharing")
- Uses humor that's clearly warm and connected
- Is brief but kind ("❤️", "Sending hugs", "I hear you")

❌ **Mark as NOT empathetic (isEmpathetic = false) if the comment:**
- Dismisses feelings ("It's not that bad", "Others have it worse")
- Gives unsolicited fix-it advice without acknowledging feelings ("Just exercise more", "Have you tried meditating?")
- Minimizes their experience ("You're overreacting", "It'll pass")
- Is cold or disconnected ("Ok", "And?", "So what?")
- Uses toxic positivity ("Just be positive!", "Everything happens for a reason")

**When providing a suggestion:**
- Be gentle and non-judgmental toward the commenter
- Frame it as a perspective, not a command
- Keep it to 1-2 sentences
- Example: "This might feel a bit dismissive to someone who's hurting. Consider acknowledging their feelings first — even a small 'that sounds tough' can make a big difference."

**Edge Cases:**
- Short comments like "❤️" or "🫂" → empathetic (true)
- "Same" or "Mood" → empathetic (true, it's relatable)
- "Interesting" → neutral, empathetic (true)
- "Just stop thinking about it" → not empathetic (false)

Analyze the comment and return your assessment.`,
});


const empathyCheckFlow = ai.defineFlow(
  {
    name: 'empathyCheckFlow',
    inputSchema: EmpathyCheckInputSchema,
    outputSchema: EmpathyCheckOutputSchema,
  },
  async (input) => {
    const { output } = await empathyPrompt(input);
    return output!;
  }
);
