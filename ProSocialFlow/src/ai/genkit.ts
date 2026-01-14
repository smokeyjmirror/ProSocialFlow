
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';

const googleAiPlugin = googleAI({
  apiVersion: 'v1beta',
});

export const ai = genkit({
  plugins: [googleAiPlugin],
  model: 'googleai/gemini-2.5-flash',
  tools: ['googleSearch'],
});
