import React, { useState, useCallback } from 'react';
import { 
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  RotateCcw,
  Play,
  Pause,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { useBatchUpload } from '../../hooks/useBatchUpload';
import { BatchUploadConfig } from '../../types';

interface MobileBatchUploadProps {
  galleryId: string;
  config?: Partial<BatchUploadConfig>;
  onUploadComplete?: (uploadedPhotos: any[]) => void;
  onClose?: () => void;
}

export const MobileBatchUpload: React.FC<MobileBatchUploadProps> = ({
  galleryId,
  config: userConfig = {},
  onUploadComplete,
  onClose
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    queue,
    addFiles,
    removeFile,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryFile,
    retryFailedFiles,
    isUploading,
    isPaused,
    canUpload
  } = useBatchUpload({
    galleryId,
    config: {
      ...userConfig,
      maxFiles: userConfig.maxFiles || 20, // Reduce for mobile
      concurrent: userConfig.concurrent || 2 // Reduce concurrent uploads for mobile
    },
    hooks: {
      onBatchComplete: (result) => {
        if (result.uploadedPhotos.length > 0) {
          onUploadComplete?.(result.uploadedPhotos);
        }
      }
    }
  });

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addFiles(files);
      setIsExpanded(true);
    }
    // Reset input
    event.target.value = '';
  }, [addFiles]);

  const handleCameraCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addFiles(files);
      setIsExpanded(true);
    }
    // Reset input
    event.target.value = '';
  }, [addFiles]);

  const handleStartUpload = useCallback(async () => {
    try {
      await startUpload();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [startUpload]);

  const completedCount = queue.files.filter(f => f.status === 'completed').length;
  const failedCount = queue.files.filter(f => f.status === 'error').length;
  const totalCount = queue.files.length;

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Add Photos
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Upload photos from your device or take new ones with your camera
            </p>
          </div>
          
          <div className="space-y-3">
            {/* Camera capture */}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleCameraCapture}
                className="sr-only"
              />
              <div className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 font-medium">
                <Camera className="w-5 h-5" />
                Take Photos
              </div>
            </label>
            
            {/* File picker */}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="sr-only"
              />
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 font-medium text-gray-700">
                <Upload className="w-5 h-5" />
                Choose from Gallery
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">
              {totalCount} Photo{totalCount !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-600">
              {completedCount} uploaded, {failedCount} failed
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="px-4 py-2 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${queue.progress.overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {isExpanded && (
        <>
          {/* Action Buttons */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-2">
              {!isUploading && canUpload && (
                <button
                  onClick={handleStartUpload}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Upload All
                </button>
              )}
              
              {isUploading && !isPaused && (
                <button
                  onClick={pauseUpload}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              
              {isUploading && isPaused && (
                <button
                  onClick={resumeUpload}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
              
              {isUploading && (
                <button
                  onClick={cancelUpload}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium"
                >
                  Cancel
                </button>
              )}
              
              {failedCount > 0 && !isUploading && (
                <button
                  onClick={retryFailedFiles}
                  className="px-4 py-2 border border-orange-200 text-orange-600 rounded-lg font-medium flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
              )}
            </div>
            
            {/* Add more files */}
            <div className="mt-3 flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleCameraCapture}
                  className="sr-only"
                  disabled={isUploading}
                />
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-sm font-medium text-gray-700 flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera
                </div>
              </label>
              
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="sr-only"
                  disabled={isUploading}
                />
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-sm font-medium text-gray-700 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  Gallery
                </div>
              </label>
            </div>
          </div>

          {/* File List */}
          <div className="max-h-64 overflow-y-auto">
            {queue.files.map((file) => (
              <div key={file.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {/* Status icon */}
                      {file.status === 'completed' && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                      
                      {/* Status text */}
                      <span className="text-xs text-gray-600 capitalize">
                        {file.status === 'uploading' ? `${file.progress}%` : file.status}
                      </span>
                    </div>
                    
                    {/* Progress bar for individual files */}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Error message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-600 mt-1 truncate">
                        {file.error}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {file.status === 'error' && (
                      <button
                        onClick={() => retryFile(file.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    
                    {file.status !== 'uploading' && file.status !== 'processing' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};