// Jest setup file to load test environment variables
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Make the environment variables available to the test environment
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.process = globalThis.process || {};
  // @ts-ignore
  globalThis.process.env = globalThis.process.env || {};
  
  // Override environment variables for tests
  Object.assign(globalThis.process.env, {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_USE_SUPABASE: process.env.VITE_USE_SUPABASE,
    VITE_PROFILE_IMAGES_BUCKET: process.env.VITE_PROFILE_IMAGES_BUCKET,
    NODE_ENV: 'test'
  });
}

console.log('Test environment loaded:', {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  USE_SUPABASE: process.env.VITE_USE_SUPABASE,
  NODE_ENV: process.env.NODE_ENV
});

// jest.setup.ts

// Define the global variable that the AST transformer will point import.meta.env to
// @ts-ignore
globalThis.__JEST_IMPORT_META_ENV__ = {
  // Supabase URL and keys (multiple naming conventions for compatibility)
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  VITE_SUPABASE_KEY: process.env.VITE_SUPABASE_KEY || 'your-anon-key',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // Feature flags
  VITE_DEV_BYPASS_AUTH: process.env.VITE_DEV_BYPASS_AUTH || 'false',
  VITE_USE_SUPABASE: process.env.VITE_USE_SUPABASE || 'true',
  
  // Environment indicators
  DEV: true,
  MODE: 'test',
  PROD: false,
  SSR: false,
  
  // Storage buckets
  VITE_PROFILE_IMAGES_BUCKET: 'profile-images',
  
  // Set process.env values as well for code that might bypass our mock
  // This ensures environment variables are available no matter how they're accessed
};

// Also set these values in process.env for modules that might use that directly
process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
process.env.VITE_SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || 'your-anon-key';
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
process.env.VITE_USE_SUPABASE = process.env.VITE_USE_SUPABASE || 'true';
process.env.VITE_DEV_BYPASS_AUTH = process.env.VITE_DEV_BYPASS_AUTH || 'false';
process.env.VITE_PROFILE_IMAGES_BUCKET = 'profile-images';


// You might also need to mock other global objects or functions here

// For example, if you use fetch API and want to mock it globally:
// global.fetch = jest.fn();

// Mock window.matchMedia, which is often used by UI libraries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn(() => []),
}));


// If you're using Redux and need to clear store or reset mocks between tests:
// import { store } from './src/redux/store'; // Adjust path as necessary

// afterEach(() => {
//   jest.clearAllMocks();
  // If you need to reset Redux store state between tests:
  // store.dispatch({ type: 'RESET_APP_STATE' }); // Assuming you have such an action
// });

// Fix for "SyntaxError: Cannot use 'import.meta' outside a module"
// This is a more direct way to handle the import.meta.env issue if the above Object.defineProperty doesn't work for all cases.
// It tells Jest to transform modules that use import.meta.
// However, the primary way to handle this is through Babel or ts-jest configuration.
// The Object.defineProperty approach is generally preferred for mocking the values.

// Ensure that SUPABASE_URL and SUPABASE_KEY are available as process.env for modules that might expect them there.
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_KEY = 'your-anon-key';

// Mocking for react-router-dom's Link component if needed, or other external libraries
import React from 'react'; // Import React for React.createElement

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Import and retain default behavior
  Link: jest.fn().mockImplementation(({ to, children, ...rest }: { to: string; children: React.ReactNode; [key: string]: any }) => {
    return React.createElement('a', { href: to, ...rest }, children);
  }),
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(() => ({})),
  useLocation: jest.fn(() => ({ pathname: '/', search: '', hash: '', state: null, key: 'testKey' })),
}));

console.error = jest.fn(); // Suppress console.error for cleaner test output, review if specific errors are expected
console.warn = jest.fn(); // Suppress console.warn

// Mock for @supabase/supabase-js to ensure it doesn't try to connect during tests
// unless specifically intended and configured for integration tests.
// jest.mock('@supabase/supabase-js', () => {
//   const mockSupabaseClient = {
//     from: jest.fn().mockReturnThis(),
//     select: jest.fn().mockReturnThis(),
//     insert: jest.fn().mockReturnThis(),
//     update: jest.fn().mockReturnThis(),
//     delete: jest.fn().mockReturnThis(),
//     eq: jest.fn().mockReturnThis(),
//     neq: jest.fn().mockReturnThis(),
//     gt: jest.fn().mockReturnThis(),
//     gte: jest.fn().mockReturnThis(),
//     lt: jest.fn().mockReturnThis(),
//     lte: jest.fn().mockReturnThis(),
//     in: jest.fn().mockReturnThis(),
//     is: jest.fn().mockReturnThis(),
//     // Add other methods you use
//     auth: {
//       signInWithPassword: jest.fn(),
//       signUp: jest.fn(),
//       signOut: jest.fn(),
//       onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
//       getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
//       getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
//       // Add other auth methods you use
//     },
//     // Add other Supabase client parts you use, like storage, functions, etc.
//   };
//   return {
//     createClient: jest.fn(() => mockSupabaseClient),
//   };
// });

