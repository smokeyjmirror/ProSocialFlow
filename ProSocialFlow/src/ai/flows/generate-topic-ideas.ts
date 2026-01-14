
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a batch of unique topic ideas.
 *
 * The flow takes a list of categories and returns a dictionary of unique topic ideas, one for each category.
 *
 * @fileExport generateTopicIdeas - An async function that triggers the topic idea generation flow.
 * @fileExport GenerateTopicIdeasInput - The input type for the generateTopicIdeas function.
 * @fileExport GenerateTopicIdeasOutput - The output type for the generateTopicIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateTopicIdeasInputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('The list of categories to generate ideas for.'),
});

// The output schema is now a record, which is more flexible for the flow's output contract.
const GenerateTopicIdeasOutputSchema = z.object({
    ideas: z.record(z.string()).describe('A dictionary where keys are categories and values are the generated ideas.'),
});


export type GenerateTopicIdeasInput = z.infer<
  typeof GenerateTopicIdeasInputSchema
>;
export type GenerateTopicIdeasOutput = z.infer<
  typeof GenerateTopicIdeasOutputSchema
>;

// This function dynamically creates a prompt with a schema based on the input categories.
const createTopicIdeasPrompt = (categories: string[]) => {
  // Dynamically build the output schema with explicit properties for each category.
  // This is required by the Google AI API to avoid the "should be non-empty for OBJECT type" error.
  const dynamicOutputSchema = z.object({
    ideas: z.object(
        categories.reduce((acc, category) => {
            acc[category] = z.string().describe(`A topic idea for the category: ${category}`);
            return acc;
        }, {} as Record<string, z.ZodString>)
    )
  });

  return ai.definePrompt({
    name: 'generateTopicIdeasDynamicPrompt',
    input: {
      schema: z.object({
        categoriesJson: z.string(),
      }),
    },
    output: {
      schema: dynamicOutputSchema,
    },
    system: `
You are a brilliant and creative brainstormer. Your goal is to generate a novel, interesting, and specific topic idea for each category provided.
`,
    prompt: `
Generate one unique, specific, and engaging topic idea for each category in the following JSON array: **{{{categoriesJson}}}**

Each idea should be concise, like a headline or a short sentence. It should not be a question.

Format the entire output as a single JSON object that strictly follows the requested schema. The output must have a single key "ideas" which is an object where keys are the category names and values are the generated topic ideas.
`,
  });
};

export async function generateTopicIdeas(
  input: GenerateTopicIdeasInput
): Promise<GenerateTopicIdeasOutput> {
  return generateTopicIdeasFlow(input);
}

const generateTopicIdeasFlow = ai.defineFlow(
  {
    name: 'generateTopicIdeasFlow',
    inputSchema: GenerateTopicIdeasInputSchema,
    outputSchema: GenerateTopicIdeasOutputSchema, // The flow's public output remains the general record type for flexibility.
  },
  async ({categories}) => {
    if (!categories || categories.length === 0) {
      return {ideas: {}};
    }

    // Create the prompt dynamically based on the categories provided in the input.
    const generateTopicIdeasPrompt = createTopicIdeasPrompt(categories);

    const {output} = await generateTopicIdeasPrompt({
      categoriesJson: JSON.stringify(categories),
    });

    // The output from the prompt will have the dynamically generated schema,
    // but it is compatible with the general record type defined for the flow's output.
    return output ?? {ideas: {}};
  }
);
