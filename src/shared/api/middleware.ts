// Common API middleware functions

import { supabase } from './client';

// Auth middleware - ensures user is authenticated
export async function withAuth<T extends (...args: any[]) => any>(
  fn: T
): Promise<ReturnType<T>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return fn();
}

// Error handling middleware
export async function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): Promise<ReturnType<T> | null> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error ${context || 'in API call'}:`, error);
    return null;
  }
}

// Retry middleware for transient failures
export async function withRetry<T extends (...args: any[]) => any>(
  fn: T,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ReturnType<T>> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}