
'use client';

import { useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (fileDataUri: string, file: File) => void;
  accept: string;
  fileTypeDescription: string;
}

export function FileUploader({ onFileSelect, accept, fileTypeDescription }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File) => {
      if (file) {
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });
        
        if (!isAccepted) {
          toast({
            variant: 'destructive',
            title: 'Invalid file type',
            description: `Please upload a valid ${fileTypeDescription}.`,
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onFileSelect(e.target.result as string, file);
          } else {
            toast({
              variant: 'destructive',
              title: 'Error reading file',
              description: 'Could not read the selected file. Please try again.',
            });
          }
        };
        reader.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'Error reading file',
            description: 'An error occurred while reading the file.',
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect, toast, accept, fileTypeDescription]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor={`dropzone-file-${fileTypeDescription.replace(/\s/g, '-')}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors',
          isDragging ? 'border-primary' : 'border-border'
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            Upload a {fileTypeDescription}
          </p>
        </div>
        <input id={`dropzone-file-${fileTypeDescription.replace(/\s/g, '-')}`} type="file" className="hidden" accept={accept} onChange={handleFileChange} />
      </label>
    </div>
  );
}
