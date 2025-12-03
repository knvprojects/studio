'use client';
import type { ImageAnalysisResult, VideoAnalysisResult } from '@/lib/types';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PrintReportProps {
    image?: string;
    video?: string;
    result: ImageAnalysisResult | VideoAnalysisResult;
}

function isImageResult(result: any): result is ImageAnalysisResult {
    return 'isAiGenerated' in result;
}

export const PrintReport = ({ image, video, result }: PrintReportProps) => {
    const probability = isImageResult(result) ? result.probability : result.deepfakeProbability;
    const anomalies = isImageResult(result) ? result.anomalies : result.anomalyExplanation;
    const isAI = probability > 0.5;
    const percentage = Math.round(probability * 100);

    const [dateTime, setDateTime] = useState({ date: '', time: ''});

    useEffect(() => {
        const now = new Date();
        setDateTime({
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        });
    }, []);

    return (
        <div className="print-only-styles">
            <header className="flex items-center gap-3 mb-10 border-b pb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline">DeepFake Defender Report</h1>
            </header>
            
            <section className="grid grid-cols-[2fr,1fr] gap-8 mb-8">
                <div>
                    <h2 className="text-xl font-semibold mb-3">Analyzed Media</h2>
                    {image && <div className="border rounded-lg overflow-hidden p-2 bg-muted"><Image src={image} alt="Analyzed image" width={800} height={450} className="w-full h-auto object-contain"/></div>}
                    {video && <p className="text-muted-foreground p-4 border rounded-lg h-full flex items-center justify-center">Video previews are not available in reports.</p>}
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold mb-3">Overall Score</h2>
                    <div className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg h-full">
                        <p className="text-6xl font-bold text-accent">{percentage}%</p>
                        <p className="text-lg text-center">{isAI ? 'AI-Generated Probability' : 'Authenticity Score'}</p>
                    </div>
                </div>
            </section>
    
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Anomaly Explanation</h2>
                <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm">{anomalies || 'No significant anomalies detected.'}</p>
                </div>
            </section>
    
            {isImageResult(result) && result.ganClassification && (
                <section>
                    <h2 className="text-xl font-semibold mb-3">GAN Fingerprint Analysis</h2>
                    <div className="p-4 border rounded-lg text-sm space-y-1">
                        <p><strong>Source Model:</strong> {result.ganClassification.sourceModel || 'Unknown'}</p>
                        <p><strong>Confidence:</strong> {Math.round((result.ganClassification.confidence || 0) * 100)}%</p>
                        {result.ganClassification.details && <p><strong>Details:</strong> {result.ganClassification.details}</p>}
                    </div>
                </section>
            )}
    
            <footer className="mt-16 pt-4 border-t text-center text-xs text-muted-foreground">
                <p>Report generated on {dateTime.date} at {dateTime.time}.</p>
                <p>This report is AI-generated and should be used for informational purposes only.</p>
            </footer>
        </div>
    );
};
