'use server';
/**
 * @fileOverview Analyzes uploaded audio for AI generation indicators and returns a probability score.
 *
 * - analyzeAudio - Analyzes the audio and returns a probability score.
 * - AnalyzeAudioInput - The input type for the analyzeAudio function.
 * - AnalyzeAudioOutput - The return type for the analyzeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeAudioInput = z.infer<typeof AnalyzeAudioInputSchema>;

const ForensicIndicatorSchema = z.object({
  name: z.string().describe('Name of the forensic indicator.'),
  score: z.number().describe('Score from 0 to 1 for this indicator.'),
});

const AnalyzeAudioOutputSchema = z.object({
  analysisProbability: z
    .number()
    .describe('The probability (0-1) that the audio is AI-generated.'),
  anomalyExplanation: z
    .string()
    .describe('A detailed explanation of detected anomalies indicating AI generation.'),
  forensicIndicators: z
    .array(ForensicIndicatorSchema)
    .describe(
      'A list of forensic indicators and their scores, such as Spectrogram Anomalies, Codec Fingerprints, and Synthetic Voice Markers.'
    ),
});
export type AnalyzeAudioOutput = z.infer<typeof AnalyzeAudioOutputSchema>;

export async function analyzeAudio(
  input: AnalyzeAudioInput
): Promise<AnalyzeAudioOutput> {
  return analyzeAudioFlow(input);
}

const analyzeAudioPrompt = ai.definePrompt({
  name: 'analyzeAudioPrompt',
  input: {schema: AnalyzeAudioInputSchema},
  output: {schema: AnalyzeAudioOutputSchema},
  prompt: `You are an expert audio forensic analyst. Your task is to analyze an audio file and determine if it contains AI-generated or AI-synthesized voice or sounds.

**Key Analysis Principles:**
1.  **Distinguish Production vs. Synthesis:** You must distinguish between common music production techniques (like autotune, reverb, vocoders, layered tracks) and actual AI voice synthesis. The presence of autotune or effects does not automatically mean AI generation.
2.  **Vocal Characteristics:** Pay close attention to the vocal delivery. AI-generated voices often sound tough, flat, or emotionless. A lack of natural inflection, pitch variation, and emotional nuance is a strong indicator of AI synthesis.
3.  **Background Noise Interpretation:** Be aware that "background noise inconsistencies" can be misleading. A real recording in a natural environment will have fluctuations in background noise. In contrast, some AI-generated audio has unnaturally clean or perfectly uniform background noise, which can be an indicator of synthesis. A high score for 'Background Noise Inconsistencies' should be reserved for artifacts that are clearly synthetic, not for natural environmental sounds.

Analyze the following audio:

Audio: {{media url=audioDataUri}}

Based on your analysis, provide:
1.  A probability score (0-1) indicating the likelihood that the audio contains AI-generated content.
2.  A detailed explanation of detected anomalies, referencing the principles above.
3.  A list of scores for the following forensic indicators: 'Spectrogram Anomalies', 'Codec Fingerprints', 'Synthetic Voice Markers', 'Background Noise Inconsistencies', 'Phase Discontinuities'. Each score should be a number between 0 and 1, where a higher score indicates a higher likelihood of that indicator being present.

Return the probability, a detailed anomaly explanation, and the forensic indicator scores.`,
});

const analyzeAudioFlow = ai.defineFlow(
  {
    name: 'analyzeAudioFlow',
    inputSchema: AnalyzeAudioInputSchema,
    outputSchema: AnalyzeAudioOutputSchema,
  },
  async input => {
    const {output} = await analyzeAudioPrompt(input);
    return output!;
  }
);
