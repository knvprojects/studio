'use server';

/**
 * @fileOverview Explains detected anomalies in an image or video analysis.
 *
 * - explainDetectedAnomalies - A function that explains the detected anomalies.
 * - ExplainDetectedAnomaliesInput - The input type for the explainDetectedAnomalies function.
 * - ExplainDetectedAnomaliesOutput - The return type for the explainDetectedAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDetectedAnomaliesInputSchema = z.object({
  mediaType: z.enum(['image', 'video']).describe('The type of media being analyzed.'),
  probabilityScore: z.number().describe('The probability score indicating whether the media is real or AI-generated.'),
  detectedAnomalies: z.array(z.string()).describe('A list of detected anomalies in the analyzed media.'),
});
export type ExplainDetectedAnomaliesInput = z.infer<typeof ExplainDetectedAnomaliesInputSchema>;

const ExplainDetectedAnomaliesOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the detected anomalies and their impact on the probability score.'),
});
export type ExplainDetectedAnomaliesOutput = z.infer<typeof ExplainDetectedAnomaliesOutputSchema>;

export async function explainDetectedAnomalies(input: ExplainDetectedAnomaliesInput): Promise<ExplainDetectedAnomaliesOutput> {
  return explainDetectedAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainDetectedAnomaliesPrompt',
  input: {schema: ExplainDetectedAnomaliesInputSchema},
  output: {schema: ExplainDetectedAnomaliesOutputSchema},
  prompt: `You are an expert in explaining the results of AI-based media analysis.

You will receive the type of media analyzed ({{{mediaType}}}), a probability score indicating whether the media is real or AI-generated ({{{probabilityScore}}}), and a list of detected anomalies.

Your task is to provide a detailed and easy-to-understand explanation of how these anomalies contribute to the probability score.

Detected Anomalies:
{{#each detectedAnomalies}}
- {{{this}}}
{{/each}}

Explain how each anomaly affects the likelihood of the media being AI-generated, and summarize the overall reasoning behind the probability score.  Use language that a non-expert can understand.

Format the explanation as a paragraph.`,
});

const explainDetectedAnomaliesFlow = ai.defineFlow(
  {
    name: 'explainDetectedAnomaliesFlow',
    inputSchema: ExplainDetectedAnomaliesInputSchema,
    outputSchema: ExplainDetectedAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
