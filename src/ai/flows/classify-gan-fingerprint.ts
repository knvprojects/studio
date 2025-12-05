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
      "The AI-generated media (image, video, or audio) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  mediaType: z.enum(['image', 'video', 'audio']).describe('The type of media being analyzed.'),
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
  prompt: `You are an expert in identifying the source of AI-generated media by analyzing generative model fingerprints for a specific media type.

**Core Directive: Your task is to differentiate between authentic media and sophisticated AI-generated media. While real-world content has natural imperfections, high-quality AI generation can mimic reality. You must perform a deep forensic analysis before concluding that a file is a "Real Recording."**

Analyze the provided media file, which is a {{{mediaType}}}.

1.  **Analyze Fingerprint:** Determine the most likely source model by looking for subtle artifacts.
    *   If it's an **image**, consider models like 'DALL·E 3', 'Midjourney v6', 'Stable Diffusion 3', 'Imagen 2'. Provide scores for image-specific indicators: 'Residual Noise Patterns', 'Up-sampling Artifacts', 'Color Space Aberrations', 'Model-specific Artifacts'.
    *   If it's a **video**, you MUST prioritize deepfake analysis. High-quality AI video can look real. Scrutinize it for AI indicators before classifying it as a "Real Recording." Consider models like 'Sora', 'Gen-2', 'Veo', 'Lumiere'. Provide scores for video-specific indicators: 'Temporal Inconsistencies', 'Motion Artifacts', 'Frame-level Anomalies', 'Codec Compression Patterns'.
    *   If it's an **audio** file, consider models like 'Udio', 'Suno', 'Voicebox', 'ElevenLabs'. Provide scores for audio-specific indicators: 'Spectrogram Anomalies', 'Codec Fingerprints', 'Phase Discontinuities', 'Synthetic Voice Markers'.
2.  **Assess Authenticity:** Based on the forensic analysis, is this AI-generated or a real recording/photo? If the evidence strongly suggests it's a real recording (e.g., clear, verifiable context with no AI artifacts), you may classify it as "Human" or "Real Recording." Otherwise, identify the likely generative model.
3.  **Provide Output:**
    *   The name of the source model. If it is a real recording, you MUST return "Human" or "Real Recording".
    *   A confidence level (0-1) that reflects your certainty in the classification.
    *   A list of scores for the forensic indicators relevant to the media type.
    *   Additional details about your analysis and the evidence found.

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
