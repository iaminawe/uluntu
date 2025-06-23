import React, { useCallback, useState, useRef } from 'react';
import { Upload, Plus, AlertCircle } from 'lucide-react';
import { 
  hasFiles, 
  getFilesFromDragEvent, 
  formatFileSize 
} from '../../utils/fileValidation';

interface BatchUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

export const BatchUploadArea: React.FC<BatchUploadAreaProps> = ({
  onFilesSelected,
  disabled = false,
  maxFiles = 50,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragCounter(prev => prev + 1);
    
    if (hasFiles(e.nativeEvent)) {
      setIsDragOver(true);
    }
  }, [disabled]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, [disabled]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Set drag effect
    if (hasFiles(e.nativeEvent)) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }, [disabled]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragOver(false);
    setDragCounter(0);
    
    const files = getFilesFromDragEvent(e.nativeEvent);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [disabled, onFilesSelected]);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    
    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFilesSelected]);
  
  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);
  
  const acceptString = acceptedTypes.map(type => {
    // Convert MIME types to file extensions for the accept attribute
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg,.jpeg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif'
    };
    return extensions[type] || type;
  }).join(',');
  
  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg transition-all duration-200
        ${isDragOver && !disabled
          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-500'
          : 'border-slate-300 dark:border-slate-600'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:border-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }
        ${className}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptString}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="sr-only"
      />
      
      <div className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Upload Icon */}
          <div className={`
            w-16 h-16 rounded-lg flex items-center justify-center transition-colors
            ${isDragOver && !disabled
              ? 'bg-orange-500 text-white'
              : 'bg-orange-100 dark:bg-orange-900/20 text-orange-500'
            }
          `}>
            {isDragOver && !disabled ? (
              <Plus className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          {/* Title and Description */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {isDragOver && !disabled
                ? 'Drop files here'
                : 'Upload Photos'
              }
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {isDragOver && !disabled
                ? 'Release to add files to upload queue'
                : 'Drag and drop photos here, or click to select files'
              }
            </p>
          </div>
          
          {/* Action Button */}
          {!isDragOver && (
            <button
              onClick={handleClick}
              disabled={disabled}
              className={`
                inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors
                ${disabled
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
                }
              `}
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose Photos
            </button>
          )}
          
          {/* File Restrictions */}
          <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-center space-x-4 flex-wrap">
              <span>Maximum {maxFiles} files</span>
              <span>•</span>
              <span>Up to {formatFileSize(maxFileSize)} each</span>
            </div>
            <div className="flex items-center justify-center">
              <span>Supported: JPG, PNG, WebP, GIF</span>
            </div>
          </div>
          
          {/* Warning for disabled state */}
          {disabled && (
            <div className="flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Upload disabled</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Drag overlay */}
      {isDragOver && !disabled && (
        <div className="absolute inset-0 bg-orange-500/10 border-2 border-orange-500 rounded-lg flex items-center justify-center">
          <div className="text-orange-600 dark:text-orange-400 font-medium">
            Drop files to add them
          </div>
        </div>
      )}
    </div>
  );
};