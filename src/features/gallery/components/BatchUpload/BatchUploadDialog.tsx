import React, { useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Trash2, 
  Upload,
  X,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useBatchUpload } from '../../hooks/useBatchUpload';
import { BatchUploadConfig } from '../../types';
import { BatchUploadArea } from './BatchUploadArea';
import { BatchUploadFileList } from './BatchUploadFileList';
import { BatchUploadProgress } from './BatchUploadProgress';

interface BatchUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  config?: Partial<BatchUploadConfig>;
  onUploadComplete?: (uploadedPhotos: any[]) => void;
}

export const BatchUploadDialog: React.FC<BatchUploadDialogProps> = ({
  isOpen,
  onClose,
  galleryId,
  config: userConfig = {},
  onUploadComplete
}) => {
  const [showFileList, setShowFileList] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    queue,
    addFiles,
    removeFile,
    removeAllFiles,
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
    config: userConfig,
    hooks: {
      onBatchComplete: (result) => {
        if (result.uploadedPhotos.length > 0) {
          onUploadComplete?.(result.uploadedPhotos);
        }
      }
    }
  });
  
  const handleClose = useCallback(() => {
    if (isUploading) {
      const confirmed = window.confirm(
        'Upload is in progress. Are you sure you want to close? This will cancel all pending uploads.'
      );
      if (!confirmed) {
        return;
      }
      cancelUpload();
    }
    onClose();
  }, [isUploading, cancelUpload, onClose]);
  
  const handleStartUpload = useCallback(async () => {
    try {
      await startUpload();
    } catch (error) {
      console.error('Failed to start upload:', error);
    }
  }, [startUpload]);
  
  const handleClearAll = useCallback(() => {
    const confirmed = window.confirm(
      'Are you sure you want to remove all files from the queue?'
    );
    if (confirmed) {
      removeAllFiles();
    }
  }, [removeAllFiles]);
  
  const hasFiles = queue.files.length > 0;
  const hasFailedFiles = queue.files.some(f => f.status === 'error');
  const hasCompletedFiles = queue.files.some(f => f.status === 'completed');
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=\"Batch Photo Upload\"
      size=\"large\"
      className=\"max-w-4xl\"
    >
      <div className=\"space-y-6\">
        {/* Upload Area */}
        {!hasFiles && (
          <BatchUploadArea
            onFilesSelected={addFiles}
            disabled={isUploading}
            maxFiles={queue.config.maxFiles}
            maxFileSize={queue.config.maxFileSize}
            acceptedTypes={queue.config.acceptedTypes}
          />
        )}
        
        {/* Progress Summary */}
        {hasFiles && (
          <BatchUploadProgress 
            progress={queue.progress}
            showDetails={true}
          />
        )}
        
        {/* Action Bar */}
        {hasFiles && (
          <div className=\"bg-slate-50 dark:bg-slate-800 rounded-lg p-4\">
            <div className=\"flex items-center justify-between flex-wrap gap-4\">
              {/* Left Actions */}
              <div className=\"flex items-center space-x-3\">
                {!isUploading && canUpload && (
                  <Button
                    onClick={handleStartUpload}
                    className=\"bg-orange-500 hover:bg-orange-600 text-white\"
                    disabled={!canUpload}
                  >
                    <Play className=\"w-4 h-4 mr-2\" />
                    Start Upload
                  </Button>
                )}
                
                {isUploading && !isPaused && (
                  <Button
                    onClick={pauseUpload}
                    variant=\"outline\"
                  >
                    <Pause className=\"w-4 h-4 mr-2\" />
                    Pause
                  </Button>
                )}
                
                {isUploading && isPaused && (
                  <Button
                    onClick={resumeUpload}
                    className=\"bg-orange-500 hover:bg-orange-600 text-white\"
                  >
                    <Play className=\"w-4 h-4 mr-2\" />
                    Resume
                  </Button>
                )}
                
                {isUploading && (
                  <Button
                    onClick={cancelUpload}
                    variant=\"outline\"
                    className=\"text-red-600 border-red-200 hover:bg-red-50\"
                  >
                    <Square className=\"w-4 h-4 mr-2\" />
                    Cancel
                  </Button>
                )}
                
                {hasFailedFiles && !isUploading && (
                  <Button
                    onClick={retryFailedFiles}
                    variant=\"outline\"
                    className=\"text-orange-600 border-orange-200 hover:bg-orange-50\"
                  >
                    <RotateCcw className=\"w-4 h-4 mr-2\" />
                    Retry Failed
                  </Button>
                )}
              </div>
              
              {/* Right Actions */}
              <div className=\"flex items-center space-x-3\">
                {!hasFiles && (
                  <Button
                    onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}
                    variant=\"outline\"
                  >
                    <Upload className=\"w-4 h-4 mr-2\" />
                    Add More Files
                  </Button>
                )}
                
                <Button
                  onClick={() => setShowFileList(!showFileList)}
                  variant=\"outline\"
                  size=\"sm\"
                >
                  {showFileList ? (
                    <>
                      <ChevronUp className=\"w-4 h-4 mr-1\" />
                      Hide Files
                    </>
                  ) : (
                    <>
                      <ChevronDown className=\"w-4 h-4 mr-1\" />
                      Show Files ({queue.files.length})
                    </>
                  )}
                </Button>
                
                {!isUploading && (
                  <Button
                    onClick={handleClearAll}
                    variant=\"outline\"
                    size=\"sm\"
                    className=\"text-red-600 border-red-200 hover:bg-red-50\"
                  >
                    <Trash2 className=\"w-4 h-4 mr-1\" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Additional Upload Area (when files exist) */}
        {hasFiles && (
          <div className=\"border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4\">
            <BatchUploadArea
              onFilesSelected={addFiles}
              disabled={isUploading}
              maxFiles={queue.config.maxFiles}
              maxFileSize={queue.config.maxFileSize}
              acceptedTypes={queue.config.acceptedTypes}
              className=\"border-0 p-4\"
            />
          </div>
        )}
        
        {/* File List */}
        {hasFiles && showFileList && (
          <div className=\"max-h-96 overflow-y-auto\">
            <div className=\"mb-4 flex items-center justify-between\">
              <h3 className=\"text-lg font-medium text-slate-900 dark:text-white\">
                Files ({queue.files.length})
              </h3>
            </div>
            
            <BatchUploadFileList
              files={queue.files}
              onRemoveFile={removeFile}
              onRetryFile={retryFile}
              showProgress={true}
              compact={false}
            />
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className=\"flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700\">
        <div className=\"text-sm text-slate-500 dark:text-slate-400\">
          {hasCompletedFiles && (
            <span className=\"text-green-600 dark:text-green-400\">
              {queue.progress.completedFiles} photo{queue.progress.completedFiles !== 1 ? 's' : ''} uploaded successfully
            </span>
          )}
        </div>
        
        <div className=\"flex items-center space-x-3\">
          <Button
            onClick={handleClose}
            variant=\"outline\"
          >
            {queue.progress.isComplete ? 'Close' : 'Cancel'}
          </Button>
          
          {queue.progress.isComplete && hasCompletedFiles && (
            <Button
              onClick={handleClose}
              className=\"bg-green-500 hover:bg-green-600 text-white\"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};