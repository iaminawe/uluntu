import { supabase, handleSupabaseError } from '@/shared/api/client';
import { galleryApi } from './galleryApi';
import { imageProcessingService } from '../services/imageProcessingService';
import { PhotoUploadInput, BatchUploadConfig, BatchUploadFile, BatchUploadResult, Photo } from '../types';

// Compatibility types
type PhotoUpload = PhotoUploadInput;
type BatchUpload = {
  id: string;
  files: Array<{
    file: File;
    progress: number;
    status: string;
    photoId?: string;
    thumbnailUrl?: string;
    error?: string;
  }>;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  galleryId?: string;
};
type UploadOptions = any;

class UploadApi {
  private storageBucket = 'gallery-photos';
  private maxFileSize = 50 * 1024 * 1024; // 50MB
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  async uploadPhoto(file: File, options: UploadOptions = {}, onProgress?: (progress: number) => void): Promise<Photo> {
    try {
      this.validateFile(file);

      // Same path as the batch upload dialog: resize in the browser, then
      // galleryApi stores every size under the uploader's own folder in the
      // gallery-photos bucket and creates the gallery_photos row.
      const input = await imageProcessingService.enhanceUploadInput(file, options.galleryId || options.gallery_id);
      const photo = await galleryApi.uploadPhoto({
        ...input,
        title: options.title || input.title,
        description: options.description,
        tags: options.tags || [],
      });

      if (onProgress) {
        onProgress(100);
      }

      return photo;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async uploadBatch(
    files: File[],
    options: UploadOptions = {},
    onBatchProgress?: (batchUpload: BatchUpload) => void,
    onFileProgress?: (fileIndex: number, progress: number) => void
  ): Promise<BatchUpload> {
    const batchId = this.generateBatchId();
    const batchUpload: BatchUpload = {
      id: batchId,
      files: files.map(file => ({
        file,
        progress: 0,
        status: 'pending',
      })),
      totalFiles: files.length,
      completedFiles: 0,
      failedFiles: 0,
      status: 'pending',
      startedAt: new Date().toISOString(),
      galleryId: options.galleryId,
    };

    try {
      batchUpload.status = 'uploading';
      if (onBatchProgress) {
        onBatchProgress({ ...batchUpload });
      }

      const uploadPromises = files.map(async (file, index) => {
        try {
          batchUpload.files[index].status = 'uploading';

          const photo = await this.uploadPhoto(file, options, progress => {
            batchUpload.files[index].progress = progress;
            if (onFileProgress) {
              onFileProgress(index, progress);
            }
            if (onBatchProgress) {
              onBatchProgress({ ...batchUpload });
            }
          });

          batchUpload.files[index].status = 'completed';
          batchUpload.files[index].photoId = photo.id;
          batchUpload.files[index].thumbnailUrl = photo.thumbnail_url;
          batchUpload.completedFiles++;

          if (onBatchProgress) {
            onBatchProgress({ ...batchUpload });
          }

          return photo;
        } catch (error) {
          batchUpload.files[index].status = 'failed';
          batchUpload.files[index].error = error instanceof Error ? error.message : 'Upload failed';
          batchUpload.failedFiles++;

          if (onBatchProgress) {
            onBatchProgress({ ...batchUpload });
          }

          return null;
        }
      });

      const results = await Promise.allSettled(uploadPromises);

      batchUpload.status = batchUpload.failedFiles > 0 && batchUpload.completedFiles === 0 ? 'failed' : 'completed';
      batchUpload.completedAt = new Date().toISOString();

      if (onBatchProgress) {
        onBatchProgress({ ...batchUpload });
      }

      return batchUpload;
    } catch (error) {
      batchUpload.status = 'failed';
      batchUpload.completedAt = new Date().toISOString();
      console.error('Batch upload error:', error);
      throw error;
    }
  }

  async cancelUpload(batchId: string): Promise<boolean> {
    try {
      // In a real implementation, this would cancel ongoing uploads
      // For now, we'll just mark the batch as cancelled
      return true;
    } catch (error) {
      console.error('Error cancelling upload:', error);
      return false;
    }
  }

  async retryFailedUploads(batchUpload: BatchUpload, options: UploadOptions = {}): Promise<BatchUpload> {
    const failedFiles = batchUpload.files.filter((upload: any) => upload.status === 'failed');

    if (failedFiles.length === 0) {
      return batchUpload;
    }

    const retryFiles = failedFiles.map((upload: any) => upload.file);
    return this.uploadBatch(retryFiles, options);
  }

  async deleteUploadedFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(this.storageBucket).remove([filePath]);

      if (error) {
        throw handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      console.error('Error deleting uploaded file:', error);
      return false;
    }
  }

  private validateFile(file: File): void {
    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

export const uploadApi = new UploadApi();
