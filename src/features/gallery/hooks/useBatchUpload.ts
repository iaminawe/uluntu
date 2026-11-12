import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  BatchUploadFile, 
  BatchUploadConfig, 
  BatchUploadProgress, 
  BatchUploadQueue,
  BatchUploadHooks,
  BatchUploadResult,
  Photo,
  PhotoUploadInput
} from '../types';
import { 
  DEFAULT_BATCH_CONFIG, 
  validateFiles, 
  createImagePreview, 
  generateFileId,
  getImageDimensions,
  resizeImage
} from '../utils/fileValidation';
import { imageProcessingService } from '../services/imageProcessingService';
import { galleryApi } from '../api/galleryApi';
import { GalleryErrorHandler } from '../utils/errorHandler';
import { logger } from '@/utils/logger';

interface UseBatchUploadProps {
  galleryId?: string;
  config?: Partial<BatchUploadConfig>;
  hooks?: BatchUploadHooks;
}

interface UseBatchUploadReturn {
  queue: BatchUploadQueue;
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (fileId: string) => void;
  removeAllFiles: () => void;
  startUpload: () => Promise<BatchUploadResult>;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelUpload: () => void;
  retryFile: (fileId: string) => Promise<void>;
  retryFailedFiles: () => Promise<void>;
  isUploading: boolean;
  isPaused: boolean;
  canUpload: boolean;
}

export const useBatchUpload = ({
  galleryId,
  config: userConfig = {},
  hooks = {}
}: UseBatchUploadProps = {}): UseBatchUploadReturn => {
  const config = { ...DEFAULT_BATCH_CONFIG, ...userConfig };
  
  const [queue, setQueue] = useState<BatchUploadQueue>({
    files: [],
    progress: {
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      overallProgress: 0,
      currentlyUploading: 0,
      isComplete: false,
      hasErrors: false
    },
    config
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const activeUploadsRef = useRef<Set<string>>(new Set());
  
  // Calculate if upload can start
  const canUpload = queue.files.length > 0 && 
                   queue.files.some(f => f.status === 'pending' || f.status === 'error') &&
                   !isUploading &&
                   !!galleryId;
  
  // Update progress when files change
  useEffect(() => {
    const totalFiles = queue.files.length;
    const completedFiles = queue.files.filter(f => f.status === 'completed').length;
    const failedFiles = queue.files.filter(f => f.status === 'error').length;
    const currentlyUploading = queue.files.filter(f => 
      f.status === 'uploading' || f.status === 'processing' || f.status === 'validating'
    ).length;
    
    const overallProgress = totalFiles > 0 ? 
      (completedFiles + failedFiles) / totalFiles * 100 : 0;
    
    const newProgress: BatchUploadProgress = {
      totalFiles,
      completedFiles,
      failedFiles,
      overallProgress,
      currentlyUploading,
      isComplete: totalFiles > 0 && completedFiles + failedFiles === totalFiles,
      hasErrors: failedFiles > 0
    };
    
    setQueue(prev => ({
      ...prev,
      progress: newProgress
    }));
    
    hooks.onBatchProgress?.(newProgress);
    
    // Check if batch is complete
    if (newProgress.isComplete && totalFiles > 0) {
      const result: BatchUploadResult = {
        totalFiles,
        successCount: completedFiles,
        errorCount: failedFiles,
        uploadedPhotos: queue.files
          .filter(f => f.status === 'completed' && f.uploadedPhoto)
          .map(f => f.uploadedPhoto!),
        errors: queue.files
          .filter(f => f.status === 'error')
          .map(f => ({
            fileId: f.id,
            fileName: f.name,
            error: f.error || 'Unknown error'
          }))
      };
      
      // Show batch completion notification
      if (completedFiles > 0 && failedFiles === 0) {
        GalleryErrorHandler.showSuccess(
          `Successfully uploaded ${completedFiles} photo${completedFiles !== 1 ? 's' : ''}!`
        );
      } else if (completedFiles > 0 && failedFiles > 0) {
        GalleryErrorHandler.showWarning(
          `Uploaded ${completedFiles} photo${completedFiles !== 1 ? 's' : ''}, ${failedFiles} failed`
        );
      } else if (failedFiles > 0) {
        GalleryErrorHandler.showError({
          code: 'BATCH_UPLOAD_FAILED',
          message: 'All uploads failed',
          userMessage: `Failed to upload ${failedFiles} photo${failedFiles !== 1 ? 's' : ''}. Please check the files and try again.`,
          retry: true,
          recoverable: true
        });
      }
      
      hooks.onBatchComplete?.(result);
      setIsUploading(false);
    }
  }, [queue.files, hooks]);
  
  // Add files to queue
  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    // Validate files
    const { validFiles, invalidFiles, totalErrors } = await validateFiles(files, config);
    
    // Show validation errors if any
    if (totalErrors.length > 0) {
      logger.warn('File validation errors', 'BATCH_UPLOAD', totalErrors);
      totalErrors.forEach(error => {
        GalleryErrorHandler.showWarning(error, { duration: 4000 });
      });
    }
    
    // Convert valid files to BatchUploadFile objects
    const batchFiles: BatchUploadFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const id = generateFileId();
        let preview: string | undefined;
        let metadata: { width: number; height: number } | undefined;
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          try {
            [preview, metadata] = await Promise.all([
              createImagePreview(file),
              getImageDimensions(file),
            ]);
          } catch (error) {
            logger.warn(`Failed to create preview for ${file.name}`, 'BATCH_UPLOAD', error);
          }
        }
        
        const batchFile: BatchUploadFile = {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview,
          status: 'pending',
          progress: 0,
          metadata
        };
        
        hooks.onFileAdd?.(batchFile);
        return batchFile;
      })
    );
    
    // Add to queue
    setQueue(prev => ({
      ...prev,
      files: [...prev.files, ...batchFiles]
    }));
    
    // Handle invalid files
    invalidFiles.forEach(({ file, errors }) => {
      logger.error(`Invalid file ${file.name}`, 'BATCH_UPLOAD', errors);
      errors.forEach(error => {
        GalleryErrorHandler.showError(
          { code: 'VALIDATION_ERROR', message: error, userMessage: `${file.name}: ${error}` },
          'VALIDATION'
        );
      });
    });
    
  }, [config, hooks]);
  
  // Remove file from queue
  const removeFile = useCallback((fileId: string) => {
    setQueue(prev => ({
      ...prev,
      files: prev.files.filter(f => {
        if (f.id === fileId) {
          // Revoke preview URL to prevent memory leaks
          if (f.preview) {
            URL.revokeObjectURL(f.preview);
          }
          hooks.onFileRemove?.(fileId);
          return false;
        }
        return true;
      })
    }));
  }, [hooks]);
  
  // Remove all files
  const removeAllFiles = useCallback(() => {
    // Revoke all preview URLs
    queue.files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setQueue(prev => ({
      ...prev,
      files: []
    }));
  }, [queue.files]);
  
  // Update file status and progress
  const updateFile = useCallback((fileId: string, updates: Partial<BatchUploadFile>) => {
    setQueue(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === fileId ? { ...f, ...updates } : f
      )
    }));
    
    if (updates.progress !== undefined) {
      hooks.onFileProgress?.(fileId, updates.progress);
    }
    
    if (updates.status === 'completed' && updates.uploadedPhoto) {
      hooks.onFileComplete?.(fileId, updates.uploadedPhoto);
    }
    
    if (updates.status === 'error' && updates.error) {
      hooks.onFileError?.(fileId, updates.error);
    }
  }, [hooks]);
  
  // Upload single file
  const uploadFile = useCallback(async (file: BatchUploadFile): Promise<void> => {
    if (!galleryId) {
      throw new Error('Gallery ID is required for upload');
    }
    
    updateFile(file.id, { status: 'validating', progress: 10 });
    
    try {
      // Enhanced processing with image processing service
      updateFile(file.id, { status: 'processing', progress: 30 });
      
      const uploadInput = await imageProcessingService.enhanceUploadInput(
        file.file,
        galleryId,
        {
          enableWebP: config.enableImageResize,
          smartCrop: true,
          variants: config.enableImageResize ? {
            thumbnail: { width: 300, height: 300, quality: 0.8 },
            small: { width: 600, height: 400, quality: 0.85 },
            medium: { width: 1200, height: 800, quality: 0.9 },
            large: { width: 2000, height: 1333, quality: 0.95 }
          } : undefined
        }
      );
      
      updateFile(file.id, { status: 'uploading', progress: 70 });
      
      const uploadedPhoto = await galleryApi.uploadPhoto(uploadInput);
      updateFile(file.id, { 
        status: 'completed', 
        progress: 100, 
        uploadedPhoto 
      });
    } catch (error) {
      const galleryError = GalleryErrorHandler.parseError(error, 'UPLOAD');
      updateFile(file.id, { 
        status: 'error', 
        progress: 0, 
        error: galleryError.userMessage || galleryError.message
      });
      
      // Only show error notification if it's not a batch operation
      if (!config.concurrent || config.concurrent === 1) {
        GalleryErrorHandler.showError(galleryError, 'UPLOAD');
      }
      
      throw error;
    }
  }, [galleryId, config, updateFile]);
  
  // Start batch upload
  const startUpload = useCallback(async (): Promise<BatchUploadResult> => {
    if (!canUpload) {
      throw new Error('Cannot start upload: missing gallery ID or no pending files');
    }
    
    setIsUploading(true);
    setIsPaused(false);
    uploadControllerRef.current = new AbortController();
    
    hooks.onBatchStart?.();
    
    const filesToUpload = queue.files.filter(f => 
      f.status === 'pending' || f.status === 'error'
    );
    
    const uploadPromises: Promise<void>[] = [];
    const concurrentLimit = config.concurrent;
    
    // Process files in batches with concurrency limit
    for (let i = 0; i < filesToUpload.length; i += concurrentLimit) {
      const batch = filesToUpload.slice(i, i + concurrentLimit);
      
      const batchPromises = batch.map(async (file) => {
        if (uploadControllerRef.current?.signal.aborted || isPaused) {
          return;
        }
        
        activeUploadsRef.current.add(file.id);
        
        try {
          await uploadFile(file);
        } catch (error) {
          logger.error(`Failed to upload ${file.name}`, 'BATCH_UPLOAD', error);
        } finally {
          activeUploadsRef.current.delete(file.id);
        }
      });
      
      uploadPromises.push(...batchPromises);
      
      // Wait for current batch to complete before starting next batch
      await Promise.allSettled(batchPromises);
      
      // Check if upload was cancelled or paused
      if (uploadControllerRef.current?.signal.aborted || isPaused) {
        break;
      }
    }
    
    await Promise.allSettled(uploadPromises);
    
    const finalQueue = queue;
    const result: BatchUploadResult = {
      totalFiles: finalQueue.progress.totalFiles,
      successCount: finalQueue.progress.completedFiles,
      errorCount: finalQueue.progress.failedFiles,
      uploadedPhotos: finalQueue.files
        .filter(f => f.status === 'completed' && f.uploadedPhoto)
        .map(f => f.uploadedPhoto!),
      errors: finalQueue.files
        .filter(f => f.status === 'error')
        .map(f => ({
          fileId: f.id,
          fileName: f.name,
          error: f.error || 'Unknown error'
        }))
    };
    
    return result;
  }, [canUpload, queue.files, config.concurrent, hooks, uploadFile, isPaused]);
  
  // Pause upload
  const pauseUpload = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  // Resume upload
  const resumeUpload = useCallback(async () => {
    if (isPaused && isUploading) {
      setIsPaused(false);
      await startUpload();
    }
  }, [isPaused, isUploading, startUpload]);
  
  // Cancel upload
  const cancelUpload = useCallback(() => {
    uploadControllerRef.current?.abort();
    activeUploadsRef.current.clear();
    setIsUploading(false);
    setIsPaused(false);
    
    // Reset uploading files to pending
    setQueue(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.status === 'uploading' || f.status === 'processing' || f.status === 'validating'
          ? { ...f, status: 'pending' as const, progress: 0 }
          : f
      )
    }));
  }, []);
  
  // Retry single file
  const retryFile = useCallback(async (fileId: string) => {
    const file = queue.files.find(f => f.id === fileId);
    if (!file || file.status !== 'error') return;
    
    updateFile(fileId, { status: 'pending', progress: 0, error: undefined });
    
    try {
      await uploadFile(file);
    } catch (error) {
      logger.error(`Retry failed for ${file.name}`, 'BATCH_UPLOAD', error);
    }
  }, [queue.files, updateFile, uploadFile]);
  
  // Retry all failed files
  const retryFailedFiles = useCallback(async () => {
    const failedFiles = queue.files.filter(f => f.status === 'error');
    
    for (const file of failedFiles) {
      await retryFile(file.id);
    }
  }, [queue.files, retryFile]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Revoke all preview URLs
      queue.files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      // Cancel any ongoing uploads
      uploadControllerRef.current?.abort();
    };
  }, []);
  
  return {
    queue,
    addFiles,
    removeFile,
    removeAllFiles,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryFile,
    retryFailedFiles,
    isUploading,
    isPaused,
    canUpload
  };
};