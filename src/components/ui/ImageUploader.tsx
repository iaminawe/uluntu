import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { Button } from './Button';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onError,
  disabled = false,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  placeholder = 'Upload an image'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // In a real app, you'd upload to your storage service here
      // For now, we'll simulate an upload and use the preview URL
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, we'll use the preview URL as the final URL
      // In production, replace this with actual upload logic
      onChange(previewUrl);
      
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [onChange, onError, maxSize]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    handleFileUpload(files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled || isUploading) return;
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, isUploading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {preview ? (
        // Image Preview
        <div className="relative group">
          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleClick}
                  disabled={disabled || isUploading}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="bg-white bg-opacity-90 hover:bg-red-600 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Success indicator */}
            {!isUploading && preview && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`
            relative w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled || isUploading 
              ? 'cursor-not-allowed opacity-50' 
              : 'hover:bg-gray-50'
            }
          `}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            {isUploading ? (
              <>
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">{placeholder}</span>
                <span className="text-xs text-gray-400 mt-1">
                  Drag & drop or click to select (max {maxSize}MB)
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;