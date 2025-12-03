import type { AnalyzeUploadedImageOutput } from "@/ai/flows/analyze-uploaded-image";
import type { ClassifyGanFingerprintOutput } from "@/ai/flows/classify-gan-fingerprint";
import type { ProcessVideoForDeepfakesOutput } from "@/ai/flows/process-video-for-deepfakes";

export type ImageAnalysisResult = AnalyzeUploadedImageOutput & {
  ganClassification: ClassifyGanFingerprintOutput | null;
};

export type VideoAnalysisResult = ProcessVideoForDeepfakesOutput;
