import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import { photoApi } from './photoApi';
import {
  PhotoUpload,
  BatchUpload,
  UploadOptions,
  ImageProcessingOptions,
  CreatePhotoData,
  Photo,
  PhotoMetadata
} from '../types';

class UploadApi {
  private storageBucket = 'photos';
  private maxFileSize = 50 * 1024 * 1024; // 50MB
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private defaultImageProcessingOptions: ImageProcessingOptions = {
    generateThumbnails: true,
    thumbnailSizes: [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 300, height: 300, suffix: 'small' },
      { width: 800, height: 600, suffix: 'medium' },
    ],
    optimizeOriginal: true,
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.85,
    format: 'jpeg',
    watermark: {
      enabled: false,
      opacity: 0.3,
      position: 'bottom-right',
    },
  };

  async uploadPhoto(
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<Photo> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const filename = this.generateFilename(file);
      const filePath = `${options.galleryId || 'general'}/${filename}`;

      // Extract metadata if requested
      let metadata: PhotoMetadata | undefined;
      if (options.extractMetadata) {
        metadata = await photoApi.extractMetadata(file);
      }

      // Process image if needed
      const processedFile = options.generateThumbnails 
        ? await this.processImage(file, this.defaultImageProcessingOptions)
        : file;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.storageBucket)
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw handleSupabaseError(uploadError);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.storageBucket)
        .getPublicUrl(uploadData.path);

      // Generate thumbnails if requested
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnails) {
        thumbnailUrl = await this.generateThumbnail(file, filePath);
      }

      // Create photo record
      const photoData: CreatePhotoData = {
        title: options.title || file.name.split('.')[0],
        description: options.description,
        tags: options.tags || [],
        isPublic: options.isPublic ?? true,
        galleryId: options.galleryId,
        featured: options.featured ?? false,
        metadata,
      };

      // Create photo in database with file information
      const photo = await photoApi.createPhoto({
        ...photoData,
        url: publicUrl,
        thumbnailUrl,
        originalUrl: publicUrl,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        width: metadata?.width,
        height: metadata?.height,
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
          
          const photo = await this.uploadPhoto(
            file,
            options,
            (progress) => {
              batchUpload.files[index].progress = progress;
              if (onFileProgress) {
                onFileProgress(index, progress);
              }
              if (onBatchProgress) {
                onBatchProgress({ ...batchUpload });
              }
            }
          );

          batchUpload.files[index].status = 'completed';
          batchUpload.files[index].photoId = photo.id;
          batchUpload.files[index].thumbnailUrl = photo.thumbnailUrl;
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
      
      batchUpload.status = batchUpload.failedFiles > 0 && batchUpload.completedFiles === 0 
        ? 'failed' 
        : 'completed';
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
    const failedFiles = batchUpload.files.filter(upload => upload.status === 'failed');
    
    if (failedFiles.length === 0) {
      return batchUpload;
    }

    const retryFiles = failedFiles.map(upload => upload.file);
    return this.uploadBatch(retryFiles, options);
  }

  async deleteUploadedFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.storageBucket)
        .remove([filePath]);

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

  private generateFilename(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    return `${timestamp}-${randomString}.${extension}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async processImage(file: File, options: ImageProcessingOptions): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate dimensions
          let { width, height } = img;
          
          if (options.maxWidth && width > options.maxWidth) {
            height = (height * options.maxWidth) / width;
            width = options.maxWidth;
          }
          
          if (options.maxHeight && height > options.maxHeight) {
            width = (width * options.maxHeight) / height;
            height = options.maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image
          ctx?.drawImage(img, 0, 0, width, height);

          // Add watermark if enabled
          if (options.watermark?.enabled && options.watermark.text) {
            this.addWatermark(ctx!, width, height, options.watermark);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: `image/${options.format}`,
                  lastModified: Date.now(),
                });
                resolve(processedFile);
              } else {
                reject(new Error('Failed to process image'));
              }
            },
            `image/${options.format}`,
            options.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async generateThumbnail(file: File, originalPath: string): Promise<string> {
    try {
      const thumbnail = await this.createThumbnail(file, 300, 300);
      const thumbnailPath = originalPath.replace(/(\.[^.]+)$/, '_thumb$1');

      const { data, error } = await supabase.storage
        .from(this.storageBucket)
        .upload(thumbnailPath, thumbnail, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading thumbnail:', error);
        return '';
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.storageBucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return '';
    }
  }

  private async createThumbnail(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions (square crop)
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          offsetX, offsetY, size, size,
          0, 0, maxWidth, maxHeight
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  private addWatermark(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    watermark: NonNullable<ImageProcessingOptions['watermark']>
  ): void {
    if (!watermark.text) return;

    const fontSize = Math.max(12, width * 0.02);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = `rgba(255, 255, 255, ${watermark.opacity || 0.3})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${watermark.opacity || 0.3})`;
    ctx.lineWidth = 1;

    const textMetrics = ctx.measureText(watermark.text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    let x: number, y: number;

    switch (watermark.position) {
      case 'top-left':
        x = 10;
        y = textHeight + 10;
        break;
      case 'top-right':
        x = width - textWidth - 10;
        y = textHeight + 10;
        break;
      case 'bottom-left':
        x = 10;
        y = height - 10;
        break;
      case 'bottom-right':
        x = width - textWidth - 10;
        y = height - 10;
        break;
      case 'center':
      default:
        x = (width - textWidth) / 2;
        y = height / 2;
        break;
    }

    ctx.strokeText(watermark.text, x, y);
    ctx.fillText(watermark.text, x, y);
  }
}

export const uploadApi = new UploadApi();