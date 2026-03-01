import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { config } from 'dotenv';

config();

const plugins = [];

if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI());
} else {
    console.warn("GEMINI_API_KEY is not set. GenAI features will be disabled.");
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.5-flash',
});
