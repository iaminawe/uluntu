// src/auth_template/jest.setup.js
import '@testing-library/jest-dom';

// Mock HTMLFormElement.prototype.requestSubmit
if (typeof HTMLFormElement.prototype.requestSubmit === 'undefined') {
  HTMLFormElement.prototype.requestSubmit = function() {
    this.dispatchEvent(new Event('submit', {cancelable: true}));
  }
}

// Mock window.alert
window.alert = jest.fn();

// Mock import.meta.env
global.import = {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.com',
      VITE_SUPABASE_ANON_KEY: 'test_anon_key',
      VITE_PROFILE_IMAGES_BUCKET: 'test_bucket',
    },
  },
};