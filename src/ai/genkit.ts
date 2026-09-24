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
  // llama-3.3-70b-versatile was retired by Groq; check GET /openai/v1/models before changing this.
  model: 'groq/openai/gpt-oss-120b',
});

