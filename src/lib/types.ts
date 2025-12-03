import type { AnalyzeUploadedImageOutput } from "@/ai/flows/analyze-uploaded-image";
import type { ClassifyGanFingerprintOutput as GanOutput } from "@/ai/flows/classify-gan-fingerprint";
import type { ProcessVideoForDeepfakesOutput } from "@/ai/flows/process-video-for-deepfakes";

type ForensicIndicator = {
  name: string;
  score: number;
};

export type ImageAnalysisResult = AnalyzeUploadedImageOutput & {
  ganClassification: GanOutput | null;
  forensicIndicators: ForensicIndicator[];
};

export type VideoAnalysisResult = ProcessVideoForDeepfakesOutput & {
  forensicIndicators: ForensicIndicator[];
};

export type ClassifyGanFingerprintOutput = GanOutput & {
    forensicIndicators: ForensicIndicator[];
};
