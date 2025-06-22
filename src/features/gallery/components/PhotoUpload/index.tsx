import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { usePhotoDragDrop } from '../../hooks/useGallery';
import { validateImageFile, formatFileSize, generateThumbnail } from '../../utils';
import { PhotoUploadInput } from '../../types';

interface PhotoUploadProps {
  galleryId?: string;
  onUpload: (inputs: PhotoUploadInput[]) => void;
  maxFiles?: number;
  isUploading?: boolean;
}

interface QueuedFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  tags: string[];
  error?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  galleryId,
  onUpload,
  maxFiles = 10,
  isUploading = false
}) => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[]) => {
    const validFiles: QueuedFile[] = [];
    
    for (const file of files.slice(0, maxFiles - queuedFiles.length)) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        try {
          const preview = await generateThumbnail(file);
          validFiles.push({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview,
            title: file.name.replace(/\.[^/.]+$/, ''),
            description: '',
            tags: [],
          });
        } catch (error) {
          console.error('Error generating thumbnail:', error);
        }
      } else {
        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: '',
          title: file.name,
          description: '',
          tags: [],
          error: validation.error
        });
      }
    }
    
    setQueuedFiles(prev => [...prev, ...validFiles]);
  };

  const { handleDragOver, handleDrop } = usePhotoDragDrop(processFiles);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    setQueuedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const updateFile = (id: string, updates: Partial<QueuedFile>) => {
    setQueuedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const handleUpload = () => {
    const validFiles = queuedFiles.filter(f => !f.error);
    const inputs: PhotoUploadInput[] = validFiles.map(f => ({
      file: f.file,
      title: f.title,
      description: f.description,
      tags: f.tags,
      galleryId
    }));
    
    onUpload(inputs);
    
    // Clear queue after upload starts
    setTimeout(() => {
      queuedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setQueuedFiles([]);
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        }`}
        onDragOver={(e) => {
          handleDragOver(e);
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          handleDrop(e);
          setIsDragging(false);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
          {isDragging ? 'Drop photos here' : 'Drag and drop photos here'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          or click to select up to {maxFiles} photos
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || queuedFiles.length >= maxFiles}
        >
          Select Photos
        </Button>
      </div>

      {/* Queued files */}
      {queuedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Ready to upload ({queuedFiles.filter(f => !f.error).length} photos)
            </h3>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                queuedFiles.forEach(f => {
                  if (f.preview) URL.revokeObjectURL(f.preview);
                });
                setQueuedFiles([]);
              }}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {queuedFiles.map(file => (
              <div
                key={file.id}
                className={`flex gap-4 p-3 rounded-lg border ${
                  file.error
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                {/* Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  {file.error ? (
                    <div className="space-y-1">
                      <p className="font-medium text-red-700 dark:text-red-300">{file.file.name}</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{file.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) => updateFile(file.id, { title: e.target.value })}
                        placeholder="Photo title"
                        className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatFileSize(file.file.size)}</span>
                        <span>•</span>
                        <span>{file.file.type}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload button */}
          {queuedFiles.some(f => !f.error) && (
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;