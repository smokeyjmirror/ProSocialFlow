'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a batch of educational
 * "Today I Learned" facts based on a list of user-selected topics.
 *
 * @fileExport generateSocialMediaPosts - An async function that triggers the TIL generation flow.
 * @fileExport GenerateSocialMediaPostsInput - The input type for the generateSocialMediaPosts function.
 * @fileExport GenerateSocialMediaPostsOutput - The output type for the generateSocialMediaPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirebaseServer } from '@/firebase/server-init';

const PostSchema = z.object({
  topic: z.string().describe('The specific sub-topic or fact subject.'),
  category: z
    .string()
    .describe(
      'The category of the fact (e.g., "STEM", "AI and Machine Learning").'
    ),
  post: z.string().describe('The generated "Today I Learned" educational content.'),
});

const SelectedTopicSchema = z.object({
  category: z.string(),
  topic: z.string(),
});

const GenerateSocialMediaPostsInputSchema = z.object({
  selectedTopics: z.array(SelectedTopicSchema),
});

const GenerateSocialMediaPostsOutputSchema = z.object({
  posts: z.array(PostSchema),
});

export type GenerateSocialMediaPostsInput = z.infer<
  typeof GenerateSocialMediaPostsInputSchema
>;
export type GenerateSocialMediaPostsOutput = z.infer<
  typeof GenerateSocialMediaPostsOutputSchema
>;
export type SocialPost = z.infer<typeof PostSchema>;

const TOPIC_HISTORY_LIMIT = 20;

const generateSocialMediaPostsPrompt = ai.definePrompt({
  name: 'generateSocialMediaPostsPrompt',
  input: {
    schema: z.object({
      topicsJson: z.string(),
    }),
  },
  output: {
    schema: GenerateSocialMediaPostsOutputSchema,
  },
  system: `
You are a hybrid of a Curious Educator and a Knowledge Curator. You value ontology, epistemology, logic, and reason. You are an expert at distilling complex subjects into fascinating, accessible "Today I Learned" (TIL) insights. Your personality is that of an avid, lifelong learner with a witty and charming edge.

Your tone is consistently positive, enthusiastic, and shares a deep sense of wonder about the world. You are not here to preach or tell people what to do; instead, you are sharing fascinating discoveries as if you're a knowledgeable friend revealing a hidden gem of truth. You verify facts with multiple reliable sources and explain *why* a piece of knowledge matters in a broader context. Avoid negative framing, clichés, or clickbait phrases. Write with genuine curiosity and intellectual depth.
`,
  prompt: `
Your goal is to generate one profound and engaging "Today I Learned" (TIL) fact for each topic provided.

For each TIL entry:
1. Start with a clear, surprising, or insightful fact.
2. Follow up with 1-2 sentences of context explaining why this matters or how it fits into the bigger picture of that field.
3. Do not add any hashtags to the raw generation.

Selected Topics:
{{{topicsJson}}}

Reflect your values of logic, reason, and progressive paradigms. Ensure the tone is authentic and educational, avoiding marketing-speak.

Format the entire output as a single JSON object with a key "posts" which is an array of objects. Populate 'topic' and 'category' exactly as provided.
`,
});

async function updateTopicHistory(firestore: any, posts: SocialPost[]) {
  for (const post of posts) {
    const category = post.category;
    const topic = post.topic;

    if (!category) continue;

    const docRef = doc(firestore, 'topic_history', category);
    const docSnap = await getDoc(docRef);

    let recentTopics: string[] = [];
    if (docSnap.exists()) {
      recentTopics = docSnap.data().recentTopics || [];
    }

    if (!recentTopics.includes(topic)) {
      recentTopics.unshift(topic);
    }
    
    if (recentTopics.length > TOPIC_HISTORY_LIMIT) {
      recentTopics = recentTopics.slice(0, TOPIC_HISTORY_LIMIT);
    }

    await setDoc(
      docRef,
      { category, recentTopics, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }
}

export async function generateSocialMediaPosts(
  input: GenerateSocialMediaPostsInput
): Promise<GenerateSocialMediaPostsOutput> {
  return generateSocialMediaPostsFlow(input);
}

const generateSocialMediaPostsFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaPostsFlow',
    inputSchema: GenerateSocialMediaPostsInputSchema,
    outputSchema: GenerateSocialMediaPostsOutputSchema,
  },
  async ({ selectedTopics }) => {
    if (!selectedTopics || selectedTopics.length === 0) {
      return { posts: [] };
    }

    const categoryToHashtag: Record<string, string> = {
      'STEM': '#stem',
      'AI and Machine Learning': '#ai-agi-asi',
      'Wildlife and Nature': '#wildlife',
      'Vegan Living': '#vegan-living',
      'Sports': '#sports',
      'Politics': '#politics',
      'Streaming Culture': '#streaming-music-movies-series',
      'Gaming News': '#gaming',
    };

    const { firestore } = await initializeFirebaseServer();
    const auth = getAuth();
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    const { output } = await generateSocialMediaPostsPrompt({
      topicsJson: JSON.stringify(selectedTopics, null, 2),
    });

    if (!output) {
      return { posts: [] };
    }

    const postsWithHashtags = output.posts.map((post) => {
      const hashtag = categoryToHashtag[post.category];
      if (hashtag) {
        return {
          ...post,
          post: `${post.post.trim()}\n\n${hashtag}`,
        };
      }
      return post;
    });

    const finalOutput = { posts: postsWithHashtags };

    await updateTopicHistory(firestore, finalOutput.posts);

    return finalOutput;
  }
);
