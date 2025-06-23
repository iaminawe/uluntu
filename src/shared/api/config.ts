// API configuration constants

export const API_CONFIG = {
  // Default pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 300000, // 5 minutes
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Cache settings
  CACHE_TTL: 300000, // 5 minutes
  
  // Error messages
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION: 'Invalid data provided.',
  }
};