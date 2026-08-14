import {genkit} from 'genkit';
import {openAICompatible} from '@genkit-ai/compat-oai';
import { config } from 'dotenv';

config();

export const ai = genkit({
  plugins: [
    openAICompatible({
        name: 'groq',
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
    })
  ],
  model: 'groq/llama-3.3-70b-versatile',
});

