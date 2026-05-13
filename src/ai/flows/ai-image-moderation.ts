'use server';

/**
 * @fileOverview An AI-powered image moderation system.
 *
 * - moderateImage - A function that analyzes an image for compliance with safety policies.
 * - ImageModerationInput - The input type for the moderateImage function.
 * - ImageModerationOutput - The return type for the moderateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageModerationInputSchema = z.object({
    imageUrl: z.string().url().describe('The public URL of the image to moderate.'),
});
export type ImageModerationInput = z.infer<typeof ImageModerationInputSchema>;

const ImageModerationOutputSchema = z.object({
    isSafe: z.boolean().describe('Whether the image is considered safe for a profile picture.'),
    reason: z.string().optional().describe('A brief explanation if the image is not safe.'),
});
export type ImageModerationOutput = z.infer<typeof ImageModerationOutputSchema>;


export async function moderateImage(input: ImageModerationInput): Promise<ImageModerationOutput> {
    return imageModerationFlow(input);
}


const imageModerationPrompt = ai.definePrompt({
    name: 'imageModerationPrompt',
    input: { schema: ImageModerationInputSchema },
    output: { schema: ImageModerationOutputSchema },
    prompt: `You are a strict AI moderator for a mental health support platform. Your task is to determine if an image is appropriate for a user's profile picture based on the following detailed policy. If an image is even borderline, you must err on the side of caution and reject it.

    **Inappropriate Profile Picture Content (Not Allowed)**
    The AI moderation system must reject, block, or require review for any profile image that falls under the following categories:

    1.  **Sexual or Explicit Content:** Nudity or partial nudity, sexually suggestive poses, fetish content, explicit sexual imagery, pornographic content, sexualized depictions of minors (zero tolerance).
    2.  **Violence or Graphic Content:** Physical violence, weapons used in a threatening manner, blood, gore, graphic injury, depictions of self-harm or suicide.
    3.  **Hate, Extremism, or Discrimination:** Hate symbols (racist, religious, extremist), Nazi or terrorist symbols, content promoting violence or hatred toward individuals or groups based on race, religion, gender, sexuality, etc.
    4.  **Harassment or Abusive Imagery:** Images intended to mock, shame, or insult others; threatening gestures.
    5.  **Illegal or Harmful Activities:** Drug use or paraphernalia, promotion of illegal acts, depictions of criminal acts.
    6.  **Self-Harm & Mental Health Risk Content:** Images promoting or glorifying self-harm or suicide.
    7.  **False Identity or Impersonation:** Using photos of public figures, celebrities, or influencers without authorization; impersonating another individual.
    8.  **Offensive or Disturbing Content:** Shock imagery, disturbing or traumatic visuals, content designed to provoke fear or disgust.
    9.  **Spam, Advertising, or Irrelevant Content:** Logos, QR codes, advertisements, promotional posters, irrelevant memes.
    10. **Copyright & Ownership Issues:** Images you do not own or have rights to use.

    **Analyze the following image. Be strict in your assessment.** If the image contains any of the prohibited content, you must flag it as not safe. A simple, abstract image or a standard, non-violating portrait is considered safe.

    Image to analyze: {{media url=imageUrl}}
    
    Return a JSON object indicating if the image is safe. If it is not safe, provide a brief, general reason based on the categories above (e.g., "Image contains graphic content" or "Image violates policy on hate symbols").`,
});


const imageModerationFlow = ai.defineFlow(
    {
        name: 'imageModerationFlow',
        inputSchema: ImageModerationInputSchema,
        outputSchema: ImageModerationOutputSchema,
    },
    async (input) => {
        const { output } = await imageModerationPrompt(input);
        return output!;
    }
);
