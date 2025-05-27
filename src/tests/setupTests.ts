// This file is run before each test file

// Make Jest globals available
// This ensures that describe, it, test, expect, etc. are available globally
import '@testing-library/jest-dom';

// Mock the import.meta.env object that Vite uses
// This prevents errors when running tests that import files using import.meta.env
if (typeof window !== 'undefined') {
  // @ts-expect-error - Adding import.meta to window
  window.import = {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
        VITE_PROFILE_IMAGES_BUCKET: 'profile-images',
        MODE: 'test',
      },
    },
  };
  
  // Mock window.alert
  window.alert = jest.fn();
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});