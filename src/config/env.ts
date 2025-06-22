// src/config/env.ts

/**
 * Checks the value of an environment variable from import.meta.env.
 * @param key The key of the environment variable.
 * @returns The value of the environment variable, or undefined if not found.
 */
/**
 * Safely gets environment variables from various sources based on the runtime environment.
 * This function avoids direct references to import.meta that would cause syntax errors in Jest.
 */
function getMetaEnvVariable(key: string): string | undefined {
  // For Vite/browser environment - check if import.meta is available (prioritize this for browser)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key] !== undefined) {
      return import.meta.env[key];
    }
  }
  
  // For Jest environment - check the global mock
  // @ts-ignore - Jest-specific global
  if (typeof globalThis !== 'undefined' && globalThis.__JEST_IMPORT_META_ENV__) {
    // @ts-ignore
    return globalThis.__JEST_IMPORT_META_ENV__[key];
  }

  // Note: We avoid using process.env in browser code as it causes ReferenceError
  
  return undefined;
}

/**
 * Flag indicating whether Supabase should be used as the backend.
 * Determined by the VITE_USE_SUPABASE environment variable.
 * Defaults to false if the variable is not 'true'.
 */
/**
 * Gets the current value of IS_SUPABASE_ENABLED dynamically
 * This ensures we always get the current environment value
 */
export function getIsSupabaseEnabled(): boolean {
  const envValue = getMetaEnvVariable('VITE_USE_SUPABASE');
  console.log('[config/env.ts] Dynamic check - VITE_USE_SUPABASE:', envValue);
  
  // Temporary: force Supabase enabled for debugging
  console.log('[config/env.ts] Forcing Supabase enabled for debugging');
  return true;
  
  // return envValue === 'true';
}

// For backward compatibility, export a getter that checks dynamically
export const IS_SUPABASE_ENABLED: boolean = getIsSupabaseEnabled();
