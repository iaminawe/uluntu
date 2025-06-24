import imageCompression from 'browser-image-compression';

// Image size configurations
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150, quality: 0.7 },
  small: { width: 300, height: 300, quality: 0.8 },
  medium: { width: 800, height: 600, quality: 0.85 },
  large: { width: 1200, height: 900, quality: 0.9 },
  original: { quality: 0.95 }
} as const;

export type ImageSizeType = keyof typeof IMAGE_SIZES;

export interface ProcessedImage {
  file: File;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  sizeType: ImageSizeType;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ImageProcessingService {
  /**
   * Get image dimensions from a file or blob
   */
  static async getImageDimensions(file: File | Blob): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Smart crop detection using basic center-weighted algorithm
   * This can be enhanced with more sophisticated algorithms like face detection
   */
  static calculateSmartCrop(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number
  ): CropOptions {
    const originalAspect = originalWidth / originalHeight;
    const targetAspect = targetWidth / targetHeight;

    let cropWidth: number;
    let cropHeight: number;
    let x: number;
    let y: number;

    if (originalAspect > targetAspect) {
      // Original is wider, crop from sides
      cropHeight = originalHeight;
      cropWidth = originalHeight * targetAspect;
      x = (originalWidth - cropWidth) / 2;
      y = 0;
    } else {
      // Original is taller, crop from top/bottom
      cropWidth = originalWidth;
      cropHeight = originalWidth / targetAspect;
      x = 0;
      y = (originalHeight - cropHeight) / 2;
    }

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight)
    };
  }

  /**
   * Resize and crop image using canvas
   */
  static async resizeAndCrop(
    file: File,
    targetWidth: number,
    targetHeight: number,
    quality: number = 0.8,
    useSmarCrop: boolean = true
  ): Promise<ProcessedImage> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        URL.revokeObjectURL(imageUrl);
        
        try {
          const originalWidth = img.naturalWidth;
          const originalHeight = img.naturalHeight;

          // Set canvas size to target dimensions
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = originalWidth;
          let sourceHeight = originalHeight;

          if (useSmarCrop) {
            const cropOptions = this.calculateSmartCrop(
              originalWidth,
              originalHeight,
              targetWidth,
              targetHeight
            );
            sourceX = cropOptions.x;
            sourceY = cropOptions.y;
            sourceWidth = cropOptions.width;
            sourceHeight = cropOptions.height;
          }

          // Draw the image with cropping and scaling
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, targetWidth, targetHeight
          );

          // Convert canvas to blob
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }

              // Create file from blob
              const processedFile = new File(
                [blob],
                file.name,
                { type: file.type }
              );

              // Create data URL for preview
              const dataUrl = canvas.toDataURL(file.type, quality);

              resolve({
                file: processedFile,
                blob,
                dataUrl,
                width: targetWidth,
                height: targetHeight,
                size: blob.size,
                sizeType: 'medium' // This will be set by the calling function
              });
            },
            file.type,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }

  /**
   * Create multiple sizes of an image
   */
  static async createMultipleSizes(
    file: File,
    sizes: ImageSizeType[] = ['thumbnail', 'small', 'medium', 'large']
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    const originalDimensions = await this.getImageDimensions(file);

    for (const sizeType of sizes) {
      const sizeConfig = IMAGE_SIZES[sizeType];
      
      if (sizeType === 'original') {
        // For original, just compress without resizing
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          useWebWorker: true,
          initialQuality: sizeConfig.quality
        });

        const dataUrl = await this.fileToDataUrl(compressedFile);
        
        results.push({
          file: compressedFile,
          blob: compressedFile,
          dataUrl,
          width: originalDimensions.width,
          height: originalDimensions.height,
          size: compressedFile.size,
          sizeType
        });
      } else {
        // For other sizes, resize with smart cropping
        const processedImage = await this.resizeAndCrop(
          file,
          (sizeConfig as any).width,
          (sizeConfig as any).height,
          sizeConfig.quality,
          true
        );
        
        processedImage.sizeType = sizeType;
        results.push(processedImage);
      }
    }

    return results;
  }

  /**
   * Optimize image for web delivery
   */
  static async optimizeForWeb(
    file: File,
    maxSizeMB: number = 2,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    const options = {
      maxSizeMB,
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      initialQuality: quality,
      fileType: file.type as any
    };

    return await imageCompression(file, options);
  }

  /**
   * Create a thumbnail with smart cropping
   */
  static async createThumbnail(
    file: File,
    size: number = 150,
    quality: number = 0.7
  ): Promise<ProcessedImage> {
    const result = await this.resizeAndCrop(file, size, size, quality, true);
    result.sizeType = 'thumbnail';
    return result;
  }

  /**
   * Detect if image needs rotation based on EXIF data
   */
  static async getImageOrientation(file: File): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // This is a simplified version - in a real app you might want to use
        // a library like exif-js to read actual EXIF orientation data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(1); // Default orientation
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // For now, return default orientation
        // In a real implementation, you'd read EXIF data here
        resolve(1);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(1); // Default orientation
      };

      img.src = url;
    });
  }

  /**
   * Convert file to data URL
   */
  static async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculate file size reduction percentage
   */
  static calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP files are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 50MB.'
      };
    }

    return { valid: true };
  }

  /**
   * Progressive image loading - create a low quality placeholder
   */
  static async createPlaceholder(file: File): Promise<string> {
    const placeholderSize = 20; // Very small for blur effect
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(imageUrl);
        
        canvas.width = placeholderSize;
        canvas.height = placeholderSize;
        
        // Draw a very small, blurred version
        ctx.filter = 'blur(2px)';
        ctx.drawImage(img, 0, 0, placeholderSize, placeholderSize);
        
        resolve(canvas.toDataURL('image/jpeg', 0.1));
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to create placeholder'));
      };

      img.src = imageUrl;
    });
  }
}

export default ImageProcessingService;