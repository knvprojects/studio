
'use client';

import Image from 'next/image';
import type { ClassifyGanFingerprintOutput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { Fingerprint, RefreshCcw, X, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface GanAnalysisProps {
  fileDataUri: string | null;
  result: ClassifyGanFingerprintOutput | null;
  isLoading: boolean;
  onFileSelect: (dataUri: string, file: File) => Promise<void>;
  resetState: () => void;
}


export function GanAnalysis({ fileDataUri, result, isLoading, onFileSelect, resetState }: GanAnalysisProps) {
  const forensicIndicators = result?.forensicIndicators || [];
  const fileType = fileDataUri ? fileDataUri.split(':')[1].split('/')[0] : null;

  const renderMedia = () => {
    if (!fileDataUri) return null;

    switch (fileType) {
      case 'image':
        return <Image src={fileDataUri} alt="Uploaded content" fill objectFit="contain" />;
      case 'video':
        return <video src={fileDataUri} controls className="h-full w-full" />;
      case 'audio':
        return <audio src={fileDataUri} controls className="w-full" />;
      default:
        return <p className="text-center text-muted-foreground">Unsupported file type for preview.</p>;
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>GAN Fingerprint Analysis</CardTitle>
            <CardDescription>Upload an AI-generated image, video, or audio file to identify the source model (e.g., DALL·E, Sora, Udio) by analyzing its unique generative fingerprint.</CardDescription>
        </div>
        {(fileDataUri || result || isLoading) && (
          <Button variant="ghost" size="icon" onClick={resetState} aria-label="Clear analysis">
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        {!fileDataUri && !isLoading ? (
            <FileUploader onFileSelect={onFileSelect} accept="image/*,video/*,audio/*" fileTypeDescription="media file" />
        ) : isLoading ? (
            <div className="space-y-8">
                <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border bg-muted">
                    <div className="w-full h-full bg-muted animate-pulse"></div>
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Fingerprint Report</h3>
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin text-primary"><Fingerprint className="w-16 h-16"/></div>
                    </div>
                </div>
            </div>
        ) : result && fileDataUri && (
             <div className="space-y-8">
                 <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                    {renderMedia()}
                </div>
                 <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Fingerprint Report</h3>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Fingerprint className="h-5 w-5" />GAN Fingerprint</CardTitle>
                            <CardDescription>Identified source model if applicable.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-6 items-center">
                                <div className="text-center py-4 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">Source Model</p>
                                    <p className="text-3xl font-bold">{result.sourceModel || 'Unknown'}</p>
                                </div>
                                <TooltipProvider>
                                  <div className="text-center py-4 rounded-lg bg-muted">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center justify-center gap-1 cursor-help">
                                              <p className="text-sm text-muted-foreground">Confidence</p>
                                              <Info className="h-3 w-3 text-muted-foreground" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">The confidence score represents how certain the AI model is about its classification. A high score means the model found strong evidence pointing to a specific generative model.</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <p className="text-3xl font-bold">{Math.round((result.confidence || 0) * 100)}%</p>
                                  </div>
                                </TooltipProvider>
                            </div>

                            {forensicIndicators.length > 0 && (
                                <div className="space-y-4 pt-4 mt-4 border-t">
                                     <h4 className="font-medium">Forensic Indicators</h4>
                                    {forensicIndicators.map((indicator) => (
                                        <div key={indicator.name} className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium">{indicator.name}</span>
                                            <span className="text-muted-foreground">{Math.round(indicator.score * 100)}%</span>
                                        </div>
                                        <Progress value={indicator.score * 100} className="h-2" indicatorClassName={indicator.score > 0.5 ? 'bg-destructive' : 'bg-accent'}/>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {result.details && <p className="sm:col-span-2 text-muted-foreground text-sm pt-4 border-t"><strong>Details:</strong> {result.details}</p>}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={resetState} className="w-full">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Analyze Another
                            </Button>
                        </CardFooter>
                     </Card>
                 </div>
             </div>
        )}
        
        {!isLoading && !result && !fileDataUri && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed rounded-lg bg-card text-muted-foreground">
              <p>Upload a media file to see the GAN fingerprint analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
