// 'use server'
'use server';
/**
 * @fileOverview A school notice summarization AI agent.
 *
 * - summarizeNotices - A function that handles the notice summarization process.
 * - SummarizeNoticesInput - The input type for the summarizeNotices function.
 * - SummarizeNoticesOutput - The return type for the summarizeNotices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNoticesInputSchema = z.object({
  noticeText: z
    .string()
    .describe('The full text of the school notice to be summarized.'),
});
export type SummarizeNoticesInput = z.infer<typeof SummarizeNoticesInputSchema>;

const SummarizeNoticesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the school notice.'),
});
export type SummarizeNoticesOutput = z.infer<typeof SummarizeNoticesOutputSchema>;

export async function summarizeNotices(input: SummarizeNoticesInput): Promise<SummarizeNoticesOutput> {
  return summarizeNoticesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNoticesPrompt',
  input: {schema: SummarizeNoticesInputSchema},
  output: {schema: SummarizeNoticesOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing school notices for parents.

  Given the following school notice, create a concise and informative summary that captures the key information parents need to know.

  Notice Text: {{{noticeText}}}
  `,
});

const summarizeNoticesFlow = ai.defineFlow(
  {
    name: 'summarizeNoticesFlow',
    inputSchema: SummarizeNoticesInputSchema,
    outputSchema: SummarizeNoticesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
