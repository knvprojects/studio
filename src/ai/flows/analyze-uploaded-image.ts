// src/ai/flows/analyze-uploaded-image.ts
'use server';

/**
 * @fileOverview Analyzes an uploaded image to determine the probability of it being AI-generated.
 *
 * - analyzeUploadedImage -  Analyzes an image and returns the probability of being AI-generated and any detected anomalies.
 * - AnalyzeUploadedImageInput - The input type for the analyzeUploadedImage function.
 * - AnalyzeUploadedImageOutput - The return type for the analyzeUploadedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUploadedImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type AnalyzeUploadedImageInput = z.infer<typeof AnalyzeUploadedImageInputSchema>;

const ForensicIndicatorSchema = z.object({
  name: z.string().describe('Name of the forensic indicator.'),
  score: z.number().describe('Score from 0 to 1 for this indicator.'),
});

const AnalyzeUploadedImageOutputSchema = z.object({
  isAiGenerated: z
    .boolean()
    .describe('Whether or not the image is likely AI-generated.'),
  probability: z
    .number()
    .describe(
      'The probability (0-1) that the image is AI-generated, based on analysis of GAN fingerprints, CNN/ViT models, texture analysis, and frequency spectrum analysis.'
    ),
  anomalies: z
    .string()
    .describe(
      'A detailed explanation of any anomalies detected in the image, such as unusual textures, frequency patterns, or GAN fingerprints.'
    ),
  forensicIndicators: z
    .array(ForensicIndicatorSchema)
    .describe(
      'A list of forensic indicators and their scores, such as GAN Fingerprints, CNN/ViT Models, Texture Analysis, and Frequency Spectrum.'
    ),
});
export type AnalyzeUploadedImageOutput = z.infer<typeof AnalyzeUploadedImageOutputSchema>;

export async function analyzeUploadedImage(
  input: AnalyzeUploadedImageInput
): Promise<AnalyzeUploadedImageOutput> {
  return analyzeUploadedImageFlow(input);
}

const analyzeUploadedImagePrompt = ai.definePrompt({
  name: 'analyzeUploadedImagePrompt',
  input: {schema: AnalyzeUploadedImageInputSchema},
  output: {schema: AnalyzeUploadedImageOutputSchema},
  prompt: `You are an expert in detecting AI-generated images. Analyze the provided image for signs of AI generation.

Analyze the following image:

{{media url=photoDataUri}}

Based on your analysis, provide:
1.  A probability (0-1) that the image is AI-generated.
2.  Set isAiGenerated to true if the probability is above 0.5.
3.  A detailed explanation of any anomalies detected (e.g., unusual textures, lighting inconsistencies, anatomical errors).
4.  A list of scores for the following forensic indicators: 'GAN Fingerprints', 'Model Artifacts', 'Texture Analysis', and 'Frequency Spectrum'. Each score should be a number between 0 and 1, where a higher score indicates a higher likelihood of AI generation for that specific indicator. These scores should correlate with your overall probability.

Return the probability, isAiGenerated flag, a detailed anomaly explanation, and the forensic indicator scores.`,
});

const analyzeUploadedImageFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedImageFlow',
    inputSchema: AnalyzeUploadedImageInputSchema,
    outputSchema: AnalyzeUploadedImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeUploadedImagePrompt(input);
    return output!;
  }
);
