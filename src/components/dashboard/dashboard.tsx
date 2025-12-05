"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageAnalysis } from "@/components/dashboard/image-analysis";
import { VideoAnalysis } from "@/components/dashboard/video-analysis";
import { AudioAnalysis } from "@/components/dashboard/audio-analysis";
import { GanAnalysis } from "@/components/dashboard/gan-analysis";
import { ImageIcon, VideoIcon, Fingerprint, Mic } from "lucide-react";
import { handleImageAnalysis, handleVideoAnalysis, handleGanFingerprintAnalysis, handleAudioAnalysis } from "@/lib/actions";
import type { ImageAnalysisResult, VideoAnalysisResult, ClassifyGanFingerprintOutput, AudioAnalysisResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";


type ImageAnalysisState = {
  fileDataUri: string | null;
  result: ImageAnalysisResult | null;
  isLoading: boolean;
};

type VideoAnalysisState = {
  fileDataUri: string | null;
  result: VideoAnalysisResult | null;
  isLoading: boolean;
};

type AudioAnalysisState = {
  fileDataUri: string |
 null;
  result: AudioAnalysisResult | null;
  isLoading: boolean;
};

type GanAnalysisState = {
  fileDataUri: string | null;
  result: ClassifyGanFingerprintOutput | null;
  isLoading: boolean;
};


export function Dashboard() {
  const { toast } = useToast();

  const [imageState, setImageState] = useState<ImageAnalysisState>({
    fileDataUri: null,
    result: null,
    isLoading: false,
  });

  const [videoState, setVideoState] = useState<VideoAnalysisState>({
    fileDataUri: null,
    result: null,
    isLoading: false,
  });

  const [audioState, setAudioState] = useState<AudioAnalysisState>({
    fileDataUri: null,
    result: null,
    isLoading: false,
  });

  const [ganState, setGanState] = useState<GanAnalysisState>({
    fileDataUri: null,
    result: null,
    isLoading: false,
  });


  const onImageFileSelect = async (dataUri: string) => {
    setImageState({ fileDataUri: dataUri, result: null, isLoading: true });
    try {
      const analysisResult = await handleImageAnalysis(dataUri);
      setImageState((s) => ({ ...s, result: analysisResult, isLoading: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      resetImageState();
    }
  };
  
  const resetImageState = () => {
    setImageState({ fileDataUri: null, result: null, isLoading: false });
  }

  const onVideoFileSelect = async (dataUri: string) => {
    setVideoState({ fileDataUri: dataUri, result: null, isLoading: true });
    try {
      const analysisResult = await handleVideoAnalysis(dataUri);
      setVideoState((s) => ({ ...s, result: analysisResult, isLoading: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      resetVideoState();
    }
  };
  
  const resetVideoState = () => {
    setVideoState({ fileDataUri: null, result: null, isLoading: false });
  }

  const onAudioFileSelect = async (dataUri: string) => {
    setAudioState({ fileDataUri: dataUri, result: null, isLoading: true });
    try {
      const analysisResult = await handleAudioAnalysis(dataUri);
      setAudioState((s) => ({ ...s, result: analysisResult, isLoading: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      resetAudioState();
    }
  };

  const resetAudioState = () => {
    setAudioState({ fileDataUri: null, result: null, isLoading: false });
  };


  const onGanFileSelect = async (dataUri: string, file: File) => {
    setGanState({ fileDataUri: dataUri, result: null, isLoading: true });

    try {
      const fileType = file.type.split('/')[0];
      const mediaType = fileType === 'image' || fileType === 'video' || fileType === 'audio' ? fileType : 'image';
      
      const analysisResult = await handleGanFingerprintAnalysis(dataUri, mediaType);
      setGanState((s) => ({...s, result: analysisResult, isLoading: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      resetGanState();
    }
  };
  
  const resetGanState = () => {
    setGanState({ fileDataUri: null, result: null, isLoading: false });
  }


  return (
    <Tabs defaultValue="image" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mx-auto max-w-3xl">
        <TabsTrigger value="image">
          <ImageIcon className="mr-2 h-4 w-4" />
          Image Analysis
        </TabsTrigger>
        <TabsTrigger value="video">
          <VideoIcon className="mr-2 h-4 w-4" />
          Video Analysis
        </TabsTrigger>
        <TabsTrigger value="audio">
          <Mic className="mr-2 h-4 w-4" />
          Audio Analysis
        </TabsTrigger>
        <TabsTrigger value="gan">
          <Fingerprint className="mr-2 h-4 w-4" />
          GAN Fingerprint
        </TabsTrigger>
      </TabsList>
      <TabsContent value="image" className="mt-6">
        <ImageAnalysis 
          onFileSelect={onImageFileSelect}
          resetState={resetImageState}
          {...imageState}
        />
      </TabsContent>
      <TabsContent value="video" className="mt-6">
        <VideoAnalysis 
          onFileSelect={onVideoFileSelect}
          resetState={resetVideoState}
          {...videoState}
        />
      </TabsContent>
      <TabsContent value="audio" className="mt-6">
        <AudioAnalysis 
          onFileSelect={onAudioFileSelect}
          resetState={resetAudioState}
          {...audioState}
        />
      </TabsContent>
      <TabsContent value="gan" className="mt-6">
        <GanAnalysis 
          onFileSelect={onGanFileSelect}
          resetState={resetGanState}
          {...ganState}
        />
      </TabsContent>
    </Tabs>
  );
}
