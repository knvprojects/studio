"use server";

import { analyzeUploadedImage } from "@/ai/flows/analyze-uploaded-image";
import { classifyGanFingerprint } from "@/ai/flows/classify-gan-fingerprint";
import { processVideoForDeepfakes } from "@/ai/flows/process-video-for-deepfakes";
import type { ImageAnalysisResult, VideoAnalysisResult, ClassifyGanFingerprintOutput } from "@/lib/types";

export async function handleImageAnalysis(
  imageDataUri: string
): Promise<ImageAnalysisResult> {
  try {
    const analysis = await analyzeUploadedImage({ photoDataUri: imageDataUri });
    return {
      ...analysis,
      ganClassification: null, // GAN classification is now separate
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

export async function handleGanFingerprintAnalysis(
  imageDataUri: string
): Promise<ClassifyGanFingerprintOutput> {
  try {
    const analysis = await classifyGanFingerprint({ imageDataUri });
    return analysis;
  } catch (error) {
    console.error("GAN fingerprint analysis failed:", error);
    throw new Error("Failed to analyze the GAN fingerprint. The model may be unavailable or the file type is not supported.");
  }
}
