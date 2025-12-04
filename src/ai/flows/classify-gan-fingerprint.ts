
// This is an AI-powered tool to classify the GAN fingerprint of AI-generated images.

'use server';

/**
 * @fileOverview Classifies the source model of an AI-generated image by analyzing its GAN fingerprint.
 *
 * - classifyGanFingerprint - Function to classify the GAN fingerprint of an image.
 * - ClassifyGanFingerprintInput - Input type for classifyGanFingerprint.
 * - ClassifyGanFingerprintOutput - Output type for classifyGanFingerprint.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyGanFingerprintInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      'The AI-generated media (image, video, or audio) as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type ClassifyGanFingerprintInput = z.infer<typeof ClassifyGanFingerprintInputSchema>;

const ForensicIndicatorSchema = z.object({
  name: z.string().describe('Name of the forensic indicator.'),
  score: z.number().describe('Score from 0 to 1 for this indicator.'),
});

const ClassifyGanFingerprintOutputSchema = z.object({
  sourceModel: z
    .string()
    .describe('The source model (e.g., Stable Diffusion, DALL·E, Sora, Udio) used to generate the media.')
    .optional(),
  confidence: z
    .number()
    .describe('The confidence level (0-1) of the classification.')
    .optional(),
  details: z.string().describe('Additional details about the GAN fingerprint analysis.').optional(),
  forensicIndicators: z
    .array(ForensicIndicatorSchema)
    .describe(
      'A list of forensic indicators and their scores, such as Residual Noise Patterns and Up-sampling Artifacts.'
    ),
});

export type ClassifyGanFingerprintOutput = z.infer<typeof ClassifyGanFingerprintOutputSchema>;

export async function classifyGanFingerprint(
  input: ClassifyGanFingerprintInput
): Promise<ClassifyGanFingerprintOutput> {
  return classifyGanFingerprintFlow(input);
}

const classifyGanFingerprintPrompt = ai.definePrompt({
  name: 'classifyGanFingerprintPrompt',
  input: {schema: ClassifyGanFingerprintInputSchema},
  output: {schema: ClassifyGanFingerprintOutputSchema},
  prompt: `You are an expert in identifying the source of AI-generated media by analyzing their generative model fingerprints.

**Core Directive: First, determine if the media is AI-generated at all. If it appears to be a real photo, video, or audio recording, you MUST classify the source as "Not AI-generated" or "Unknown" with a very low confidence score.**

Analyze the provided media file, considering its type (image, video, or audio).
1.  **Assess Authenticity:** Is this likely AI-generated or real? If it's real, do not attempt to assign it to a generative model.
2.  **Analyze Fingerprint:** If it is AI-generated, determine the most likely source model (e.g., Stable Diffusion, DALL·E, Sora, Udio, Gen-2, Suno). Do not attribute media to a model of a different type (e.g., do not attribute an image to an audio model like Udio).
3.  **Provide Output:**
    *   The name of the source model. If not AI-generated, return "Unknown".
    *   A confidence level (0-1) for your classification. This should be very low if the media appears authentic.
    *   A list of scores for relevant forensic indicators: 'Residual Noise Patterns', 'Up-sampling Artifacts', 'Color Space Aberrations', 'Model-specific Artifacts', 'Spectrogram Anomalies', 'Codec Fingerprints'.
    *   Additional details about your analysis.

Media: {{media url=mediaDataUri}}
  `,
});

const classifyGanFingerprintFlow = ai.defineFlow(
  {
    name: 'classifyGanFingerprintFlow',
    inputSchema: ClassifyGanFingerprintInputSchema,
    outputSchema: ClassifyGanFingerprintOutputSchema,
  },
  async input => {
    const {output} = await classifyGanFingerprintPrompt(input);
    return output!;
  }
);
