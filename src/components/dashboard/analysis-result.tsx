'use client';

import type { ImageAnalysisResult, VideoAnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Fingerprint, RefreshCcw, Printer } from 'lucide-react';
import { PrintReport } from './print-report';

interface AnalysisResultDisplayProps {
  image?: string;
  video?: string;
  result: ImageAnalysisResult | VideoAnalysisResult;
  onReset: () => void;
}

function isImageResult(result: any): result is ImageAnalysisResult {
  return 'isAiGenerated' in result;
}

export function AnalysisResultDisplay({ result, onReset, image, video }: AnalysisResultDisplayProps) {
  const probability = isImageResult(result) ? result.probability : result.deepfakeProbability;
  const anomalies = isImageResult(result) ? result.anomalies : result.anomalyExplanation;
  const isAI = probability > 0.5;
  const percentage = Math.round(probability * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Card className="flex flex-col h-full print:hidden">
        <CardHeader>
          <CardTitle>Analysis Complete</CardTitle>
          <CardDescription>
            {isAI ? 'This media is likely AI-generated.' : 'This media appears to be authentic.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="12"
                  strokeDasharray={`${(percentage / 100) * 339.29} 339.29`}
                  strokeLinecap="round"
                  className="transform -rotate-90 origin-center transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-accent">{percentage}%</span>
              </div>
            </div>
            <p className="font-semibold text-lg">{isAI ? 'AI-Generated Probability' : 'Authenticity Score'}</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Detected Anomalies</h4>
            <div className="p-4 rounded-md border bg-muted/50 text-sm max-h-40 overflow-y-auto">
              <p>{anomalies || 'No significant anomalies detected.'}</p>
            </div>
          </div>

          {isImageResult(result) && result.ganClassification && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2"><Fingerprint className="h-5 w-5" />GAN Fingerprint</h4>
              <Card>
                <CardContent className="pt-6 text-sm space-y-2">
                  <p><strong>Source Model:</strong> {result.ganClassification.sourceModel || 'Unknown'}</p>
                  <p><strong>Confidence:</strong> {Math.round((result.ganClassification.confidence || 0) * 100)}%</p>
                  {result.ganClassification.details && <p className="text-muted-foreground text-xs"><strong>Details:</strong> {result.ganClassification.details}</p>}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={onReset} variant="outline" className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" /> Analyze Another
          </Button>
          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" /> Generate Report
          </Button>
        </CardFooter>
      </Card>
      <PrintReport image={image} video={video} result={result} />
    </>
  );
}
