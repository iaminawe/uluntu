import { FileValidationResult, BatchUploadConfig } from '../types';

// Default configuration
export const DEFAULT_BATCH_CONFIG: BatchUploadConfig = {
  maxFiles: 50,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  maxWidth: 4000,
  maxHeight: 4000,
  enableImageResize: true,
  enableThumbnailGeneration: true,
  concurrent: 3
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Create image preview/thumbnail
 */
export const createImagePreview = (file: File, maxSize: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const { width, height } = img;
      const aspectRatio = width / height;
      
      let newWidth = maxSize;
      let newHeight = maxSize;
      
      if (aspectRatio > 1) {
        newHeight = maxSize / aspectRatio;
      } else {
        newWidth = maxSize * aspectRatio;
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          resolve(previewUrl);
        } else {
          reject(new Error('Failed to create preview'));
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for preview'));
    };
    
    img.src = url;
  });
};

/**
 * Validate a single file against the configuration
 */
export const validateFile = async (
  file: File, 
  config: BatchUploadConfig = DEFAULT_BATCH_CONFIG
): Promise<FileValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file type
  if (!config.acceptedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not supported. Accepted types: ${config.acceptedTypes.join(', ')}`);
  }
  
  // Check file size
  if (file.size > config.maxFileSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(config.maxFileSize)})`);
  }
  
  // Check if file is too small (likely corrupted)
  if (file.size < 1024) { // 1KB
    warnings.push('File is very small and might be corrupted');
  }
  
  // Check image dimensions if it's an image
  if (file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      
      if (config.maxWidth && dimensions.width > config.maxWidth) {
        warnings.push(`Image width (${dimensions.width}px) exceeds recommended maximum (${config.maxWidth}px)`);
      }
      
      if (config.maxHeight && dimensions.height > config.maxHeight) {
        warnings.push(`Image height (${dimensions.height}px) exceeds recommended maximum (${config.maxHeight}px)`);
      }
      
      // Check for extremely small images
      if (dimensions.width < 100 || dimensions.height < 100) {
        warnings.push('Image resolution is very low');
      }
      
    } catch (error) {
      errors.push('Unable to read image dimensions - file may be corrupted');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate multiple files
 */
export const validateFiles = async (
  files: File[], 
  config: BatchUploadConfig = DEFAULT_BATCH_CONFIG
): Promise<{
  validFiles: File[];
  invalidFiles: { file: File; errors: string[]; warnings: string[] }[];
  totalErrors: string[];
}> => {
  const validFiles: File[] = [];
  const invalidFiles: { file: File; errors: string[]; warnings: string[] }[] = [];
  const totalErrors: string[] = [];
  
  // Check total file count
  if (files.length > config.maxFiles) {
    totalErrors.push(`Too many files selected. Maximum allowed: ${config.maxFiles}, selected: ${files.length}`);
    files = files.slice(0, config.maxFiles);
  }
  
  // Check for duplicate filenames
  const fileNames = new Set<string>();
  const duplicateNames: string[] = [];
  
  files.forEach(file => {
    if (fileNames.has(file.name)) {
      duplicateNames.push(file.name);
    } else {
      fileNames.add(file.name);
    }
  });
  
  if (duplicateNames.length > 0) {
    totalErrors.push(`Duplicate filenames detected: ${duplicateNames.join(', ')}`);
  }
  
  // Validate each file
  const validationPromises = files.map(file => validateFile(file, config));
  const validationResults = await Promise.all(validationPromises);
  
  files.forEach((file, index) => {
    const result = validationResults[index];
    
    if (result.isValid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({
        file,
        errors: result.errors,
        warnings: result.warnings
      });
    }
  });
  
  return {
    validFiles,
    invalidFiles,
    totalErrors
  };
};

/**
 * Resize image if needed
 */
export const resizeImage = (
  file: File, 
  maxWidth: number = 2000, 
  maxHeight: number = 2000, 
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        } else {
          reject(new Error('Failed to resize image'));
        }
      }, file.type, quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = url;
  });
};

/**
 * Generate unique file ID
 */
export const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if drag event contains files
 */
export const hasFiles = (event: DragEvent): boolean => {
  return (
    (event.dataTransfer?.types.includes('Files') ?? false) ||
    (event.dataTransfer?.types.includes('application/x-moz-file') ?? false)
  );
};

/**
 * Get files from drag event
 */
export const getFilesFromDragEvent = (event: DragEvent): File[] => {
  const files: File[] = [];
  
  if (event.dataTransfer?.files) {
    Array.from(event.dataTransfer.files).forEach(file => {
      files.push(file);
    });
  }
  
  return files;
};