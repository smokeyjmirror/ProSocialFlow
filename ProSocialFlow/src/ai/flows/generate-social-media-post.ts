'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating substantial 
 * "This Week In [Category]" reports for Discord.
 *
 * It uses the googleSearch tool to fetch recent news and context, ensuring 
 * the output is robust, educational, and fits within Discord's 2000-character limit.
 *
 * @fileExport generateSocialMediaPosts - An async function that triggers the report generation flow.
 * @fileExport GenerateSocialMediaPostsInput - The input type for the function.
 * @fileExport GenerateSocialMediaPostsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirebaseServer } from '@/firebase/server-init';

const PostSchema = z.object({
  topic: z.string().describe('The specific topic or focus of the report.'),
  category: z
    .string()
    .describe(
      'The category of the report (e.g., "STEM", "AI and Machine Learning").'
    ),
  post: z.string().describe('The generated "This Week In" report content in Discord markdown.'),
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

const generateWeeklyReportPrompt = ai.definePrompt({
  name: 'generateWeeklyReportPrompt',
  input: {
    schema: z.object({
      topicsJson: z.string(),
    }),
  },
  output: {
    schema: GenerateSocialMediaPostsOutputSchema,
  },
  system: `
You are a high-level Knowledge Curator and Investigative Journalist. You value logic, verified evidence, and progressive paradigms. Your goal is to provide a "Weekly Intelligence Briefing" for each topic provided.

Your tone is enthusiastic, sophisticated, and deeply informative. You are a "smart friend" who has spent the week reading everything on a subject and is now summarizing the most vital parts. Use Discord-friendly markdown (bolding for emphasis, bullet points for clarity).

CRITICAL CONSTRAINTS:
1. Format: Start with a catchy headline like "📡 **THIS WEEK IN [CATEGORY]**".
2. Content: Include 2-3 significant developments or deep-dive insights.
3. Character Limit: Each individual post MUST be under 1,800 characters to ensure it fits comfortably in a single Discord message with tags.
4. Logic & Reason: Focus on why these developments matter for the future.
`,
  prompt: `
Generate a comprehensive weekly report for each of these topics:
{{{topicsJson}}}

Use your search tools to find recent news (within the last 7 days) or significant historical context related to these topics. 

For each report:
- Headline: # THIS WEEK IN [CATEGORY]
- Summary: A robust overview of recent news or deep-dive facts.
- The "Why It Matters": A concluding section on the implications of this knowledge.
- Style: Use bullet points and bold headers.

Do not include hashtags in the raw response.
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

    const { output } = await generateWeeklyReportPrompt({
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
