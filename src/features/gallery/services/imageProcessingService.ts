import { Photo, PhotoUploadInput } from '../types';

export interface ImageVariant {
  width: number;
  height: number;
  quality: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export interface ProcessedImages {
  original: File;
  large?: File;
  medium?: File;
  small?: File;
  thumbnail?: File;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ProcessingOptions {
  enableWebP?: boolean;
  enableProgressive?: boolean;
  preserveMetadata?: boolean;
  smartCrop?: boolean;
  variants?: Record<string, ImageVariant>;
}

// Default image variants for different use cases
export const DEFAULT_VARIANTS: Record<string, ImageVariant> = {
  thumbnail: { width: 300, height: 300, quality: 0.8, format: 'jpeg' },
  small: { width: 600, height: 400, quality: 0.85, format: 'jpeg' },
  medium: { width: 1200, height: 800, quality: 0.9, format: 'jpeg' },
  large: { width: 2000, height: 1333, quality: 0.95, format: 'jpeg' }
};

export class ImageProcessingService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Get image dimensions from file
   */
  async getImageDimensions(file: File): Promise<ImageDimensions> {
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
   * Generate a low-quality placeholder for progressive loading
   */
  async generatePlaceholder(file: File, maxSize: number = 20): Promise<string> {
    const img = await this.loadImage(file);
    
    this.canvas.width = maxSize;
    this.canvas.height = maxSize;
    
    this.ctx.drawImage(img, 0, 0, maxSize, maxSize);
    
    return this.canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Extract dominant color from image
   */
  async getDominantColor(file: File): Promise<string> {
    const img = await this.loadImage(file);
    
    // Sample the image at a small resolution
    const sampleSize = 50;
    this.canvas.width = sampleSize;
    this.canvas.height = sampleSize;
    
    this.ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    
    const imageData = this.ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0, count = 0;
    
    // Sample every 4th pixel to improve performance
    for (let i = 0; i < data.length; i += 16) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Process a single image into multiple variants
   */
  async processImage(
    file: File, 
    options: ProcessingOptions = {}
  ): Promise<ProcessedImages> {
    const variants = { ...DEFAULT_VARIANTS, ...options.variants };
    const img = await this.loadImage(file);
    const originalDimensions = await this.getImageDimensions(file);
    
    const processed: ProcessedImages = {
      original: file
    };

    // Process each variant
    for (const [name, variant] of Object.entries(variants)) {
      try {
        const resizedFile = await this.resizeImage(
          img, 
          file.name, 
          file.type,
          variant,
          originalDimensions,
          options.smartCrop
        );
        
        (processed as any)[name] = resizedFile;
      } catch (error) {
        console.warn(`Failed to generate ${name} variant:`, error);
      }
    }

    return processed;
  }

  /**
   * Resize image to specific dimensions
   */
  private async resizeImage(
    img: HTMLImageElement,
    fileName: string,
    mimeType: string,
    variant: ImageVariant,
    originalDimensions: ImageDimensions,
    smartCrop: boolean = false
  ): Promise<File> {
    const { width: targetWidth, height: targetHeight, quality, format } = variant;
    
    let { width: sourceWidth, height: sourceHeight } = originalDimensions;
    let sx = 0, sy = 0; // source crop position
    
    // Calculate dimensions and crop if needed
    if (smartCrop) {
      const targetRatio = targetWidth / targetHeight;
      const sourceRatio = sourceWidth / sourceHeight;
      
      if (sourceRatio > targetRatio) {
        // Source is wider, crop horizontally
        const newWidth = sourceHeight * targetRatio;
        sx = (sourceWidth - newWidth) / 2;
        sourceWidth = newWidth;
      } else if (sourceRatio < targetRatio) {
        // Source is taller, crop vertically
        const newHeight = sourceWidth / targetRatio;
        sy = (sourceHeight - newHeight) / 2;
        sourceHeight = newHeight;
      }
    } else {
      // Scale to fit within bounds
      const scaleX = targetWidth / sourceWidth;
      const scaleY = targetHeight / sourceHeight;
      const scale = Math.min(scaleX, scaleY);
      
      if (scale < 1) {
        sourceWidth *= scale;
        sourceHeight *= scale;
      }
    }
    
    // Set canvas size
    this.canvas.width = smartCrop ? targetWidth : sourceWidth;
    this.canvas.height = smartCrop ? targetHeight : sourceHeight;
    
    // Clear canvas and draw resized image
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      img,
      sx, sy, originalDimensions.width - sx * 2, originalDimensions.height - sy * 2,
      0, 0, this.canvas.width, this.canvas.height
    );
    
    // Convert to blob
    const outputFormat = format === 'webp' ? 'image/webp' : 
                        format === 'png' ? 'image/png' : 'image/jpeg';
    
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            const extension = format || 'jpg';
            const baseName = fileName.replace(/\.[^/.]+$/, '');
            const newFileName = `${baseName}_${this.canvas.width}x${this.canvas.height}.${extension}`;
            
            const file = new File([blob], newFileName, {
              type: outputFormat,
              lastModified: Date.now()
            });
            
            resolve(file);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        },
        outputFormat,
        quality
      );
    });
  }

  /**
   * Load image from file
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Enhance photo upload input with processing metadata
   */
  async enhanceUploadInput(
    file: File,
    galleryId: string,
    options: ProcessingOptions = {}
  ): Promise<PhotoUploadInput> {
    try {
      // Get image metadata
      const dimensions = await this.getImageDimensions(file);
      const placeholder = await this.generatePlaceholder(file);
      const dominantColor = await this.getDominantColor(file);
      
      // Process image variants
      const processedImages = await this.processImage(file, options);
      
      return {
        file,
        galleryId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        dimensions,
        placeholder,
        dominantColor,
        processedImages
      };
    } catch (error) {
      console.error('Error enhancing upload input:', error);
      
      // Return basic input if processing fails
      return {
        file,
        galleryId,
        title: file.name.replace(/\.[^/.]+$/, '')
      };
    }
  }

  /**
   * Validate if browser supports required features
   */
  static isSupported(): boolean {
    return !!(
      typeof HTMLCanvasElement !== 'undefined' &&
      typeof File !== 'undefined' &&
      typeof FileReader !== 'undefined'
    );
  }

  /**
   * Get WebP support
   */
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      canvas.toBlob(
        (blob) => resolve(blob?.type === 'image/webp'),
        'image/webp'
      );
    });
  }
}

// Export singleton instance
export const imageProcessingService = new ImageProcessingService();