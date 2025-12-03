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
  imageDataUri: z
    .string()
    .describe(
      'The AI-generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
});

export type ClassifyGanFingerprintInput = z.infer<typeof ClassifyGanFingerprintInputSchema>;

const ForensicIndicatorSchema = z.object({
  name: z.string().describe('Name of the forensic indicator.'),
  score: z.number().describe('Score from 0 to 1 for this indicator.'),
});

const ClassifyGanFingerprintOutputSchema = z.object({
  sourceModel: z
    .string()
    .describe('The source model (e.g., Stable Diffusion, DALL·E) used to generate the image.')
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
  prompt: `You are an expert in identifying the source of AI-generated images by analyzing their GAN fingerprints.

  Analyze the provided image and determine the most likely source model used to generate it.  Consider factors such as image artifacts, frequency patterns, and other distinguishing characteristics.

  Provide:
  1. The name of the source model (e.g., Stable Diffusion, DALL·E).
  2. A confidence level (0-1) for the classification.
  3. A list of scores for the following forensic indicators related to source identification: 'Residual Noise Patterns', 'Up-sampling Artifacts', 'Color Space Aberrations', 'Model-specific Artifacts'. Each score should be a number between 0 and 1, where a higher score indicates a stronger presence of that indicator.
  4. Additional details about the analysis.

  If the source model cannot be confidently determined, indicate that the source is unknown and provide any relevant details about why the classification is uncertain.

  Image: {{media url=imageDataUri}}
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
