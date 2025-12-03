// src/components/dashboard/gan-analysis.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { handleGanFingerprintAnalysis } from '@/lib/actions';
import type { ClassifyGanFingerprintOutput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';

export function GanAnalysis() {
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyGanFingerprintOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onFileSelect = async (dataUri: string, file: File) => {
    // For now, GAN analysis is most effective on images.
    if (!file.type.startsWith('image/')) {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'GAN Fingerprint analysis currently supports image files only.',
        });
        return;
    }

    setFileDataUri(dataUri);
    setResult(null);
    setIsLoading(true);

    try {
      const analysisResult = await handleGanFingerprintAnalysis(dataUri);
      setResult(analysisResult);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
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
        <CardTitle>GAN Fingerprint Analysis</CardTitle>
        <CardDescription>Upload an AI-generated image to identify the source model (e.g., DALL·E, Stable Diffusion) by analyzing its unique GAN fingerprint.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg border-b pb-2">Upload Media</h3>
              {!fileDataUri && !isLoading && <FileUploader onFileSelect={onFileSelect} accept="image/*" fileTypeDescription="image" />}
              
              {(fileDataUri || isLoading) && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted max-w-lg mx-auto">
                  {fileDataUri ? <Image src={fileDataUri} alt="Uploaded image" fill objectFit="contain" /> : <div className="w-full h-full bg-muted animate-pulse"></div>}
                </div>
              )}
          </div>
          <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg border-b pb-2">Fingerprint Report</h3>
              {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <div className="animate-spin text-primary"><Fingerprint className="w-16 h-16"/></div>
                 </div>
              )}
              {result && fileDataUri && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Fingerprint className="h-5 w-5" />GAN Fingerprint</CardTitle>
                        <CardDescription>Identified source model if applicable.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">Source Model</p>
                            <p className="text-3xl font-bold">{result.sourceModel || 'Unknown'}</p>
                        </div>
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <p className="text-3xl font-bold">{Math.round((result.confidence || 0) * 100)}%</p>
                        </div>
                        {result.details && <p className="text-muted-foreground text-sm pt-4 border-t"><strong>Details:</strong> {result.details}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={resetState} className="w-full">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Analyze Another
                        </Button>
                    </CardFooter>
                 </Card>
              )}
              {!isLoading && !result && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed rounded-lg bg-card text-muted-foreground">
                    <p>Upload an image to see the GAN fingerprint analysis.</p>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}