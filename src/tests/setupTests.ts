// This file is run before each test file

// Make Jest globals available
// This ensures that describe, it, test, expect, etc. are available globally
import '@testing-library/jest-dom';

// Check if we should use real Supabase or mocks
const useRealSupabase = process.env.VITE_USE_SUPABASE === 'true';

// Mock the import.meta.env object that Vite uses
// This prevents errors when running tests that import files using import.meta.env
if (typeof window !== 'undefined') {
  // @ts-expect-error - Adding import.meta to window
  window.import = {
    meta: {
      env: {
        VITE_SUPABASE_URL: useRealSupabase 
          ? (process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321')
          : 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: useRealSupabase 
          ? (process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0')
          : 'mock-anon-key',
        VITE_PROFILE_IMAGES_BUCKET: process.env.VITE_PROFILE_IMAGES_BUCKET || 'profile-images',
        VITE_USE_SUPABASE: process.env.VITE_USE_SUPABASE || 'false',
        MODE: 'test',
      },
    },
  };
  
  // Mock window.alert
  window.alert = jest.fn();
}

// Log which mode we're using
console.log(useRealSupabase ? '🔗 Tests will use REAL Supabase database' : '🧪 Tests will use MOCK data');

// Reset all mocks before each test (only if using mocks)
beforeEach(() => {
  if (!useRealSupabase) {
    jest.clearAllMocks();
  }
});
