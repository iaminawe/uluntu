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
function getMetaEnvVariable(key: 'VITE_USE_SUPABASE'): string | undefined {
  // SECURITY: reference ONLY specific properties (import.meta.env.VITE_X).
  // A bare `import.meta.env` reference makes Vite inline the ENTIRE env object
  // into the client bundle, leaking every VITE_* secret. Never write it.
  const viteValue = import.meta.env.VITE_USE_SUPABASE as string | undefined;
  if (viteValue !== undefined) {
    return viteValue;
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
  
  return envValue === 'true';
}

// For backward compatibility, export a getter that checks dynamically
export const IS_SUPABASE_ENABLED: boolean = getIsSupabaseEnabled();
