import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';
import { config } from 'dotenv';

config();

const plugins = [];

if (process.env.GROQ_API_KEY) {
    plugins.push(groq({ apiKey: process.env.GROQ_API_KEY }));
} else {
    console.warn("GROQ_API_KEY is not set. GenAI features will be disabled.");
}

export const ai = genkit({
  plugins: plugins,
  model: 'groq/llama-3.3-70b-versatile',
});
