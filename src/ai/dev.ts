import { config } from 'dotenv';
config();

import '@/ai/flows/process-video-for-deepfakes.ts';
import '@/ai/flows/explain-detected-anomalies.ts';
import '@/ai/flows/classify-gan-fingerprint.ts';
import '@/ai/flows/analyze-uploaded-image.ts';