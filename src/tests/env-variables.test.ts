// Test file to verify that environment variables are correctly mocked in Jest

describe('Environment Variables in Jest', () => {
  // Test that our global mock for import.meta.env is working
  it('should have access to mocked import.meta.env variables', () => {
    // Direct access to the global mock
    // @ts-ignore - Jest-specific global
    expect(globalThis.__JEST_IMPORT_META_ENV__).toBeDefined();
    // @ts-ignore
    expect(globalThis.__JEST_IMPORT_META_ENV__.VITE_SUPABASE_URL).toBe('http://localhost:54321');
    // @ts-ignore
    expect(globalThis.__JEST_IMPORT_META_ENV__.VITE_SUPABASE_ANON_KEY).toBe('your-anon-key');
  });

  // Test that process.env variables are set correctly
  it('should have access to environment variables via process.env', () => {
    expect(process.env.VITE_SUPABASE_URL).toBe('http://localhost:54321');
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBe('your-anon-key');
    expect(process.env.VITE_USE_SUPABASE).toBe('true');
  });

  // Test that our env.ts module correctly provides access to variables
  it('should be able to import and use the env.ts module', async () => {
    // Import the module - this will test if our AST transformer is working
    const { IS_SUPABASE_ENABLED } = await import('../config/env');
    
    // Check that the imported value is correct
    expect(IS_SUPABASE_ENABLED).toBe(true);
  });
});
