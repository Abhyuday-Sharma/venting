import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';
import {openAICompatible} from '@genkit-ai/compat-oai';
import { config } from 'dotenv';

config();

const plugins = [];

if (process.env.GROQ_API_KEY) {
    plugins.push(groq({ apiKey: process.env.GROQ_API_KEY }));
} else {
    console.warn("GROQ_API_KEY is not set.");
}

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    plugins.push(
      openAICompatible({
        name: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://models.inference.ai.azure.com',
      })
    );
} else {
    console.warn("OPENAI_API_KEY is not set.");
}

// Select default model: prefer OpenAI if configured, otherwise fallback to Groq
const defaultModel = (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here')
  ? 'openai/gpt-4o-mini'
  : 'groq/llama-3.3-70b-versatile';

export const ai = genkit({
  plugins: plugins,
  model: defaultModel,
});

