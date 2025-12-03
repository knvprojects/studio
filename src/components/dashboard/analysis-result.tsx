
'use client';

import type { ImageAnalysisResult, VideoAnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart3, Fingerprint, RefreshCcw, Printer, FileText } from 'lucide-react';
import { PrintReport } from './print-report';
import { Progress } from '@/components/ui/progress';

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
  const forensicIndicators = result.forensicIndicators || [];
  const isAI = probability > 0.5;
  const percentage = Math.round(probability * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Overview */}
        <Card className="md:col-span-1 flex flex-col">
           <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Analysis Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow items-center justify-center text-center gap-4">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={isAI ? "hsl(var(--destructive))" : "hsl(var(--accent))"}
                  strokeWidth="12"
                  strokeDasharray={`${(percentage / 100) * 339.29} 339.29`}
                  strokeLinecap="round"
                  className="transform -rotate-90 origin-center transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${isAI ? 'text-destructive' : 'text-accent'}`}>{percentage}%</span>
              </div>
            </div>
            <p className="font-semibold text-lg">{isAI ? 'AI-Generated Probability' : 'Authenticity Score'}</p>
            <CardDescription>
              {isAI ? 'This media is likely AI-generated.' : 'This media appears to be authentic.'}
            </CardDescription>
          </CardContent>
          <CardFooter className="flex-col gap-2 pt-4">
             <Button onClick={handlePrint} className="w-full" variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Button onClick={onReset} className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" /> Analyze Another
            </Button>
          </CardFooter>
        </Card>
        
        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Forensic Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {forensicIndicators.map((indicator) => (
                <div key={indicator.name} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{indicator.name}</span>
                    <span className="text-muted-foreground">{Math.round(indicator.score * 100)}%</span>
                  </div>
                  <Progress value={indicator.score * 100} className="h-2" indicatorClassName={indicator.score > 0.5 ? 'bg-destructive' : 'bg-accent'}/>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Detected Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm max-h-48 overflow-y-auto">
              <p>{anomalies || 'No significant anomalies detected.'}</p>
            </CardContent>
          </Card>

          {isImageResult(result) && result.ganClassification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Fingerprint className="h-5 w-5" />GAN Fingerprint</CardTitle>
                <CardDescription>Identified source model if applicable.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                  <p><strong>Source Model:</strong> {result.ganClassification.sourceModel || 'Unknown'}</p>
                  <p><strong>Confidence:</strong> {Math.round((result.ganClassification.confidence || 0) * 100)}%</p>
                  {result.ganClassification.details && <p className="text-muted-foreground text-xs"><strong>Details:</strong> {result.ganClassification.details}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="hidden">
        <PrintReport image={image} video={video} result={result} />
      </div>
    </>
  );
}
