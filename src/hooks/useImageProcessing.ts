import { useState, useCallback } from 'react';
import { ImageProcessingService, ProcessedImage, ImageSizeType } from '@/services/imageProcessingService';

export interface ImageProcessingOptions {
  createThumbnails?: boolean;
  sizes?: ImageSizeType[];
  optimizeForWeb?: boolean;
  maxSizeMB?: number;
  createPlaceholder?: boolean;
}

export interface ProcessingProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  processedImages?: ProcessedImage[];
  placeholder?: string;
}

export interface UseImageProcessingResult {
  processImages: (files: File[], options?: ImageProcessingOptions) => Promise<ProcessingProgress[]>;
  processingState: Record<string, ProcessingProgress>;
  isProcessing: boolean;
  clearProcessingState: () => void;
}

export const useImageProcessing = (): UseImageProcessingResult => {
  const [processingState, setProcessingState] = useState<Record<string, ProcessingProgress>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const updateProgress = useCallback((fileName: string, update: Partial<ProcessingProgress>) => {
    setProcessingState(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        ...update
      }
    }));
  }, []);

  const processImages = useCallback(async (
    files: File[],
    options: ImageProcessingOptions = {}
  ): Promise<ProcessingProgress[]> => {
    const {
      createThumbnails = true,
      sizes = ['thumbnail', 'small', 'medium', 'large'],
      optimizeForWeb = true,
      maxSizeMB = 2,
      createPlaceholder = true
    } = options;

    setIsProcessing(true);
    const results: ProcessingProgress[] = [];

    // Initialize processing state for all files
    files.forEach(file => {
      const initialState: ProcessingProgress = {
        fileName: file.name,
        progress: 0,
        status: 'pending'
      };
      setProcessingState(prev => ({
        ...prev,
        [file.name]: initialState
      }));
      results.push(initialState);
    });

    try {
      // Process files concurrently but limit concurrency to avoid memory issues
      const concurrencyLimit = 3;
      const batches: File[][] = [];
      
      for (let i = 0; i < files.length; i += concurrencyLimit) {
        batches.push(files.slice(i, i + concurrencyLimit));
      }

      for (const batch of batches) {
        await Promise.all(
          batch.map(async (file) => {
            try {
              // Validate file first
              const validation = ImageProcessingService.validateImageFile(file);
              if (!validation.valid) {
                updateProgress(file.name, {
                  status: 'error',
                  error: validation.error,
                  progress: 0
                });
                return;
              }

              updateProgress(file.name, {
                status: 'processing',
                progress: 10
              });

              const processedImages: ProcessedImage[] = [];
              let placeholder: string | undefined;

              // Create placeholder for progressive loading
              if (createPlaceholder) {
                try {
                  placeholder = await ImageProcessingService.createPlaceholder(file);
                  updateProgress(file.name, { progress: 20 });
                } catch (error) {
                  console.warn('Failed to create placeholder for', file.name, error);
                }
              }

              // Create multiple sizes
              if (createThumbnails) {
                const multiSizeImages = await ImageProcessingService.createMultipleSizes(file, sizes);
                processedImages.push(...multiSizeImages);
                updateProgress(file.name, { progress: 60 });
              }

              // Optimize original for web if requested
              if (optimizeForWeb) {
                const optimizedOriginal = await ImageProcessingService.optimizeForWeb(
                  file,
                  maxSizeMB,
                  1920,
                  1080,
                  0.9
                );

                const originalDimensions = await ImageProcessingService.getImageDimensions(optimizedOriginal);
                const dataUrl = await ImageProcessingService.fileToDataUrl(optimizedOriginal);

                processedImages.push({
                  file: optimizedOriginal,
                  blob: optimizedOriginal,
                  dataUrl,
                  width: originalDimensions.width,
                  height: originalDimensions.height,
                  size: optimizedOriginal.size,
                  sizeType: 'original'
                });

                updateProgress(file.name, { progress: 90 });
              }

              // Final update
              updateProgress(file.name, {
                status: 'completed',
                progress: 100,
                processedImages,
                placeholder
              });

            } catch (error) {
              console.error('Error processing image:', file.name, error);
              updateProgress(file.name, {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                progress: 0
              });
            }
          })
        );
      }

    } finally {
      setIsProcessing(false);
    }

    // Return final results
    return files.map(file => processingState[file.name]).filter(Boolean);
  }, [processingState, updateProgress]);

  const clearProcessingState = useCallback(() => {
    setProcessingState({});
    setIsProcessing(false);
  }, []);

  return {
    processImages,
    processingState,
    isProcessing,
    clearProcessingState
  };
};

// Utility hook for single image processing
export const useSingleImageProcessing = () => {
  const { processImages, processingState, isProcessing } = useImageProcessing();

  const processSingleImage = useCallback(async (
    file: File,
    options?: ImageProcessingOptions
  ): Promise<ProcessingProgress | null> => {
    const results = await processImages([file], options);
    return results[0] || null;
  }, [processImages]);

  return {
    processSingleImage,
    processingState,
    isProcessing
  };
};

// Hook for creating just thumbnails (lightweight option)
export const useThumbnailGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThumbnail = useCallback(async (
    file: File,
    size: number = 150,
    quality: number = 0.7
  ): Promise<ProcessedImage | null> => {
    setIsGenerating(true);
    
    try {
      const validation = ImageProcessingService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const thumbnail = await ImageProcessingService.createThumbnail(file, size, quality);
      return thumbnail;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateThumbnail,
    isGenerating
  };
};

export default useImageProcessing;