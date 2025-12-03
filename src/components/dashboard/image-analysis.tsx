
'use client';

import Image from 'next/image';
import type { ImageAnalysisResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { AnalysisResultDisplay } from './analysis-result';
import { AnalysisSkeleton } from './analysis-skeleton';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface ImageAnalysisProps {
  fileDataUri: string | null;
  result: ImageAnalysisResult | null;
  isLoading: boolean;
  onFileSelect: (dataUri: string, file: File) => Promise<void>;
  resetState: () => void;
}


export function ImageAnalysis({ fileDataUri, result, isLoading, onFileSelect, resetState }: ImageAnalysisProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>AI-Generated Image Detection</CardTitle>
          <CardDescription>Upload an image to check for signs of AI generation using various forensic analysis techniques.</CardDescription>
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
            accept="image/*"
            fileTypeDescription="image"
          />
        ) : isLoading ? (
          <div className="space-y-8">
            <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border bg-muted">
              <div className="h-full w-full animate-pulse bg-muted"></div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg border-b pb-2">Analysis Report</h3>
              <AnalysisSkeleton />
            </div>
          </div>
        ) : result && fileDataUri && (
          <div className="space-y-8">
            <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border bg-muted">
              <Image
                src={fileDataUri}
                alt="Uploaded image"
                fill
                objectFit="contain"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg border-b pb-2">Analysis Report</h3>
              <AnalysisResultDisplay result={result} onReset={resetState} />
            </div>
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
