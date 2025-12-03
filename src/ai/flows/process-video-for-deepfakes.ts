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

const ForensicIndicatorSchema = z.object({
  name: z.string().describe('Name of the forensic indicator.'),
  score: z.number().describe('Score from 0 to 1 for this indicator.'),
});

const ProcessVideoForDeepfakesOutputSchema = z.object({
  deepfakeProbability: z
    .number()
    .describe('The probability (0-1) that the video is a deepfake.'),
  anomalyExplanation: z
    .string()
    .describe('A detailed explanation of detected anomalies indicating a deepfake.'),
  forensicIndicators: z
    .array(ForensicIndicatorSchema)
    .describe(
      'A list of forensic indicators and their scores, such as Unnatural Blinking, Head Pose Mismatch, and Lip-Sync Issues.'
    ),
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
  prompt: `Analyze the following video for deepfake indicators.

Video: {{media url=videoDataUri}}

Based on your analysis, provide:
1.  A probability score (0-1) indicating the likelihood that the video is a deepfake.
2.  A detailed explanation of detected anomalies.
3.  A list of scores for the following forensic indicators: 'Unnatural Blinking', 'Head Pose Mismatch', 'Lip-Sync Issues', 'Facial Landmark Mismatch', 'Unusual Head/Face Movements', 'Audio-Visual Sync'. Each score should be a number between 0 and 1, where a higher score indicates a higher likelihood of that deepfake indicator being present. These scores should correlate with your overall probability.

Return the deepfake probability, a detailed anomaly explanation, and the forensic indicator scores.`,
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
