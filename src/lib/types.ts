import type { AnalyzeUploadedImageOutput } from "@/ai/flows/analyze-uploaded-image";
import type { ClassifyGanFingerprintOutput as GanOutput } from "@/ai/flows/classify-gan-fingerprint";
import type { ProcessVideoForDeepfakesOutput } from "@/ai/flows/process-video-for-deepfakes";
import type { AnalyzeAudioOutput } from "@/ai/flows/analyze-audio";

type ForensicIndicator = {
  name: string;
  score: number;
};

export type ImageAnalysisResult = AnalyzeUploadedImageOutput & {
  forensicIndicators: ForensicIndicator[];
};

export type VideoAnalysisResult = ProcessVideoForDeepfakesOutput & {
  forensicIndicators: ForensicIndicator[];
};

export type AudioAnalysisResult = AnalyzeAudioOutput & {
  forensicIndicators: ForensicIndicator[];
};

export type ClassifyGanFingerprintOutput = GanOutput & {
    forensicIndicators: ForensicIndicator[];
};
