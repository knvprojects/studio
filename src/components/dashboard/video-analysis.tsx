
'use client';

import type { VideoAnalysisResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { AnalysisResultDisplay } from './analysis-result';
import { AnalysisSkeleton } from './analysis-skeleton';

interface VideoAnalysisProps {
  fileDataUri: string | null;
  result: VideoAnalysisResult | null;
  isLoading: boolean;
  onFileSelect: (dataUri: string, file: File) => Promise<void>;
  resetState: () => void;
}

export function VideoAnalysis({ fileDataUri, result, isLoading, onFileSelect, resetState }: VideoAnalysisProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Video Deepfake Detection</CardTitle>
        <CardDescription>Upload a video to detect deepfake indicators like unnatural blinking, pose mismatch, and lip-sync issues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col items-center gap-4">
          <h3 className="w-full text-lg font-semibold border-b pb-2">Upload Video</h3>
          {!fileDataUri && !isLoading && (
            <FileUploader
              onFileSelect={onFileSelect}
              accept="video/*"
              fileTypeDescription="video"
            />
          )}

          {(fileDataUri || isLoading) && (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-black">
              {fileDataUri ? (
                <video src={fileDataUri} controls className="h-full w-full" />
              ) : (
                <div className="h-full w-full animate-pulse bg-muted"></div>
              )}
            </div>
          )}
        </div>
        
        {(isLoading || result) && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Analysis Report</h3>
            {isLoading && <AnalysisSkeleton />}
            {result && fileDataUri && <AnalysisResultDisplay video={fileDataUri} result={result} onReset={resetState} />}
          </div>
        )}

        {!isLoading && !result && !fileDataUri && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed rounded-lg bg-card text-muted-foreground">
              <p>Upload a video to see the analysis results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
