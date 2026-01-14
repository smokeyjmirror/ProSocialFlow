
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating an "Image of the Day".
 *
 * The flow generates an image based on the current date using a free placeholder service
 * and also generates descriptive alt text for the image by analyzing its content.
 *
 * @fileExport generateImageOfTheDay - An async function that triggers the image generation flow.
 * @fileExport GenerateImageOfTheDayOutput - The output type for the generateImageOfTheDay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageOfTheDayOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
  altText: z
    .string()
    .describe(
      'A descriptive, one-sentence alt text for the image, including what is in the image and the date context.'
    ),
});

export type GenerateImageOfTheDayOutput = z.infer<
  typeof GenerateImageOfTheDayOutputSchema
>;

const describeImagePrompt = ai.definePrompt({
  name: 'describeImagePrompt',
  input: {
    schema: z.object({
      imageUrl: z.string(),
      dateContext: z.string(),
    }),
  },
  output: {schema: z.object({altText: z.string()})},
  prompt: `
Analyze the provided image. Generate a short, one-sentence descriptive alt text.

The alt text must:
1.  Briefly describe the main subject and contents of the image.
2.  Incorporate the following context: {{{dateContext}}}.

Example: "A winding road through a sunlit forest, representing the journey on the 281st day of the year, a Tuesday."

Image: {{media url=imageUrl}}
`,
});

export async function generateImageOfTheDay(): Promise<GenerateImageOfTheDayOutput> {
  return generateImageOfTheDayFlow();
}

const generateImageOfTheDayFlow = ai.defineFlow(
  {
    name: 'generateImageOfTheDayFlow',
    outputSchema: GenerateImageOfTheDayOutputSchema,
  },
  async () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const dayOfWeek = now.toLocaleString('en-US', {weekday: 'long'});
    const fullDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const imageSize = 512;
    // Use a random seed to get a new image on each click
    const randomSeed = Math.floor(Math.random() * 100000);
    const imageUrl = `https://picsum.photos/seed/${randomSeed}/${imageSize}/${imageSize}`;

    const dateContext = `${fullDate} (${dayOfWeek}, day ${dayOfYear} of the year)`;

    const {output} = await describeImagePrompt({
      imageUrl: imageUrl,
      dateContext: dateContext,
    });

    return {
      imageUrl: imageUrl,
      altText:
        output?.altText ??
        `An image for ${dateContext}.`,
    };
  }
);
