/**
 * Error Message Sanitization Utility
 * 
 * This utility provides functions to sanitize error messages before displaying
 * them to users, removing sensitive internal information while preserving
 * user-actionable error details.
 */

// Browser-compatible UUID generation
const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Error codes for debugging while keeping user messages generic
export enum ErrorCode {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_EMAIL_NOT_CONFIRMED = 'AUTH_002',
  AUTH_SERVICE_UNAVAILABLE = 'AUTH_003',
  AUTH_SESSION_EXPIRED = 'AUTH_004',
  AUTH_RATE_LIMITED = 'AUTH_005',
  
  // Database Errors
  DB_CONNECTION_FAILED = 'DB_001',
  DB_QUERY_TIMEOUT = 'DB_002',
  DB_CONSTRAINT_VIOLATION = 'DB_003',
  DB_RECORD_NOT_FOUND = 'DB_004',
  DB_PERMISSION_DENIED = 'DB_005',
  
  // File Upload Errors
  UPLOAD_FILE_TOO_LARGE = 'UPLOAD_001',
  UPLOAD_INVALID_TYPE = 'UPLOAD_002',
  UPLOAD_STORAGE_FULL = 'UPLOAD_003',
  UPLOAD_NETWORK_ERROR = 'UPLOAD_004',
  
  // API Errors
  API_INVALID_REQUEST = 'API_001',
  API_RATE_LIMITED = 'API_002',
  API_SERVICE_UNAVAILABLE = 'API_003',
  API_TIMEOUT = 'API_004',
  
  // Validation Errors
  VALIDATION_REQUIRED_FIELD = 'VAL_001',
  VALIDATION_INVALID_FORMAT = 'VAL_002',
  VALIDATION_LENGTH_EXCEEDED = 'VAL_003',
  
  // Generic Errors
  GENERIC_UNKNOWN = 'GEN_001',
  GENERIC_NETWORK = 'GEN_002',
  GENERIC_PERMISSION = 'GEN_003'
}

export interface SanitizedError {
  userMessage: string;
  errorCode: ErrorCode;
  debugId: string;
  timestamp: string;
}

interface ErrorPattern {
  pattern: RegExp | string;
  errorCode: ErrorCode;
  userMessage: string;
}

// Patterns to match against raw error messages
const ERROR_PATTERNS: ErrorPattern[] = [
  // Authentication patterns
  {
    pattern: /invalid login credentials|authentication failed|wrong password/i,
    errorCode: ErrorCode.AUTH_INVALID_CREDENTIALS,
    userMessage: 'Invalid email or password. Please check your credentials and try again.'
  },
  {
    pattern: /email not confirmed|account not verified/i,
    errorCode: ErrorCode.AUTH_EMAIL_NOT_CONFIRMED,
    userMessage: 'Please verify your email address before signing in.'
  },
  {
    pattern: /authentication service|auth.*unavailable|unexpected_failure/i,
    errorCode: ErrorCode.AUTH_SERVICE_UNAVAILABLE,
    userMessage: 'Authentication service is temporarily unavailable. Please try again later.'
  },
  {
    pattern: /session.*expired|token.*invalid|jwt.*expired/i,
    errorCode: ErrorCode.AUTH_SESSION_EXPIRED,
    userMessage: 'Your session has expired. Please sign in again.'
  },
  {
    pattern: /too many.*requests|rate.*limit/i,
    errorCode: ErrorCode.AUTH_RATE_LIMITED,
    userMessage: 'Too many sign-in attempts. Please wait a few minutes before trying again.'
  },
  
  // Database patterns
  {
    pattern: /connection.*refused|connection.*timeout|database.*unavailable/i,
    errorCode: ErrorCode.DB_CONNECTION_FAILED,
    userMessage: 'Database service is temporarily unavailable. Please try again later.'
  },
  {
    pattern: /query.*timeout|statement.*timeout/i,
    errorCode: ErrorCode.DB_QUERY_TIMEOUT,
    userMessage: 'The request is taking too long to process. Please try again.'
  },
  {
    pattern: /constraint.*violation|unique.*constraint|foreign.*key/i,
    errorCode: ErrorCode.DB_CONSTRAINT_VIOLATION,
    userMessage: 'This action cannot be completed due to data conflicts. Please check your input.'
  },
  {
    pattern: /not found|no.*rows|PGRST116/i,
    errorCode: ErrorCode.DB_RECORD_NOT_FOUND,
    userMessage: 'The requested item could not be found.'
  },
  {
    pattern: /permission.*denied|access.*denied|insufficient.*privileges/i,
    errorCode: ErrorCode.DB_PERMISSION_DENIED,
    userMessage: 'You do not have permission to perform this action.'
  },
  
  // File upload patterns
  {
    pattern: /file.*too.*large|size.*exceeds|payload.*too.*large/i,
    errorCode: ErrorCode.UPLOAD_FILE_TOO_LARGE,
    userMessage: 'The file is too large. Please choose a smaller file.'
  },
  {
    pattern: /invalid.*file.*type|unsupported.*format|mime.*type/i,
    errorCode: ErrorCode.UPLOAD_INVALID_TYPE,
    userMessage: 'This file type is not supported. Please choose a different file.'
  },
  {
    pattern: /storage.*full|quota.*exceeded/i,
    errorCode: ErrorCode.UPLOAD_STORAGE_FULL,
    userMessage: 'Storage limit reached. Please delete some files or contact support.'
  },
  
  // API patterns
  {
    pattern: /400|bad.*request|invalid.*request/i,
    errorCode: ErrorCode.API_INVALID_REQUEST,
    userMessage: 'Invalid request. Please check your input and try again.'
  },
  {
    pattern: /429|rate.*limit/i,
    errorCode: ErrorCode.API_RATE_LIMITED,
    userMessage: 'Too many requests. Please wait a moment before trying again.'
  },
  {
    pattern: /503|service.*unavailable|server.*error/i,
    errorCode: ErrorCode.API_SERVICE_UNAVAILABLE,
    userMessage: 'Service is temporarily unavailable. Please try again later.'
  },
  {
    pattern: /timeout|request.*timeout/i,
    errorCode: ErrorCode.API_TIMEOUT,
    userMessage: 'Request timed out. Please try again.'
  },
  
  // Network patterns
  {
    pattern: /network.*error|fetch.*failed|connection.*lost/i,
    errorCode: ErrorCode.GENERIC_NETWORK,
    userMessage: 'Network connection error. Please check your internet connection and try again.'
  }
];

/**
 * Sanitizes an error message for user display
 */
export function sanitizeError(error: unknown): SanitizedError {
  const debugId = generateUUID();
  const timestamp = new Date().toISOString();
  
  let rawMessage = '';
  
  // Extract error message from different error types
  if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'string') {
    rawMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    rawMessage = String((error as any).message);
  } else {
    rawMessage = 'Unknown error';
  }
  
  // Find matching pattern
  for (const { pattern, errorCode, userMessage } of ERROR_PATTERNS) {
    if (pattern instanceof RegExp && pattern.test(rawMessage)) {
      return {
        userMessage,
        errorCode,
        debugId,
        timestamp
      };
    } else if (typeof pattern === 'string' && rawMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return {
        userMessage,
        errorCode,
        debugId,
        timestamp
      };
    }
  }
  
  // Default fallback for unmatched errors
  return {
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    errorCode: ErrorCode.GENERIC_UNKNOWN,
    debugId,
    timestamp
  };
}

/**
 * Logs error details for debugging while showing sanitized message to user
 */
export function logAndSanitizeError(error: unknown, context?: string): SanitizedError {
  const sanitized = sanitizeError(error);
  
  // Log full error details for debugging (server-side only in production)
  if (process.env.NODE_ENV === 'development' || typeof window === 'undefined') {
    console.error('[ERROR]', {
      debugId: sanitized.debugId,
      timestamp: sanitized.timestamp,
      context: context || 'Unknown',
      errorCode: sanitized.errorCode,
      userMessage: sanitized.userMessage,
      originalError: error
    });
  } else {
    // In production client-side, only log minimal info
    console.error('[ERROR]', {
      debugId: sanitized.debugId,
      errorCode: sanitized.errorCode,
      context: context || 'Unknown'
    });
  }
  
  return sanitized;
}

/**
 * Creates a user-friendly error message for form validation
 */
export function createValidationError(field: string, type: 'required' | 'invalid' | 'length'): SanitizedError {
  const debugId = generateUUID();
  const timestamp = new Date().toISOString();
  
  let userMessage = '';
  let errorCode = ErrorCode.VALIDATION_REQUIRED_FIELD;
  
  switch (type) {
    case 'required':
      userMessage = `${field} is required.`;
      errorCode = ErrorCode.VALIDATION_REQUIRED_FIELD;
      break;
    case 'invalid':
      userMessage = `Please enter a valid ${field.toLowerCase()}.`;
      errorCode = ErrorCode.VALIDATION_INVALID_FORMAT;
      break;
    case 'length':
      userMessage = `${field} is too long.`;
      errorCode = ErrorCode.VALIDATION_LENGTH_EXCEEDED;
      break;
  }
  
  return {
    userMessage,
    errorCode,
    debugId,
    timestamp
  };
}

/**
 * Check if error should be retried automatically
 */
export function isRetryableError(error: SanitizedError): boolean {
  const retryableCodes = [
    ErrorCode.API_TIMEOUT,
    ErrorCode.API_SERVICE_UNAVAILABLE,
    ErrorCode.DB_CONNECTION_FAILED,
    ErrorCode.DB_QUERY_TIMEOUT,
    ErrorCode.GENERIC_NETWORK
  ];
  
  return retryableCodes.includes(error.errorCode);
}

/**
 * Get user-friendly error title for error code
 */
export function getErrorTitle(errorCode: ErrorCode): string {
  const titles: Record<ErrorCode, string> = {
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Sign In Failed',
    [ErrorCode.AUTH_EMAIL_NOT_CONFIRMED]: 'Email Verification Required',
    [ErrorCode.AUTH_SERVICE_UNAVAILABLE]: 'Authentication Unavailable',
    [ErrorCode.AUTH_SESSION_EXPIRED]: 'Session Expired',
    [ErrorCode.AUTH_RATE_LIMITED]: 'Too Many Attempts',
    
    [ErrorCode.DB_CONNECTION_FAILED]: 'Service Unavailable',
    [ErrorCode.DB_QUERY_TIMEOUT]: 'Request Timeout',
    [ErrorCode.DB_CONSTRAINT_VIOLATION]: 'Data Conflict',
    [ErrorCode.DB_RECORD_NOT_FOUND]: 'Not Found',
    [ErrorCode.DB_PERMISSION_DENIED]: 'Access Denied',
    
    [ErrorCode.UPLOAD_FILE_TOO_LARGE]: 'File Too Large',
    [ErrorCode.UPLOAD_INVALID_TYPE]: 'Invalid File Type',
    [ErrorCode.UPLOAD_STORAGE_FULL]: 'Storage Full',
    [ErrorCode.UPLOAD_NETWORK_ERROR]: 'Upload Failed',
    
    [ErrorCode.API_INVALID_REQUEST]: 'Invalid Request',
    [ErrorCode.API_RATE_LIMITED]: 'Rate Limited',
    [ErrorCode.API_SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [ErrorCode.API_TIMEOUT]: 'Request Timeout',
    
    [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'Required Field',
    [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid Format',
    [ErrorCode.VALIDATION_LENGTH_EXCEEDED]: 'Input Too Long',
    
    [ErrorCode.GENERIC_UNKNOWN]: 'Unexpected Error',
    [ErrorCode.GENERIC_NETWORK]: 'Network Error',
    [ErrorCode.GENERIC_PERMISSION]: 'Permission Denied'
  };
  
  return titles[errorCode] || 'Error';
}