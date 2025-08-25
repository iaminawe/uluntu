import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectUploadProgress,
  setUploadProgress,
  updateUploadProgress,
  updateUploadStatus,
  removeUploadProgress,
  clearAllUploadProgress
} from '@/features/gallery/store/galleryUISlice';
import {
  X,
  Upload,
  Image,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Folder,
  FileImage,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

interface BulkPhotoUploaderProps {
  galleryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FileWithPreview extends File {
  id: string;
  preview: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

const BulkPhotoUploader: React.FC<BulkPhotoUploaderProps> = ({
  galleryId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const uploadProgress = useAppSelector(selectUploadProgress);
  
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Configuration
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILES = 50;
  const CONCURRENT_UPLOADS = 3;

  // Upload photos mutation
  const uploadPhotosMutation = useMutation({
    mutationFn: async (fileData: { file: File; id: string }) => {
      const { file, id } = fileData;
      
      // Update status to uploading
      dispatch(updateUploadStatus({ photoId: id, status: 'uploading' }));
      
      // Simulate image processing (in real app, this would be done on the server)
      const processedImages = await processImage(file);
      
      const uploadInput = {
        file: file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        galleryId: galleryId,
        processedImages: processedImages,
        dimensions: {
          width: processedImages.dimensions?.width || 0,
          height: processedImages.dimensions?.height || 0,
          aspectRatio: processedImages.dimensions?.aspectRatio || 1
        },
        placeholder: processedImages.placeholder,
        dominantColor: processedImages.dominantColor
      };

      return galleryApi.uploadPhoto(uploadInput);
    },
    onSuccess: (data, variables) => {
      dispatch(updateUploadStatus({ photoId: variables.id, status: 'completed' }));
      setFiles(prev => prev.map(f => 
        f.id === variables.id 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));
    },
    onError: (error, variables) => {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      dispatch(updateUploadStatus({ 
        photoId: variables.id, 
        status: 'error',
        error: errorMessage 
      }));
      setFiles(prev => prev.map(f => 
        f.id === variables.id 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));
    }
  });

  // Process image to create variants and extract metadata
  const processImage = async (file: File): Promise<{
    processedImages?: {
      thumbnail?: File;
      small?: File;
      medium?: File;
      large?: File;
    };
    dimensions?: {
      width: number;
      height: number;
      aspectRatio: number;
    };
    placeholder?: string;
    dominantColor?: string;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        const { width, height } = img;
        const aspectRatio = width / height;
        
        // Create thumbnail
        const thumbSize = 200;
        const thumbWidth = width > height ? thumbSize : thumbSize * aspectRatio;
        const thumbHeight = height > width ? thumbSize : thumbSize / aspectRatio;
        
        canvas.width = thumbWidth;
        canvas.height = thumbHeight;
        ctx?.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
              type: file.type,
              lastModified: Date.now()
            });
            
            resolve({
              processedImages: {
                thumbnail: thumbnailFile
              },
              dimensions: {
                width,
                height,
                aspectRatio
              }
            });
          } else {
            resolve({
              dimensions: { width, height, aspectRatio }
            });
          }
        }, file.type, 0.8);
      };
      
      img.onerror = () => {
        resolve({});
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Update stats when files change
  useEffect(() => {
    const stats = files.reduce((acc, file) => {
      acc.total = files.length;
      switch (file.status) {
        case 'completed':
          acc.completed++;
          break;
        case 'error':
          acc.failed++;
          break;
        case 'uploading':
        case 'processing':
          acc.inProgress++;
          break;
      }
      return acc;
    }, { total: 0, completed: 0, failed: 0, inProgress: 0 });
    
    setUploadStats(stats);
  }, [files]);

  // File validation
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` };
    }
    
    return { isValid: true };
  };

  // Add files to upload queue
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];
    
    for (const file of newFiles) {
      // Check total file limit
      if (files.length + validFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        break;
      }
      
      // Check for duplicates
      const isDuplicate = files.some(f => f.name === file.name && f.size === file.size) ||
                         validFiles.some(f => f.name === file.name && f.size === file.size);
      
      if (isDuplicate) {
        errors.push(`${file.name} is already in the upload queue`);
        continue;
      }
      
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }
      
      // Create preview
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(file);
      
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id,
        preview,
        status: 'pending' as const,
        progress: 0
      });
      
      validFiles.push(fileWithPreview);
      
      // Add to Redux state
      dispatch(setUploadProgress({
        photoId: id,
        fileName: file.name,
        progress: 0,
        status: 'pending'
      }));
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
    
    if (errors.length > 0) {
      toast.error(`${errors.length} files had errors:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`);
    }
    
    if (validFiles.length > 0) {
      toast.success(`Added ${validFiles.length} files to upload queue`);
    }
  }, [files, dispatch]);

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
      // Reset input so same files can be selected again if needed
      e.target.value = '';
    }
  };

  // Remove file from queue
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
    dispatch(removeUploadProgress(fileId));
  };

  // Start upload process
  const startUpload = async () => {
    if (files.length === 0) {
      toast.error('No files to upload');
      return;
    }
    
    setIsUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    if (pendingFiles.length === 0) {
      toast.info('All files are already uploaded or in progress');
      setIsUploading(false);
      return;
    }
    
    // Process files in batches
    const batches: FileWithPreview[][] = [];
    for (let i = 0; i < pendingFiles.length; i += CONCURRENT_UPLOADS) {
      batches.push(pendingFiles.slice(i, i + CONCURRENT_UPLOADS));
    }
    
    try {
      for (const batch of batches) {
        const promises = batch.map(file => {
          // Update file status
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
          ));
          
          return uploadPhotosMutation.mutateAsync({ file, id: file.id });
        });
        
        await Promise.allSettled(promises);
      }
      
      toast.success('Upload process completed!');
      
      // Check if all files uploaded successfully
      const finalStats = files.reduce((acc, file) => {
        if (file.status === 'completed') acc.completed++;
        else if (file.status === 'error') acc.failed++;
        return acc;
      }, { completed: 0, failed: 0 });
      
      if (finalStats.failed === 0) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
      
    } catch (error) {
      toast.error('Upload process encountered errors');
    } finally {
      setIsUploading(false);
    }
  };

  // Retry failed uploads
  const retryFailed = () => {
    const failedFiles = files.filter(f => f.status === 'error');
    if (failedFiles.length === 0) return;
    
    // Reset failed files to pending
    setFiles(prev => prev.map(f => 
      f.status === 'error' 
        ? { ...f, status: 'pending', progress: 0, error: undefined }
        : f
    ));
    
    failedFiles.forEach(file => {
      dispatch(setUploadProgress({
        photoId: file.id,
        fileName: file.name,
        progress: 0,
        status: 'pending'
      }));
    });
    
    toast.info(`Reset ${failedFiles.length} failed uploads`);
  };

  // Clear completed files
  const clearCompleted = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    completedFiles.forEach(file => {
      URL.revokeObjectURL(file.preview);
      dispatch(removeUploadProgress(file.id));
    });
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
    toast.success(`Cleared ${completedFiles.length} completed uploads`);
  };

  // Close handler
  const handleClose = () => {
    if (isUploading) {
      if (confirm('Upload is in progress. Are you sure you want to close?')) {
        // Clean up
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles([]);
        dispatch(clearAllUploadProgress());
        onClose();
      }
    } else {
      // Clean up
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      dispatch(clearAllUploadProgress());
      onClose();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Photo Upload
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upload multiple photos to your gallery
              </p>
            </div>
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Summary */}
          {files.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total: <span className="font-medium">{uploadStats.total}</span>
                  </span>
                  <span className="text-green-600">
                    Completed: <span className="font-medium">{uploadStats.completed}</span>
                  </span>
                  {uploadStats.failed > 0 && (
                    <span className="text-red-600">
                      Failed: <span className="font-medium">{uploadStats.failed}</span>
                    </span>
                  )}
                  {uploadStats.inProgress > 0 && (
                    <span className="text-blue-600">
                      In Progress: <span className="font-medium">{uploadStats.inProgress}</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {uploadStats.failed > 0 && (
                    <Button variant="outline" size="sm" onClick={retryFailed}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry Failed
                    </Button>
                  )}
                  {uploadStats.completed > 0 && (
                    <Button variant="outline" size="sm" onClick={clearCompleted}>
                      Clear Completed
                    </Button>
                  )}
                </div>
              </div>
              {uploadStats.total > 0 && (
                <Progress 
                  value={(uploadStats.completed / uploadStats.total) * 100} 
                  className="h-2"
                />
              )}
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {files.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div
                className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Support JPEG, PNG, GIF, WebP up to {MAX_FILE_SIZE / (1024 * 1024)}MB each
                  <br />
                  Maximum {MAX_FILES} files
                </p>
                <Button className="mt-4">
                  <Folder className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {file.status === 'completed' && (
                        <Badge variant="default" className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <Badge variant="secondary">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          {file.status === 'uploading' ? 'Upload' : 'Process'}
                        </Badge>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 left-2 z-10 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading' || file.status === 'processing'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                    {/* Preview Image */}
                    <div className="aspect-square bg-gray-200 dark:bg-gray-600">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Progress Bar */}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50">
                        <Progress value={file.progress} className="h-1" />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                      {file.error && (
                        <p className="text-xs text-red-600 mt-1 line-clamp-2">
                          {file.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add More Button */}
                <div
                  className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileImage className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Add More
                    <br />
                    Files
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {files.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
            <div className="flex justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {files.length} files ready • {uploadStats.completed} completed • {uploadStats.failed} failed
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isUploading}
                >
                  {uploadStats.completed > 0 && uploadStats.failed === 0 ? 'Done' : 'Cancel'}
                </Button>
                <Button
                  onClick={startUpload}
                  disabled={isUploading || files.filter(f => f.status === 'pending' || f.status === 'error').length === 0}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkPhotoUploader;