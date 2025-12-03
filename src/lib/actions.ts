"use server";

import { analyzeUploadedImage } from "@/ai/flows/analyze-uploaded-image";
import { classifyGanFingerprint } from "@/ai/flows/classify-gan-fingerprint";
import { processVideoForDeepfakes } from "@/ai/flows/process-video-for-deepfakes";
import type { ImageAnalysisResult, VideoAnalysisResult } from "@/lib/types";

export async function handleImageAnalysis(
  imageDataUri: string
): Promise<ImageAnalysisResult> {
  try {
    const analysis = await analyzeUploadedImage({ photoDataUri: imageDataUri });

    let ganClassification = null;
    // Only run classification if probability is high to save resources
    if (analysis.isAiGenerated && analysis.probability > 0.7) {
      ganClassification = await classifyGanFingerprint({ imageDataUri });
    }
    
    return {
      ...analysis,
      ganClassification,
    };
  } catch (error) {
    console.error("Image analysis failed:", error);
    // Propagate a user-friendly error message
    throw new Error("Failed to analyze the image. The model may be unavailable. Please try again later.");
  }
}

export async function handleVideoAnalysis(
  videoDataUri: string
): Promise<VideoAnalysisResult> {
  try {
    const analysis = await processVideoForDeepfakes({ videoDataUri });
    return analysis;
  } catch (error) {
    console.error("Video analysis failed:", error);
    // Propagate a user-friendly error message
    throw new Error("Failed to analyze the video. The model may be unavailable. Please try again later.");
  }
}
