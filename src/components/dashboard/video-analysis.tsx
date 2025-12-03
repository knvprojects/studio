
'use client';

import { useState } from 'react';
import { handleVideoAnalysis } from '@/lib/actions';
import type { VideoAnalysisResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { AnalysisResultDisplay } from './analysis-result';
import { useToast } from '@/hooks/use-toast';
import { AnalysisSkeleton } from './analysis-skeleton';

export function VideoAnalysis() {
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onFileSelect = async (dataUri: string) => {
    setFileDataUri(dataUri);
    setResult(null);
    setIsLoading(true);

    try {
      const analysisResult = await handleVideoAnalysis(dataUri);
      setResult(analysisResult);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      // Reset on failure to allow retry
      resetState();
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
    setFileDataUri(null);
    setResult(null);
    setIsLoading(false);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Video Deepfake Detection</CardTitle>
        <CardDescription>Upload a video to detect deepfake indicators like unnatural blinking, pose mismatch, and lip-sync issues.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Your Video</h3>
            {!fileDataUri && !isLoading && <FileUploader onFileSelect={onFileSelect} accept="video/*" fileTypeDescription="video" />}
            {(fileDataUri || isLoading) && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
                {fileDataUri ? <video src={fileDataUri} controls className="w-full h-full" /> : <div className="w-full h-full bg-muted animate-pulse"></div>}
              </div>
            )}
          </div>
          {(isLoading || result) && (
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg border-b pb-2">Analysis Report</h3>
              {isLoading && <AnalysisSkeleton />}
              {result && fileDataUri && <AnalysisResultDisplay video={fileDataUri} result={result} onReset={resetState} />}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed rounded-lg bg-card text-muted-foreground">
                    <p>Upload a video to see the analysis results.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
