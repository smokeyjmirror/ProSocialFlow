
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-social-media-post.ts';
import '@/ai/flows/generate-image-of-the-day.ts';
import '@/ai/flows/generate-topic-ideas.ts';
