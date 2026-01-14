
'use server';

import {
  generateSocialMediaPosts,
  type GenerateSocialMediaPostsInput
} from '@/ai/flows/generate-social-media-post';
import { generateImageOfTheDay } from '@/ai/flows/generate-image-of-the-day';
import { generateTopicIdeas } from '@/ai/flows/generate-topic-ideas';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { getFirestore, collection, getDocs } from 'firebase/firestore';


export async function generateIdeasAction(categories: string[]) {
    try {
        if (!categories || categories.length === 0) {
            return {
                success: false,
                error: 'No categories provided.',
            };
        }
        const result = await generateTopicIdeas({ categories });
        return {
            success: true,
            data: result.ideas,
        };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
            success: false,
            error: `Failed to generate ideas: ${errorMessage}`,
        };
    }
}


export async function generatePostsAction(input: GenerateSocialMediaPostsInput) {
  try {
    if (!input.selectedTopics || input.selectedTopics.length === 0) {
        return {
            success: false,
            error: 'No topics selected.',
        };
    }
    const result = await generateSocialMediaPosts(input);
    return {
      success: true,
      data: result.posts,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `Failed to generate posts: ${errorMessage}`,
    };
  }
}

export async function generateImageOfTheDayAction() {
  try {
    const result = await generateImageOfTheDay();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `Failed to generate image: ${errorMessage}`,
    };
  }
}

export async function getTopicHistoryAction() {
  try {
    const { firestore } = await initializeFirebaseServer();
    const historyCollection = collection(firestore, 'topic_history');
    const snapshot = await getDocs(historyCollection);
    
    if (snapshot.empty) {
      return {
        success: true,
        data: {},
      };
    }

    const historyData: Record<string, string[]> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      historyData[doc.id] = data.recentTopics || [];
    });

    return {
      success: true,
      data: historyData,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `Failed to fetch topic history: ${errorMessage}`,
    };
  }
}
