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
  prompt: `You are an expert audio forensic analyst. Your task is to analyze an audio file and determine if it contains an AI-synthesized voice.

**Core Directive: Identify Robotic, Emotionless Voices**
Your primary goal is to identify voices that sound like digital assistants (e.g., Siri, Alexa). These voices are characterized by being **emotionless, stiff, and rhythmless**. A lack of natural human cadence, inflection, and emotional variation are the strongest indicators of AI synthesis.

**Key Analysis Principles:**
1.  **Distinguish Production vs. Synthesis:** You MUST distinguish between common music production techniques (autotune, reverb, vocoders, layered tracks) and actual AI voice synthesis. The presence of autotune on a human voice—even if heavy—is NOT evidence of AI generation. Focus on the underlying vocal delivery.
2.  **Vocal Characteristics:**
    *   **Human:** Natural pitch variation, rhythm, emotion, subtle imperfections.
    *   **AI:** Flat intonation, monotonous delivery, unnaturally perfect or stiff cadence, lack of emotional color.
3.  **Background Noise Interpretation:** Be cautious. Inconsistencies in background noise often indicate a **real recording** in a natural environment. Conversely, perfectly clean or unnaturally uniform background noise can be a marker for AI generation.

Analyze the following audio:

Audio: {{media url=audioDataUri}}

Based on this analysis, provide:
1.  A probability score (0-1) indicating the likelihood that the audio contains an AI-synthesized voice based on the core directive.
2.  A detailed explanation for your score, focusing on whether the voice sounds human or like a digital assistant.
3.  A list of scores for the following forensic indicators: 'Spectrogram Anomalies', 'Codec Fingerprints', 'Synthetic Voice Markers', 'Background Noise Inconsistencies', 'Phase Discontinuities'.

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
