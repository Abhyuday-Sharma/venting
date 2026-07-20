
'use server';

/**
 * @fileOverview AI-powered semantic safety moderation for vents and comments.
 *
 * Replaces brittle keyword matching with contextual AI analysis that understands
 * the difference between emotional expression and actual safety risks.
 *
 * - analyzeContentSafety - Main function to analyze content safety.
 * - SafetyModerationInput - The input type.
 * - SafetyModerationOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SafetyModerationInputSchema = z.object({
  text: z.string().describe('The text content to analyze for safety.'),
  contentType: z.enum(['vent', 'comment']).describe('Whether this is a vent (user expressing themselves) or a comment (response to someone else\'s vent).'),
});
export type SafetyModerationInput = z.infer<typeof SafetyModerationInputSchema>;

const SafetyModerationOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the content is safe to publish.'),
  severity: z.enum(['none', 'low', 'medium', 'high', 'critical']).describe('The severity level of the detected issue.'),
  intentTag: z.string().describe('A short tag describing the detected intent (e.g., "emotional_expression", "self_harm_risk", "harassment", "supportive", "spam").'),
  action: z.object({
    publish: z.boolean().describe('Whether the content should be published/visible.'),
    showSupportMessage: z.boolean().describe('Whether to show mental health support resources to the user.'),
    blockImmediately: z.boolean().describe('Whether the content should be immediately blocked and hidden.'),
    safetyFlag: z.boolean().describe('Whether to flag this content for review.'),
    disableComments: z.boolean().describe('Whether to disable comments on this content (for vents only).'),
  }),
  reason: z.string().optional().describe('A brief, internal explanation of why this decision was made. Not shown to the user.'),
});
export type SafetyModerationOutput = z.infer<typeof SafetyModerationOutputSchema>;


export async function analyzeContentSafety(input: SafetyModerationInput): Promise<SafetyModerationOutput> {
  return safetyModerationFlow(input);
}


const safetyPrompt = ai.definePrompt({
  name: 'safetyModerationPrompt',
  input: { schema: SafetyModerationInputSchema },
  output: { schema: SafetyModerationOutputSchema },
  prompt: `You are an expert content safety moderator for a mental health and emotional support platform called "Venting." Users come here to express difficult emotions, seek peer support, and reflect on their lives.

**YOUR MOST IMPORTANT PRINCIPLE: This is a venting platform. Emotional expression — even deeply painful, dark, or hopeless feelings — is ALLOWED and EXPECTED. Your job is to protect users from harm, NOT to censor their pain.**

You are analyzing a {{contentType}}.

**Content to analyze:**
"{{{text}}}"

**Decision Framework:**

### For VENTS (user expressing their own feelings):
| Intent | Severity | Action |
|--------|----------|--------|
| Emotional expression (sadness, anger, frustration, grief, loneliness, feeling lost) | none | publish=true, showSupportMessage=false, blockImmediately=false, safetyFlag=false, disableComments=false |
| Passive distress / hopelessness ("I feel empty", "nothing matters", "I'm so tired of everything") | low | publish=true, showSupportMessage=false, blockImmediately=false, safetyFlag=false, disableComments=false |
| Passive death wishes / intense crisis language ("I wish I could disappear", "I don't want to be here anymore", "better off dead") | medium | publish=true, showSupportMessage=true, blockImmediately=false, safetyFlag=true, disableComments=true |
| Active self-harm intent with specificity ("I'm going to...", detailed plans) | high | publish=true, showSupportMessage=true, blockImmediately=false, safetyFlag=true, disableComments=true |
| Harassment, hate speech, or attacks directed at others | high | publish=false, showSupportMessage=false, blockImmediately=true, safetyFlag=true, disableComments=false |
| Spam, trolling, or commercial content | medium | publish=false, showSupportMessage=false, blockImmediately=true, safetyFlag=false, disableComments=false |

### For COMMENTS (response to someone else's vent):
| Intent | Severity | Action |
|--------|----------|--------|
| Supportive, empathetic, kind | none | publish=true, showSupportMessage=false, blockImmediately=false, safetyFlag=false, disableComments=false |
| Neutral / conversational | none | publish=true, showSupportMessage=false, blockImmediately=false, safetyFlag=false, disableComments=false |
| Dismissive or mildly invalidating ("just get over it") | low | publish=true, showSupportMessage=false, blockImmediately=false, safetyFlag=false, disableComments=false |
| Encouraging self-harm or suicide | critical | publish=false, showSupportMessage=false, blockImmediately=true, safetyFlag=true, disableComments=false |
| Providing self-harm instructions or methods | critical | publish=false, showSupportMessage=false, blockImmediately=true, safetyFlag=true, disableComments=false |
| Harassment, bullying, hate, personal attacks, gaslighting | high | publish=false, showSupportMessage=false, blockImmediately=true, safetyFlag=true, disableComments=false |
| Spam, trolling, or commercial content | medium | publish=false, showSupportMessage=false, blockImmediately=true, safetyFlag=false, disableComments=false |

**Key Nuances to Understand:**
1. "I want to die" in a vent is an expression of pain (medium severity, show support) — NOT something to block.
2. "You should die" in a comment is encouragement of harm (critical severity, block immediately).
3. Sarcasm and dark humor about one's own situation are ALLOWED in vents.
4. Passive-aggressive comments ("maybe you're just too sensitive") should be flagged as low severity but still published.
5. When in doubt about a vent, err on the side of ALLOWING it. When in doubt about a comment, err on the side of FLAGGING it.

Analyze the content and return your structured evaluation.`,
});


const safetyModerationFlow = ai.defineFlow(
  {
    name: 'safetyModerationFlow',
    inputSchema: SafetyModerationInputSchema,
    outputSchema: SafetyModerationOutputSchema,
  },
  async (input) => {
    const { output } = await safetyPrompt(input);
    return output!;
  }
);
