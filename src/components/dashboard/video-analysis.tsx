
'use client';

import type { VideoAnalysisResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { AnalysisResultDisplay } from './analysis-result';
import { AnalysisSkeleton } from './analysis-skeleton';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

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
       <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>Video Deepfake Detection</CardTitle>
            <CardDescription>Upload a video to detect deepfake indicators like unnatural blinking, pose mismatch, and lip-sync issues.</CardDescription>
        </div>
        {(fileDataUri || result || isLoading) && (
          <Button variant="ghost" size="icon" onClick={resetState} aria-label="Clear analysis">
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        {!fileDataUri && !isLoading ? (
            <FileUploader
              onFileSelect={onFileSelect}
              accept="video/*"
              fileTypeDescription="video"
            />
        ) : isLoading ? (
            <div className="space-y-8">
                <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border bg-black">
                    <div className="h-full w-full animate-pulse bg-muted"></div>
                </div>
                 <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Analysis Report</h3>
                    <AnalysisSkeleton />
                </div>
            </div>
        ) : result && fileDataUri && (
            <div className="space-y-8">
                <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border bg-black">
                    <video src={fileDataUri} controls className="h-full w-full" />
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Analysis Report</h3>
                    <AnalysisResultDisplay result={result} onReset={resetState} />
                </div>
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
