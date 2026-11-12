import { supabase } from '@/lib/supabase';
import { logAndSanitizeError } from '@/utils/errorSanitization';

// Storage configuration and types
export interface StorageConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  thumbnailSizes: {
    thumb: { width: number; height: number };
    medium: { width: number; height: number };
  };
  autoCleanupEnabled: boolean;
  cleanupAgeHours: number;
}

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    url: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}

export interface StorageUsage {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeMB: number;
}

interface ConfigItem {
  config_key: string;
  config_value: any;
}

export interface FileUploadOptions {
  userId: string;
  galleryId: string;
  file: File;
  generateThumbnails?: boolean;
  quality?: number;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class StorageService {
  private static instance: StorageService;
  private config: StorageConfig | null = null;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize storage service and load configuration
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadStorageConfig();
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Storage Service - Initialize');
      // Use default config as fallback
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Load storage configuration from database
   */
  private async loadStorageConfig(): Promise<void> {
    const { data, error } = await (supabase as any)
      .from('storage_config')
      .select('config_key, config_value');

    if (error) {
      throw error;
    }

    const configMap = data.reduce((acc: Record<string, any>, item: ConfigItem) => {
      acc[item.config_key] = item.config_value;
      return acc;
    }, {} as Record<string, any>);

    this.config = {
      maxFileSize: parseInt(configMap.max_file_size || '52428800'),
      allowedMimeTypes: configMap.allowed_mime_types || this.getDefaultConfig().allowedMimeTypes,
      thumbnailSizes: configMap.thumbnail_sizes || this.getDefaultConfig().thumbnailSizes,
      autoCleanupEnabled: configMap.auto_cleanup_enabled === true,
      cleanupAgeHours: parseInt(configMap.cleanup_age_hours || '24')
    };
  }

  /**
   * Get default storage configuration
   */
  private getDefaultConfig(): StorageConfig {
    return {
      maxFileSize: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'image/gif',
        'image/bmp',
        'image/tiff'
      ],
      thumbnailSizes: {
        thumb: { width: 300, height: 300 },
        medium: { width: 800, height: 800 }
      },
      autoCleanupEnabled: true,
      cleanupAgeHours: 24
    };
  }

  /**
   * Generate storage path for user gallery files
   */
  public generateStoragePath(
    userId: string,
    galleryId: string,
    filename: string,
    sizeVariant: 'originals' | 'thumbs' | 'medium' = 'originals'
  ): string {
    const sanitizedFilename = this.sanitizeFilename(filename);
    const timestamp = Date.now();
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = filename.split('.').slice(0, -1).join('.');
    
    const finalFilename = `${this.sanitizeFilename(baseName)}_${timestamp}.${extension}`;
    
    return `users/${userId}/galleries/${galleryId}/${sizeVariant}/${finalFilename}`;
  }

  /**
   * Generate temporary storage path for processing
   */
  public generateTempPath(userId: string, filename: string): string {
    const sanitizedFilename = this.sanitizeFilename(filename);
    const timestamp = Date.now();
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = filename.split('.').slice(0, -1).join('.');
    
    const finalFilename = `${this.sanitizeFilename(baseName)}_${timestamp}.${extension}`;
    
    return `users/${userId}/temp/${finalFilename}`;
  }

  /**
   * Sanitize filename for storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Validate file before upload
   */
  public validateFile(file: File): { valid: boolean; error?: string } {
    const config = this.config || this.getDefaultConfig();

    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `File size (${(file.size / 1048576).toFixed(2)}MB) exceeds maximum allowed size of ${(config.maxFileSize / 1048576)}MB`
      };
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type '${file.type}' is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`
      };
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Upload file to gallery storage
   */
  public async uploadGalleryPhoto(options: FileUploadOptions): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(options.file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate storage path
      const storagePath = this.generateStoragePath(
        options.userId,
        options.galleryId,
        options.file.name
      );

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-photos')
        .upload(storagePath, options.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        const sanitized = logAndSanitizeError(uploadError, 'Storage Service - Upload');
        return { success: false, error: sanitized.userMessage };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(storagePath);

      const result: UploadResult = {
        success: true,
        data: {
          path: storagePath,
          url: publicUrl,
          size: options.file.size,
          mimeType: options.file.type
        }
      };

      // Generate thumbnails if requested
      if (options.generateThumbnails) {
        try {
          await this.generateThumbnails(options.userId, options.galleryId, options.file, storagePath);
        } catch (thumbnailError) {
          logAndSanitizeError(thumbnailError, 'Storage Service - Thumbnail Generation');
          // Don't fail the main upload if thumbnails fail
        }
      }

      return result;
    } catch (error: any) {
      const sanitized = logAndSanitizeError(error, 'Storage Service - Upload Failed');
      return { success: false, error: sanitized.userMessage };
    }
  }

  /**
   * Generate thumbnails for uploaded image
   */
  private async generateThumbnails(
    userId: string,
    galleryId: string,
    originalFile: File,
    originalPath: string
  ): Promise<void> {
    const config = this.config || this.getDefaultConfig();

    try {
      // Create thumbnail versions; each size is independent.
      await Promise.all(Object.entries(config.thumbnailSizes).map(async ([sizeKey, dimensions]) => {
        const thumbnailFile = await this.resizeImage(originalFile, dimensions);
        
        if (thumbnailFile) {
          const thumbnailPath = this.generateStoragePath(
            userId,
            galleryId,
            `${sizeKey}_${originalFile.name}`,
            sizeKey as 'thumbs' | 'medium'
          );

          await supabase.storage
            .from('gallery-thumbnails')
            .upload(thumbnailPath, thumbnailFile, {
              cacheControl: '3600',
              upsert: false
            });
        }
      }));
    } catch (error) {
      const sanitized = logAndSanitizeError(error, 'Storage Service - Generate Thumbnails');
      throw new Error(sanitized.userMessage);
    }
  }

  /**
   * Resize image using Canvas API
   */
  private async resizeImage(file: File, dimensions: { width: number; height: number }): Promise<File | null> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        const { width: targetWidth, height: targetHeight } = dimensions;
        const aspectRatio = img.width / img.height;
        
        let newWidth = targetWidth;
        let newHeight = targetHeight;
        
        if (aspectRatio > 1) {
          // Landscape
          newHeight = targetWidth / aspectRatio;
        } else {
          // Portrait or square
          newWidth = targetHeight * aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw resized image
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(null);
          }
        }, 'image/webp', 0.85);
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Delete file from storage
   */
  public async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        logAndSanitizeError(error, 'Storage Service - Delete File');
        return false;
      }

      return true;
    } catch (error) {
      logAndSanitizeError(error, 'Storage Service - Delete Failed');
      return false;
    }
  }

  /**
   * Delete all files for a gallery
   */
  public async deleteGalleryFiles(userId: string, galleryId: string): Promise<boolean> {
    try {
      const patterns = [
        `users/${userId}/galleries/${galleryId}/originals/`,
        `users/${userId}/galleries/${galleryId}/thumbs/`,
        `users/${userId}/galleries/${galleryId}/medium/`
      ];

      let allSuccess = true;

      for (const pattern of patterns) {
        // List files matching pattern
        const { data: files, error: listError } = await supabase.storage
          .from('gallery-photos')
          .list(`users/${userId}/galleries/${galleryId}`, {
            search: pattern
          });

        if (listError) {
          logAndSanitizeError(listError, 'Storage Service - List Gallery Files');
          allSuccess = false;
          continue;
        }

        if (files && files.length > 0) {
          const filePaths = files.map(file => `${pattern}${file.name}`);
          
          const { error: deleteError } = await supabase.storage
            .from('gallery-photos')
            .remove(filePaths);

          if (deleteError) {
            logAndSanitizeError(deleteError, 'Storage Service - Batch Delete');
            allSuccess = false;
          }
        }
      }

      return allSuccess;
    } catch (error) {
      logAndSanitizeError(error, 'Storage Service - Delete Gallery Files');
      return false;
    }
  }

  /**
   * Get storage usage for user
   */
  public async getUserStorageUsage(userId: string): Promise<StorageUsage | null> {
    try {
      // RPC function not available - return mock usage for now
      // const { data, error } = await supabase
      //   .rpc('get_user_storage_usage', { user_uuid: userId });
      
      return {
        totalFiles: 0,
        totalSizeBytes: 0,
        totalSizeMB: 0
      };
    } catch (error) {
      logAndSanitizeError(error, 'Storage Service - Get Usage Failed');
      return null;
    }
  }

  /**
   * Clean up orphaned files
   */
  public async cleanupOrphanedFiles(): Promise<number> {
    try {
      // RPC function not available - return 0 for now
      // const { data, error } = await supabase
      //   .rpc('cleanup_orphaned_gallery_files');

      // if (error) {
      //   logAndSanitizeError(error, 'Storage Service - Cleanup');
      //   return 0;
      // }

      return 0;
    } catch (error) {
      logAndSanitizeError(error, 'Storage Service - Cleanup Failed');
      return 0;
    }
  }

  /**
   * Get public URL for storage object
   */
  public getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Generate thumbnail path from original path
   */
  public generateThumbnailPath(originalPath: string, size: 'thumb' | 'medium' = 'thumb'): string {
    const pathParts = originalPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    const baseName = filename.split('.')[0];
    
    // Replace 'originals' with size variant
    pathParts[4] = size === 'thumb' ? 'thumbs' : 'medium';
    
    // Create optimized filename
    pathParts[pathParts.length - 1] = `${baseName}_${size}.webp`;
    
    return pathParts.join('/');
  }

  /**
   * Check if file exists in storage
   */
  public async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.substring(0, path.lastIndexOf('/')), {
          search: path.substring(path.lastIndexOf('/') + 1)
        });

      return !error && data && data.length > 0;
    } catch (error) {
      logAndSanitizeError(error, 'Storage Service - File Exists Check');
      return false;
    }
  }

  /**
   * Get signed URL for private files
   */
  public async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        logAndSanitizeError(error, 'Storage Service - Get Signed URL');
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      logAndSanitizeError(error, 'Storage Service - Get Signed URL Failed');
      return null;
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();