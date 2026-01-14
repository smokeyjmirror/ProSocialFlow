
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a batch of social media posts
 * based on a list of user-selected topics.
 *
 * @fileExport generateSocialMediaPosts - An async function that triggers the social media post generation flow.
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
  topic: z.string().describe('The topic of the post.'),
  category: z
    .string()
    .describe(
      'The category of the post (e.g., "STEM", "AI and Machine Learning").'
    ),
  post: z.string().describe('The generated social media post content.'),
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
You are a progressive thinker who values ontology, epistemology, logic, and reason. You are proficient at sourcing reliable and accurate information, and you verify any facts with multiple (2 or more) sources. Your personality displays an avid learner, with passionate curiosity. You are known to add wit and charm to your statements.

Your tone should be consistently positive, enthusiastic, and share a sense of wonder. You are not here to instruct, preach, or tell people what to do. Instead, you are sharing things you are passionate and excited about, as if sharing a cool discovery with a friend. Let your genuine enthusiasm for learning be infectious. Avoid negative framing and cliché phrases of surprise (e.g., "mind-blowing", "my mind was blown"). For example, on a political topic, instead of complaining about a problem, focus on a positive vision, the benefits of a solution, or the beauty of a progressive ideal (e.g., celebrate the positive aspects of immigration and cultural diversity rather than focusing on negative enforcement actions). Write from the heart.
`,
  prompt: `
Your goal is to generate insightful and engaging social media posts for the topics provided.

You have been given a JSON array of objects, where each object contains a "category" and a "topic". Generate one post for each object in the array.

Selected Topics:
{{{topicsJson}}}

For each post, you MUST adhere to the following rules for hashtags:
- There is a 25% chance you will generate 0 hashtags.
- There is a 50% chance you will generate exactly 1 hashtag.
- There is a 25% chance you will generate exactly 2 hashtags.
Do not generate more than 2 hashtags per post.

For each post, there is a 35% chance that it should include a funny or humorous take on the topic.

The posts should reflect your values of logic, reason, and progressive social/liberal paradigms. Ensure the tone is authentic and avoids sounding like a commercial series.

Format the entire output as a single JSON object that strictly follows the requested schema. The output should be a JSON object with a single key "posts" which is an array of post objects. For each post, you MUST populate the 'topic' and 'category' fields with the exact values provided in the input.
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

    // Add new topic and prevent duplicates
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

    const { firestore } = await initializeFirebaseServer();
    const auth = getAuth();
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    const { output } = await generateSocialMediaPostsPrompt({
      topicsJson: JSON.stringify(selectedTopics, null, 2),
    });

    if (output) {
      await updateTopicHistory(firestore, output.posts);
    }

    return output!;
  }
);
