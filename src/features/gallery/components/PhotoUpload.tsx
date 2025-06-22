import React, { useState } from 'react';
import { Upload, Layers } from 'lucide-react';
import { BatchUploadDialog } from './BatchUpload';

interface PhotoUploadProps {
  onUpload?: (files: File[]) => void;
  onBatchUpload?: (photos: any[]) => void;
  galleryId?: string;
  disabled?: boolean;
  maxFiles?: number;
  showBatchUpload?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onUpload,
  onBatchUpload,
  galleryId,
  disabled = false,
  maxFiles = 10,
  showBatchUpload = true
}) => {
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onUpload?.(files.slice(0, maxFiles));
    }
  };
  
  const handleBatchUploadComplete = (uploadedPhotos: any[]) => {
    onBatchUpload?.(uploadedPhotos);
    setShowBatchDialog(false);
  };

  return (
    <>
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-orange-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Upload Photos
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {showBatchUpload 
                ? 'Choose single or batch upload method'
                : 'Drag and drop photos here, or click to select files'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
                className="sr-only"
              />
              <span className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                {showBatchUpload ? 'Quick Upload' : 'Choose Photos'}
              </span>
            </label>
            
            {showBatchUpload && galleryId && (
              <button
                onClick={() => setShowBatchDialog(true)}
                disabled={disabled}
                className="inline-flex items-center px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Layers className="w-4 h-4 mr-2" />
                Batch Upload
              </button>
            )}
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {showBatchUpload 
              ? `Quick upload: Up to ${maxFiles} photos • Batch upload: Advanced features with progress tracking`
              : `Maximum ${maxFiles} photos. Supported formats: JPG, PNG, WebP`
            }
          </p>
        </div>
      </div>
      
      {/* Batch Upload Dialog */}
      {showBatchUpload && galleryId && (
        <BatchUploadDialog
          isOpen={showBatchDialog}
          onClose={() => setShowBatchDialog(false)}
          galleryId={galleryId}
          onUploadComplete={handleBatchUploadComplete}
        />
      )}
    </>
  );
};