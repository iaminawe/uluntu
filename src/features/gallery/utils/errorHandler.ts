import { toast } from 'react-hot-toast';

export interface GalleryError {
  code: string;
  message: string;
  details?: string;
  userMessage?: string;
  retry?: boolean;
  recoverable?: boolean;
}

export type ErrorContext = 
  | 'UPLOAD'
  | 'BATCH_UPLOAD'
  | 'GALLERY_LOAD'
  | 'PHOTO_LOAD'
  | 'DELETE'
  | 'LIKE'
  | 'VALIDATION'
  | 'NETWORK'
  | 'PERMISSION'
  | 'STORAGE';

// Error code mappings with user-friendly messages
const ERROR_MESSAGES: Record<string, Partial<GalleryError>> = {
  // Network errors
  'NETWORK_ERROR': {
    userMessage: 'Unable to connect to the server. Please check your internet connection.',
    retry: true,
    recoverable: true
  },
  'TIMEOUT_ERROR': {
    userMessage: 'The request took too long. Please try again.',
    retry: true,
    recoverable: true
  },
  'SERVER_ERROR': {
    userMessage: 'Server error occurred. Please try again later.',
    retry: true,
    recoverable: true
  },

  // Authentication/Permission errors
  'UNAUTHORIZED': {
    userMessage: 'You need to sign in to perform this action.',
    retry: false,
    recoverable: true
  },
  'FORBIDDEN': {
    userMessage: 'You don\'t have permission to perform this action.',
    retry: false,
    recoverable: false
  },
  'SESSION_EXPIRED': {
    userMessage: 'Your session has expired. Please sign in again.',
    retry: false,
    recoverable: true
  },

  // Validation errors
  'FILE_TOO_LARGE': {
    userMessage: 'File is too large. Please choose a smaller file.',
    retry: false,
    recoverable: true
  },
  'INVALID_FILE_TYPE': {
    userMessage: 'Invalid file type. Please select a valid image file.',
    retry: false,
    recoverable: true
  },
  'TOO_MANY_FILES': {
    userMessage: 'Too many files selected. Please reduce the number of files.',
    retry: false,
    recoverable: true
  },
  'DUPLICATE_FILES': {
    userMessage: 'Some files have the same name. Please rename them.',
    retry: false,
    recoverable: true
  },

  // Upload errors
  'UPLOAD_FAILED': {
    userMessage: 'Upload failed. Please try again.',
    retry: true,
    recoverable: true
  },
  'PROCESSING_FAILED': {
    userMessage: 'Image processing failed. The original image will be used.',
    retry: false,
    recoverable: true
  },
  'STORAGE_QUOTA_EXCEEDED': {
    userMessage: 'Storage quota exceeded. Please delete some files or upgrade your plan.',
    retry: false,
    recoverable: false
  },

  // Gallery/Photo errors
  'GALLERY_NOT_FOUND': {
    userMessage: 'Gallery not found or no longer available.',
    retry: false,
    recoverable: false
  },
  'PHOTO_NOT_FOUND': {
    userMessage: 'Photo not found or no longer available.',
    retry: false,
    recoverable: false
  },
  'DELETE_FAILED': {
    userMessage: 'Failed to delete. Please try again.',
    retry: true,
    recoverable: true
  },

  // Generic errors
  'UNKNOWN_ERROR': {
    userMessage: 'An unexpected error occurred. Please try again.',
    retry: true,
    recoverable: true
  }
};

/**
 * Enhanced error handler for gallery operations
 */
export class GalleryErrorHandler {
  /**
   * Parse and enhance error information
   */
  static parseError(error: any, context?: ErrorContext): GalleryError {
    let code = 'UNKNOWN_ERROR';
    let message = error?.message || 'Unknown error';
    let details = '';

    // Parse different error types
    if (error?.code) {
      code = error.code;
    } else if (error?.name) {
      switch (error.name) {
        case 'NetworkError':
        case 'TypeError':
          code = 'NETWORK_ERROR';
          break;
        case 'TimeoutError':
          code = 'TIMEOUT_ERROR';
          break;
        case 'AbortError':
          code = 'UPLOAD_CANCELLED';
          break;
        default:
          code = 'UNKNOWN_ERROR';
      }
    } else if (error?.status) {
      switch (error.status) {
        case 401:
          code = 'UNAUTHORIZED';
          break;
        case 403:
          code = 'FORBIDDEN';
          break;
        case 404:
          code = context === 'GALLERY_LOAD' ? 'GALLERY_NOT_FOUND' : 'PHOTO_NOT_FOUND';
          break;
        case 413:
          code = 'FILE_TOO_LARGE';
          break;
        case 422:
          code = 'INVALID_FILE_TYPE';
          break;
        case 429:
          code = 'RATE_LIMITED';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          code = 'SERVER_ERROR';
          break;
        default:
          code = 'UNKNOWN_ERROR';
      }
    }

    // Context-specific error handling
    if (context) {
      switch (context) {
        case 'UPLOAD':
        case 'BATCH_UPLOAD':
          if (message.includes('quota')) {
            code = 'STORAGE_QUOTA_EXCEEDED';
          } else if (message.includes('size')) {
            code = 'FILE_TOO_LARGE';
          } else if (message.includes('type')) {
            code = 'INVALID_FILE_TYPE';
          }
          break;
        case 'VALIDATION':
          if (message.includes('files')) {
            code = 'TOO_MANY_FILES';
          } else if (message.includes('duplicate')) {
            code = 'DUPLICATE_FILES';
          }
          break;
      }
    }

    // Get error metadata
    const errorConfig = ERROR_MESSAGES[code] || ERROR_MESSAGES['UNKNOWN_ERROR'];

    return {
      code,
      message,
      details: error?.stack || error?.details || '',
      userMessage: errorConfig.userMessage || message,
      retry: errorConfig.retry || false,
      recoverable: errorConfig.recoverable || false
    };
  }

  /**
   * Show user-friendly error notification
   */
  static showError(error: GalleryError | any, context?: ErrorContext): GalleryError {
    const parsedError = error.code ? error : this.parseError(error, context);

    // Show appropriate toast notification
    if (parsedError.retry) {
      toast.error(parsedError.userMessage!, {
        duration: 5000,
        icon: '🔄',
      });
    } else if (parsedError.recoverable) {
      toast.error(parsedError.userMessage!, {
        duration: 6000,
        icon: '⚠️',
      });
    } else {
      toast.error(parsedError.userMessage!, {
        duration: 8000,
        icon: '❌',
      });
    }

    return parsedError;
  }

  /**
   * Show success notification
   */
  static showSuccess(message: string, options?: { duration?: number; icon?: string }) {
    toast.success(message, {
      duration: options?.duration || 3000,
      icon: options?.icon || '✅',
    });
  }

  /**
   * Show info notification
   */
  static showInfo(message: string, options?: { duration?: number; icon?: string }) {
    toast(message, {
      duration: options?.duration || 4000,
      icon: options?.icon || 'ℹ️',
    });
  }

  /**
   * Show warning notification
   */
  static showWarning(message: string, options?: { duration?: number; icon?: string }) {
    toast(message, {
      duration: options?.duration || 5000,
      icon: options?.icon || '⚠️',
      style: {
        background: '#fef3c7',
        color: '#92400e',
      },
    });
  }

  /**
   * Create retry function for recoverable errors
   */
  static createRetryHandler(
    originalFunction: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ) {
    let retryCount = 0;

    const retry = async (): Promise<any> => {
      try {
        return await originalFunction();
      } catch (error) {
        const parsedError = this.parseError(error);
        
        if (parsedError.retry && retryCount < maxRetries) {
          retryCount++;
          this.showWarning(`Retrying... (${retryCount}/${maxRetries})`, {
            duration: 2000,
            icon: '🔄'
          });
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retryCount - 1)));
          return retry();
        } else {
          throw error;
        }
      }
    };

    return retry;
  }

  /**
   * Handle batch operation errors
   */
  static handleBatchErrors(
    results: { success: any[]; failed: Array<{ error: string; [key: string]: any }> },
    context: ErrorContext = 'BATCH_UPLOAD'
  ) {
    const { success, failed } = results;
    
    if (success.length > 0) {
      this.showSuccess(
        `${success.length} item${success.length !== 1 ? 's' : ''} processed successfully`
      );
    }

    if (failed.length > 0) {
      const errorCounts: Record<string, number> = {};
      
      failed.forEach(item => {
        const error = this.parseError(item.error, context);
        errorCounts[error.code] = (errorCounts[error.code] || 0) + 1;
      });

      // Show summary of errors
      const errorMessages = Object.entries(errorCounts).map(([code, count]) => {
        const errorConfig = ERROR_MESSAGES[code] || ERROR_MESSAGES['UNKNOWN_ERROR'];
        return `${count} ${errorConfig.userMessage}`;
      });

      this.showError({
        code: 'BATCH_ERROR',
        message: `${failed.length} items failed`,
        userMessage: `Failed to process ${failed.length} item${failed.length !== 1 ? 's' : ''}:\n${errorMessages.join('\n')}`,
        retry: true,
        recoverable: true
      });
    }
  }

  /**
   * Check if an error is due to network issues
   */
  static isNetworkError(error: any): boolean {
    const parsedError = this.parseError(error);
    return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'].includes(parsedError.code);
  }

  /**
   * Check if an error is recoverable
   */
  static isRecoverable(error: any): boolean {
    const parsedError = this.parseError(error);
    return parsedError.recoverable || false;
  }

  /**
   * Check if an error supports retry
   */
  static canRetry(error: any): boolean {
    const parsedError = this.parseError(error);
    return parsedError.retry || false;
  }
}

// Export convenience functions
export const {
  parseError,
  showError,
  showSuccess,
  showInfo,
  showWarning,
  createRetryHandler,
  handleBatchErrors,
  isNetworkError,
  isRecoverable,
  canRetry
} = GalleryErrorHandler;