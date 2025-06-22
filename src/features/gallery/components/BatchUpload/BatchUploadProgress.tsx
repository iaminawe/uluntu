import React from 'react';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { BatchUploadProgress as ProgressType } from '../../types';

interface BatchUploadProgressProps {
  progress: ProgressType;
  className?: string;
  showDetails?: boolean;
}

export const BatchUploadProgress: React.FC<BatchUploadProgressProps> = ({
  progress,
  className = '',
  showDetails = true
}) => {
  const {
    totalFiles,
    completedFiles,
    failedFiles,
    overallProgress,
    currentlyUploading,
    isComplete,
    hasErrors
  } = progress;
  
  const pendingFiles = totalFiles - completedFiles - failedFiles;
  
  if (totalFiles === 0) {
    return null;
  }
  
  const getProgressColor = () => {
    if (isComplete) {
      return hasErrors ? 'bg-amber-500' : 'bg-green-500';
    }
    return 'bg-orange-500';
  };
  
  const getStatusIcon = () => {
    if (isComplete) {
      if (hasErrors) {
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      } else {
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      }
    }
    
    if (currentlyUploading > 0) {
      return <Loader2 className=\"w-5 h-5 text-orange-500 animate-spin\" />;
    }
    
    return <Clock className=\"w-5 h-5 text-slate-400\" />;
  };
  
  const getStatusText = () => {
    if (isComplete) {
      if (hasErrors) {
        if (completedFiles === 0) {
          return 'Upload failed';
        } else {
          return `Upload completed with ${failedFiles} error${failedFiles !== 1 ? 's' : ''}`;
        }
      } else {
        return 'Upload completed successfully';
      }
    }
    
    if (currentlyUploading > 0) {
      return `Uploading ${currentlyUploading} file${currentlyUploading !== 1 ? 's' : ''}...`;
    }
    
    return 'Ready to upload';
  };
  
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
      {/* Header */}
      <div className=\"flex items-center justify-between mb-4\">
        <div className=\"flex items-center space-x-3\">
          {getStatusIcon()}
          <div>
            <h3 className=\"font-medium text-slate-900 dark:text-white\">
              Upload Progress
            </h3>
            <p className=\"text-sm text-slate-600 dark:text-slate-400\">
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <div className=\"text-right\">
          <div className=\"text-lg font-semibold text-slate-900 dark:text-white\">
            {Math.round(overallProgress)}%
          </div>
          <div className=\"text-xs text-slate-500 dark:text-slate-400\">
            {completedFiles + failedFiles} of {totalFiles}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className=\"mb-4\">
        <div className=\"bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden\">
          <div className=\"h-full flex\">
            {/* Completed */}
            {completedFiles > 0 && (
              <div 
                className=\"bg-green-500 transition-all duration-300\"
                style={{ width: `${(completedFiles / totalFiles) * 100}%` }}
              />
            )}
            
            {/* Failed */}
            {failedFiles > 0 && (
              <div 
                className=\"bg-red-500 transition-all duration-300\"
                style={{ width: `${(failedFiles / totalFiles) * 100}%` }}
              />
            )}
            
            {/* Currently uploading (animated) */}
            {currentlyUploading > 0 && (
              <div 
                className=\"bg-orange-500 transition-all duration-300 relative overflow-hidden\"
                style={{ width: `${(currentlyUploading / totalFiles) * 100}%` }}
              >
                <div className=\"absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse\" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Details */}
      {showDetails && (
        <div className=\"grid grid-cols-2 sm:grid-cols-4 gap-4 text-center\">
          {/* Total Files */}
          <div>
            <div className=\"text-lg font-semibold text-slate-900 dark:text-white\">
              {totalFiles}
            </div>
            <div className=\"text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1\">
              <Upload className=\"w-3 h-3\" />
              <span>Total</span>
            </div>
          </div>
          
          {/* Completed */}
          <div>
            <div className=\"text-lg font-semibold text-green-600 dark:text-green-400\">
              {completedFiles}
            </div>
            <div className=\"text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1\">
              <CheckCircle className=\"w-3 h-3\" />
              <span>Completed</span>
            </div>
          </div>
          \n          {/* Failed */}
          <div>
            <div className=\"text-lg font-semibold text-red-600 dark:text-red-400\">
              {failedFiles}
            </div>
            <div className=\"text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1\">
              <XCircle className=\"w-3 h-3\" />
              <span>Failed</span>
            </div>
          </div>
          
          {/* Pending */}
          <div>
            <div className=\"text-lg font-semibold text-slate-600 dark:text-slate-400\">
              {pendingFiles}
            </div>
            <div className=\"text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1\">
              <Clock className=\"w-3 h-3\" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Summary */}
      {isComplete && completedFiles > 0 && (
        <div className=\"mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg\">
          <div className=\"flex items-center space-x-2\">
            <TrendingUp className=\"w-4 h-4 text-green-600 dark:text-green-400\" />
            <span className=\"text-sm font-medium text-green-800 dark:text-green-200\">
              {completedFiles} photo{completedFiles !== 1 ? 's' : ''} uploaded successfully
            </span>
          </div>
        </div>
      )}
      
      {/* Error Summary */}
      {isComplete && hasErrors && (
        <div className=\"mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg\">
          <div className=\"flex items-center space-x-2\">
            <AlertTriangle className=\"w-4 h-4 text-red-600 dark:text-red-400\" />
            <span className=\"text-sm font-medium text-red-800 dark:text-red-200\">
              {failedFiles} photo{failedFiles !== 1 ? 's' : ''} failed to upload
            </span>
          </div>
        </div>
      )}
    </div>
  );
};