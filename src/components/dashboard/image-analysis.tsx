
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { handleImageAnalysis } from '@/lib/actions';
import type { ImageAnalysisResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { AnalysisResultDisplay } from './analysis-result';
import { useToast } from '@/hooks/use-toast';
import { AnalysisSkeleton } from './analysis-skeleton';

export function ImageAnalysis() {
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onFileSelect = async (dataUri: string) => {
    setFileDataUri(dataUri);
    setResult(null);
    setIsLoading(true);

    try {
      const analysisResult = await handleImageAnalysis(dataUri);
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
        <CardTitle>AI-Generated Image Detection</CardTitle>
        <CardDescription>Upload an image to check for signs of AI generation using various forensic analysis techniques.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col items-center gap-4">
          <h3 className="w-full text-lg font-semibold border-b pb-2">Upload Image</h3>
          {!fileDataUri && !isLoading && (
            <FileUploader
              onFileSelect={onFileSelect}
              accept="image/*"
              fileTypeDescription="image"
            />
          )}

          {(fileDataUri || isLoading) && (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
              {fileDataUri ? (
                <Image
                  src={fileDataUri}
                  alt="Uploaded image"
                  fill
                  objectFit="contain"
                />
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
              {result && fileDataUri && <AnalysisResultDisplay image={fileDataUri} result={result} onReset={resetState} />}
          </div>
        )}
        
        {!isLoading && !result && !fileDataUri && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed rounded-lg bg-card text-muted-foreground">
              <p>Upload an image to see the analysis results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
