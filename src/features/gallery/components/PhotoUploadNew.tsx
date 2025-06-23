import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { galleryApiNew } from '../api/galleryApiNew';
import { storageService } from '@/services/storageService';
import { PhotoUploadInput, UploadProgress } from '../types';

interface PhotoUploadProps {
  galleryId: string;
  onUploadComplete?: (photos: any[]) => void;
  onUploadProgress?: (progress: UploadProgress[]) => void;
  maxFiles?: number;
  className?: string;
}

export function PhotoUploadNew({
  galleryId,
  onUploadComplete,
  onUploadProgress,
  maxFiles = 10,
  className = ''
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);

  const updateProgress = useCallback((photoId: string, progress: Partial<UploadProgress>) => {
    setUploadProgress(prev => {
      const updated = prev.map(p => 
        p.photoId === photoId ? { ...p, ...progress } : p
      );
      onUploadProgress?.(updated);
      return updated;
    });
  }, [onUploadProgress]);

  const processFile = useCallback(async (file: File): Promise<void> => {
    const photoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to progress tracking
    const initialProgress: UploadProgress = {
      photoId,
      fileName: file.name,
      progress: 0,
      status: 'pending'
    };
    
    setUploadProgress(prev => [...prev, initialProgress]);

    try {
      // Validate file
      const validation = storageService.validateFile(file);
      if (!validation.valid) {
        updateProgress(photoId, {
          status: 'error',
          error: validation.error
        });
        return;
      }

      updateProgress(photoId, {
        status: 'uploading',
        progress: 10
      });

      // Create upload input
      const uploadInput: PhotoUploadInput = {
        file,
        galleryId,
        title: file.name.split('.')[0],
        tags: []
      };

      updateProgress(photoId, {
        progress: 30
      });

      // Upload photo
      const photo = await galleryApiNew.uploadPhoto(uploadInput);

      updateProgress(photoId, {
        status: 'processing',
        progress: 80
      });

      // Simulate processing time for thumbnails
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateProgress(photoId, {
        status: 'completed',
        progress: 100
      });

      setUploadedPhotos(prev => [...prev, photo]);

    } catch (error: any) {
      console.error('Upload failed:', error);
      updateProgress(photoId, {
        status: 'error',
        error: error.message || 'Upload failed'
      });
    }
  }, [galleryId, updateProgress]);

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploading) return;

    const filesToUpload = acceptedFiles.slice(0, maxFiles);
    
    setUploading(true);
    setUploadProgress([]);
    setUploadedPhotos([]);

    try {
      // Process files in parallel (with limit)
      const uploadPromises = filesToUpload.map(processFile);
      await Promise.all(uploadPromises);

      // Wait a moment for UI updates
      setTimeout(() => {
        onUploadComplete?.(uploadedPhotos);
        setUploading(false);
      }, 500);

    } catch (error) {
      console.error('Batch upload failed:', error);
      setUploading(false);
    }
  }, [uploading, maxFiles, processFile, uploadedPhotos, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff']
    },
    maxFiles,
    disabled: uploading
  });

  const completedUploads = uploadProgress.filter(p => p.status === 'completed').length;
  const failedUploads = uploadProgress.filter(p => p.status === 'error').length;
  const totalFiles = uploadProgress.length;

  return (
    <div className={`photo-upload ${className}`}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {!uploading ? (
          <div>
            <div className="mx-auto w-12 h-12 mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop your photos here' : 'Upload photos'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop up to {maxFiles} photos, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: JPEG, PNG, WebP, GIF, BMP, TIFF (max 50MB each)
            </p>
          </div>
        ) : (
          <div>
            <div className="mx-auto w-12 h-12 mb-4 text-blue-500 animate-spin">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Uploading photos...
            </p>
            <p className="text-sm text-gray-500">
              {completedUploads} of {totalFiles} completed
              {failedUploads > 0 && `, ${failedUploads} failed`}
            </p>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
            <span className="text-sm text-gray-500">
              {completedUploads}/{totalFiles} completed
            </span>
          </div>
          
          {uploadProgress.map((progress) => (
            <div key={progress.photoId} className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {progress.fileName}
                </span>
                <div className="flex items-center space-x-2">
                  {progress.status === 'completed' && (
                    <div className="w-5 h-5 text-green-500">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  {progress.status === 'error' && (
                    <div className="w-5 h-5 text-red-500">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  {progress.status === 'uploading' && (
                    <div className="w-5 h-5 text-blue-500 animate-spin">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    {progress.status === 'completed' && 'Done'}
                    {progress.status === 'error' && 'Failed'}
                    {progress.status === 'uploading' && 'Uploading'}
                    {progress.status === 'processing' && 'Processing'}
                    {progress.status === 'pending' && 'Waiting'}
                  </span>
                </div>
              </div>
              
              {progress.status !== 'completed' && progress.status !== 'error' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
              
              {progress.error && (
                <p className="text-sm text-red-600 mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload summary */}
      {uploadProgress.length > 0 && !uploading && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Upload complete: {completedUploads} successful
              {failedUploads > 0 && `, ${failedUploads} failed`}
            </span>
            <button
              onClick={() => {
                setUploadProgress([]);
                setUploadedPhotos([]);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}