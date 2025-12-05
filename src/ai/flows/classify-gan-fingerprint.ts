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
  prompt: `You are an expert in identifying the source of AI-generated media by analyzing generative model fingerprints.

**Core Video Directive: For video analysis, you MUST operate under the assumption that the video is AI-generated. Your primary task is to find evidence of AI synthesis. Only classify a video as a "Real Recording" if, after deep forensic analysis, there is a total absence of AI artifacts. High visual quality is NOT sufficient proof of authenticity.**

Analyze the provided media file, which is a {{{mediaType}}}.

1.  **Assess Plausibility (Video Only):** Before any technical analysis, evaluate the real-world plausibility of the scene. Is the action depicted logical and possible? For example, a video of a man milking a cow is a logical impossibility and a strong indicator of AI generation. If the scene defies common sense or the laws of nature, you must classify it as AI-generated and explain why.
2.  **Analyze Fingerprint:** Determine the most likely source model by looking for subtle artifacts.
    *   If it's an **image**, consider models like 'DALL·E 3', 'Midjourney v6', 'Stable Diffusion 3', 'Imagen 2'. Provide scores for image-specific indicators: 'Residual Noise Patterns', 'Up-sampling Artifacts', 'Color Space Aberrations', 'Model-specific Artifacts'.
    *   If it's a **video**, you MUST adhere to the Core Video Directive and your Plausibility Assessment. Scrutinize it for temporal inconsistencies, motion artifacts, unnatural smoothness, and frame-level anomalies. Consider models like 'Sora', 'Gen-2', 'Veo', 'Lumiere'. Provide scores for video-specific indicators: 'Temporal Inconsistencies', 'Motion Artifacts', 'Frame-level Anomalies', 'Codec Compression Patterns', 'Plausibility'.
    *   If it's an **audio** file, analyze for synthetic markers. Consider models like 'Udio', 'Suno', 'Voicebox', 'ElevenLabs'. Provide scores for audio-specific indicators: 'Spectrogram Anomalies', 'Codec Fingerprints', 'Phase Discontinuities', 'Synthetic Voice Markers'.
3.  **Provide Output:**
    *   The name of the source model. If it is a real recording, you MUST return "Human" or "Real Recording".
    *   A confidence level (0-1) that reflects your certainty.
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
