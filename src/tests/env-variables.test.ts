// Test file to verify that environment variables are correctly mocked in Jest

describe('Environment Variables in Jest', () => {
  // Test that our global mock for import.meta.env is working
  it('should have access to mocked import.meta.env variables', () => {
    // Direct access to the global mock
    // @ts-ignore - Jest-specific global
    expect(globalThis.__JEST_IMPORT_META_ENV__).toBeDefined();
    // @ts-ignore
    expect(globalThis.__JEST_IMPORT_META_ENV__.VITE_SUPABASE_URL).toBe('http://127.0.0.1:54321');
    // @ts-ignore
    expect(globalThis.__JEST_IMPORT_META_ENV__.VITE_SUPABASE_ANON_KEY).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
  });

  // Test that process.env variables are set correctly
  it('should have access to environment variables via process.env', () => {
    expect(process.env.VITE_SUPABASE_URL).toBe('http://127.0.0.1:54321');
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
    // In test environment, we use mocks instead of real Supabase
    expect(process.env.VITE_USE_SUPABASE).toBe('false');
  });

  // Test that our env.ts module correctly provides access to variables
  it('should be able to import and use the env.ts module', async () => {
    // Import the module - this will test if our AST transformer is working
    const { IS_SUPABASE_ENABLED } = await import('../config/env');
    
    // Check that the imported value is correct
    // In test environment, Supabase is disabled
    expect(IS_SUPABASE_ENABLED).toBe(false);
  });
});
