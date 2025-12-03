"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageAnalysis } from "@/components/dashboard/image-analysis";
import { VideoAnalysis } from "@/components/dashboard/video-analysis";
import { ImageIcon, VideoIcon } from "lucide-react";

export function Dashboard() {
  return (
    <Tabs defaultValue="image" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mx-auto max-w-md">
        <TabsTrigger value="image">
          <ImageIcon className="mr-2 h-4 w-4" />
          Image Analysis
        </TabsTrigger>
        <TabsTrigger value="video">
          <VideoIcon className="mr-2 h-4 w-4" />
          Video Analysis
        </TabsTrigger>
      </TabsList>
      <TabsContent value="image" className="mt-6">
        <ImageAnalysis />
      </TabsContent>
      <TabsContent value="video" className="mt-6">
        <VideoAnalysis />
      </TabsContent>
    </Tabs>
  );
}
