'use server';
/**
 * @fileOverview Analyzes uploaded videos for deepfake indicators and returns a probability score.
 *
 * - processVideoForDeepfakes - Analyzes the video and returns a deepfake probability score.
 * - ProcessVideoForDeepfakesInput - The input type for the processVideoForDeepfakes function.
 * - ProcessVideoForDeepfakesOutput - The return type for the processVideoForDeepfakes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessVideoForDeepfakesInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessVideoForDeepfakesInput = z.infer<typeof ProcessVideoForDeepfakesInputSchema>;

const ProcessVideoForDeepfakesOutputSchema = z.object({
  deepfakeProbability: z
    .number()
    .describe('The probability (0-1) that the video is a deepfake.'),
  anomalyExplanation: z
    .string()
    .describe('Explanation of detected anomalies indicating a deepfake.'),
});
export type ProcessVideoForDeepfakesOutput = z.infer<typeof ProcessVideoForDeepfakesOutputSchema>;

export async function processVideoForDeepfakes(
  input: ProcessVideoForDeepfakesInput
): Promise<ProcessVideoForDeepfakesOutput> {
  return processVideoForDeepfakesFlow(input);
}

const processVideoForDeepfakesPrompt = ai.definePrompt({
  name: 'processVideoForDeepfakesPrompt',
  input: {schema: ProcessVideoForDeepfakesInputSchema},
  output: {schema: ProcessVideoForDeepfakesOutputSchema},
  prompt: `Analyze the following video for deepfake indicators such as unnatural blinking,
head pose mismatch, and lip-sync issues. Provide a probability score (0-1) indicating the likelihood
that the video is a deepfake and explain the detected anomalies.

Video: {{media url=videoDataUri}}`,
});

const processVideoForDeepfakesFlow = ai.defineFlow(
  {
    name: 'processVideoForDeepfakesFlow',
    inputSchema: ProcessVideoForDeepfakesInputSchema,
    outputSchema: ProcessVideoForDeepfakesOutputSchema,
  },
  async input => {
    const {output} = await processVideoForDeepfakesPrompt(input);
    return output!;
  }
);
