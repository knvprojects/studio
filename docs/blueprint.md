# **App Name**: DeepFake Defender

## Core Features:

- Image Analysis: Analyze uploaded images for AI-generated content using CNN/ViT models, texture analysis, and frequency spectrum analysis. Highlights detected anomalies.
- Video Deepfake Detection: Process video uploads by extracting frames and analyzing them with CNNs and LSTMs. The tool flags inconsistencies like unnatural blinking, head pose mismatch, and lip-sync issues.
- GAN Fingerprint Classification: Identify the source of AI-generated content (e.g., Stable Diffusion, DALL·E) by training a classifier on GAN fingerprints.
- User Interface for Media Upload: Provide a straightforward interface for users to upload images and videos for analysis.
- Real-time Probability Score Display: Show the probability score indicating whether the media is real or AI-generated in real-time.
- Anomaly Explanation: Detail the anomalies detected in the analyzed media to provide context for the AI's classification.
- Report Generation: Generate a report summarizing the analysis results, including the probability score and detected anomalies.

## Style Guidelines:

- Primary color: Deep Black to convey trust and security.
- Background color: Light Gray (#ECEFF1), almost white, for a clean and modern look.
- Accent color: red for highlighting probabilities, warnings and key findings.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a modern and objective look.
- Use clear and simple icons to represent different types of detected anomalies.
- The layout will prioritize clarity and ease of use, with a clear distinction between upload area, analysis results, and anomaly explanations.
- Subtle animations to indicate the progress of analysis and to highlight detected anomalies.