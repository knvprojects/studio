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
      'A description of any anomalies detected in the image, such as unusual textures, frequency patterns, or GAN fingerprints.'
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
  prompt: `You are an expert in detecting AI-generated images. Analyze the provided image for signs of AI generation, including GAN fingerprints, and anomalies.

Analyze the following image:

{{media url=photoDataUri}}

Based on your analysis, determine the probability (0-1) that the image is AI-generated.  Also, describe any specific anomalies detected in the image that suggest AI generation, such as unusual textures, frequency patterns, or GAN fingerprints.  Set isAiGenerated to true if the probability is above 0.5.

Return the probability, a description of anomalies and set isAiGenerated to true if the probability is above 0.5.`,
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
