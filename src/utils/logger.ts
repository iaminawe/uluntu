/**
 * Centralized logging utility for Nelson Tech platform
 * Provides structured logging with proper levels and environment-based control
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || false;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString()
    };

    // Add to buffer for potential remote logging
    this.addToBuffer(entry);

    // In development, log to console
    if (this.isDevelopment) {
      const contextStr = context ? `[${context}]` : '';
      const logMessage = `${contextStr} ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(logMessage, data || '');
          break;
        case 'info':
          console.info(logMessage, data || '');
          break;
        case 'warn':
          console.warn(logMessage, data || '');
          break;
        case 'error':
          console.error(logMessage, data || '');
          break;
      }
    }

    // In production, only log warnings and errors to console
    if (!this.isDevelopment && (level === 'warn' || level === 'error')) {
      const contextStr = context ? `[${context}]` : '';
      const logMessage = `${contextStr} ${message}`;
      
      if (level === 'warn') {
        console.warn(logMessage, data || '');
      } else {
        console.error(logMessage, data || '');
      }
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log('error', message, context, data);
  }

  // Utility methods
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }

  // API specific logging helpers
  apiRequest(endpoint: string, method: string, data?: any): void {
    this.debug(`API Request: ${method} ${endpoint}`, 'API', data);
  }

  apiResponse(endpoint: string, status: number, data?: any): void {
    this.debug(`API Response: ${endpoint} (${status})`, 'API', data);
  }

  apiError(endpoint: string, error: any): void {
    this.error(`API Error: ${endpoint}`, 'API', error);
  }

  // Auth specific logging
  authEvent(event: string, data?: any): void {
    this.info(`Auth Event: ${event}`, 'AUTH', data);
  }

  authError(event: string, error: any): void {
    this.error(`Auth Error: ${event}`, 'AUTH', error);
  }

  // Performance logging
  performance(operation: string, duration: number, data?: any): void {
    this.info(`Performance: ${operation} took ${duration}ms`, 'PERF', data);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions for easier migration
export const logDebug = (message: string, context?: string, data?: any) => 
  logger.debug(message, context, data);

export const logInfo = (message: string, context?: string, data?: any) => 
  logger.info(message, context, data);

export const logWarn = (message: string, context?: string, data?: any) => 
  logger.warn(message, context, data);

export const logError = (message: string, context?: string, data?: any) => 
  logger.error(message, context, data);