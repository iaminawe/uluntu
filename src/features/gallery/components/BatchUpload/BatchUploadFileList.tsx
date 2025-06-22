import React from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Pause, 
  Play,
  AlertTriangle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { BatchUploadFile } from '../../types';
import { formatFileSize } from '../../utils/fileValidation';

interface BatchUploadFileListProps {
  files: BatchUploadFile[];
  onRemoveFile: (fileId: string) => void;
  onRetryFile: (fileId: string) => void;
  showProgress?: boolean;
  compact?: boolean;
}

interface FileItemProps {
  file: BatchUploadFile;
  onRemove: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  showProgress: boolean;
  compact: boolean;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onRemove,
  onRetry,
  showProgress,
  compact
}) => {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'pending':
        return <div className=\"w-5 h-5 border-2 border-slate-300 rounded-full\" />;
      case 'validating':
        return <Loader2 className=\"w-5 h-5 text-blue-500 animate-spin\" />;
      case 'uploading':
        return <Loader2 className=\"w-5 h-5 text-orange-500 animate-spin\" />;
      case 'processing':
        return <Loader2 className=\"w-5 h-5 text-purple-500 animate-spin\" />;
      case 'completed':
        return <CheckCircle className=\"w-5 h-5 text-green-500\" />;
      case 'error':
        return <XCircle className=\"w-5 h-5 text-red-500\" />;
      case 'cancelled':
        return <XCircle className=\"w-5 h-5 text-slate-400\" />;
      default:
        return <div className=\"w-5 h-5 border-2 border-slate-300 rounded-full\" />;
    }
  };
  
  const getStatusText = () => {
    switch (file.status) {
      case 'pending':
        return 'Pending';
      case 'validating':
        return 'Validating...';
      case 'uploading':
        return `Uploading... ${file.progress}%`;
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusColor = () => {
    switch (file.status) {
      case 'pending':
        return 'text-slate-600 dark:text-slate-400';
      case 'validating':
        return 'text-blue-600 dark:text-blue-400';
      case 'uploading':
        return 'text-orange-600 dark:text-orange-400';
      case 'processing':
        return 'text-purple-600 dark:text-purple-400';
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'cancelled':
        return 'text-slate-500 dark:text-slate-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };
  
  if (compact) {
    return (
      <div className=\"flex items-center space-x-3 p-2 bg-white dark:bg-slate-800 rounded border\">
        {/* Status Icon */}
        {getStatusIcon()}
        
        {/* File Info */}
        <div className=\"flex-1 min-w-0\">
          <div className=\"truncate text-sm font-medium text-slate-900 dark:text-white\">
            {file.name}
          </div>
          <div className={`text-xs ${getStatusColor()}`}>
            {getStatusText()} • {formatFileSize(file.size)}
          </div>
        </div>
        
        {/* Progress Bar */}
        {showProgress && file.status === 'uploading' && (
          <div className=\"w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5\">
            <div 
              className=\"bg-orange-500 h-1.5 rounded-full transition-all duration-300\"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
        
        {/* Actions */}
        <div className=\"flex items-center space-x-1\">
          {file.status === 'error' && (
            <button
              onClick={() => onRetry(file.id)}
              className=\"p-1 text-slate-400 hover:text-orange-500 transition-colors\"
              title=\"Retry upload\"
            >
              <RotateCcw className=\"w-4 h-4\" />
            </button>
          )}
          
          {file.status !== 'uploading' && file.status !== 'processing' && (
            <button
              onClick={() => onRemove(file.id)}
              className=\"p-1 text-slate-400 hover:text-red-500 transition-colors\"
              title=\"Remove file\"
            >
              <X className=\"w-4 h-4\" />
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className=\"p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700\">
      <div className=\"flex items-start space-x-4\">
        {/* Preview */}
        <div className=\"flex-shrink-0\">
          {file.preview ? (
            <img
              src={file.preview}
              alt={file.name}
              className=\"w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-600\"
            />
          ) : (
            <div className=\"w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center\">
              <ImageIcon className=\"w-6 h-6 text-slate-400\" />
            </div>
          )}
        </div>
        
        {/* File Info */}
        <div className=\"flex-1 min-w-0\">
          <div className=\"flex items-start justify-between\">
            <div className=\"flex-1 min-w-0\">
              <h4 className=\"text-sm font-medium text-slate-900 dark:text-white truncate\">
                {file.name}
              </h4>
              <div className=\"flex items-center space-x-2 mt-1\">
                <span className=\"text-xs text-slate-500 dark:text-slate-400\">
                  {formatFileSize(file.size)}
                </span>
                {file.metadata && (
                  <>
                    <span className=\"text-slate-300 dark:text-slate-600\">•</span>
                    <span className=\"text-xs text-slate-500 dark:text-slate-400\">
                      {file.metadata.width} × {file.metadata.height}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className=\"flex items-center space-x-1 ml-2\">
              {file.status === 'error' && (
                <button
                  onClick={() => onRetry(file.id)}
                  className=\"p-1.5 text-slate-400 hover:text-orange-500 transition-colors rounded\"
                  title=\"Retry upload\"
                >
                  <RotateCcw className=\"w-4 h-4\" />
                </button>
              )}
              
              {file.status !== 'uploading' && file.status !== 'processing' && (
                <button
                  onClick={() => onRemove(file.id)}
                  className=\"p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded\"
                  title=\"Remove file\"
                >
                  <X className=\"w-4 h-4\" />
                </button>
              )}
            </div>
          </div>
          
          {/* Status */}
          <div className=\"flex items-center space-x-2 mt-2\">
            {getStatusIcon()}
            <span className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          {/* Progress Bar */}
          {showProgress && (file.status === 'uploading' || file.status === 'processing') && (
            <div className=\"mt-3\">
              <div className=\"bg-slate-200 dark:bg-slate-700 rounded-full h-2\">
                <div 
                  className=\"bg-orange-500 h-2 rounded-full transition-all duration-300\"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {file.status === 'error' && file.error && (
            <div className=\"mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded\">
              <div className=\"flex items-start space-x-2\">
                <AlertTriangle className=\"w-4 h-4 text-red-500 flex-shrink-0 mt-0.5\" />
                <span className=\"text-sm text-red-700 dark:text-red-300\">
                  {file.error}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BatchUploadFileList: React.FC<BatchUploadFileListProps> = ({
  files,
  onRemoveFile,
  onRetryFile,
  showProgress = true,
  compact = false
}) => {
  if (files.length === 0) {
    return null;
  }
  
  const groupedFiles = {
    pending: files.filter(f => f.status === 'pending'),
    active: files.filter(f => ['validating', 'uploading', 'processing'].includes(f.status)),
    completed: files.filter(f => f.status === 'completed'),
    failed: files.filter(f => f.status === 'error'),
    cancelled: files.filter(f => f.status === 'cancelled')
  };
  
  const FileGroup: React.FC<{ title: string; files: BatchUploadFile[]; count?: number }> = ({ 
    title, 
    files: groupFiles, 
    count 
  }) => {
    if (groupFiles.length === 0) return null;
    
    return (
      <div>
        <h4 className=\"text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between\">
          <span>{title}</span>
          <span className=\"text-xs text-slate-500 dark:text-slate-400\">
            {count !== undefined ? count : groupFiles.length}
          </span>
        </h4>
        <div className={`space-y-${compact ? '2' : '3'}`}>
          {groupFiles.map(file => (
            <FileItem
              key={file.id}
              file={file}
              onRemove={onRemoveFile}
              onRetry={onRetryFile}
              showProgress={showProgress}
              compact={compact}
            />
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className=\"space-y-6\">
      <FileGroup title=\"In Progress\" files={groupedFiles.active} />
      <FileGroup title=\"Pending\" files={groupedFiles.pending} />
      <FileGroup title=\"Failed\" files={groupedFiles.failed} />
      <FileGroup title=\"Completed\" files={groupedFiles.completed} />
      {groupedFiles.cancelled.length > 0 && (
        <FileGroup title=\"Cancelled\" files={groupedFiles.cancelled} />
      )}
    </div>
  );
};