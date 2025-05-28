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
  // For Jest environment - check the global mock
  // @ts-ignore - Jest-specific global
  if (typeof globalThis !== 'undefined' && globalThis.__JEST_IMPORT_META_ENV__) {
    // @ts-ignore
    return globalThis.__JEST_IMPORT_META_ENV__[key];
  }

  // For Node.js environment - check process.env
  if (typeof process !== 'undefined' && process.env) {
    // Check for VITE_ prefixed env vars in process.env
    if (key.startsWith('VITE_') && process.env[key]) {
      return process.env[key];
    }
    
    // Also check without VITE_ prefix for compatibility
    const unprefixedKey = key.replace(/^VITE_/, '');
    if (process.env[unprefixedKey]) {
      return process.env[unprefixedKey];
    }
  }

  // For Vite/browser environment - use a try/catch to handle import.meta
  // We don't use import.meta directly in a way that would be evaluated at parse time
  try {
    // @ts-ignore - Use a variable to avoid direct reference
    const importMeta = globalThis.import?.meta;
    if (importMeta && importMeta.env && importMeta.env[key]) {
      return importMeta.env[key];
    }
  } catch (e) {
    // Silently fail if import.meta isn't available
  }

  return undefined;
}

/**
 * Flag indicating whether Supabase should be used as the backend.
 * Determined by the VITE_USE_SUPABASE environment variable.
 * Defaults to false if the variable is not 'true'.
 */
export const IS_SUPABASE_ENABLED: boolean = getMetaEnvVariable('VITE_USE_SUPABASE') === 'true';
