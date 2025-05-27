/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  testRegex: '\\.(test|spec)\\.tsx$', // Only run .tsx test files
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest', // Use babel-jest for TypeScript
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock the supabase module to avoid import.meta.env issues
    '^../lib/supabase$': '<rootDir>/src/tests/__mocks__/supabase.ts',
    // Add a more specific mock for the userAccountManagement.test.tsx file
    '^src/lib/supabase$': '<rootDir>/src/tests/__mocks__/supabase.ts',
    // Mock the membersApi module
    '^../api/membersApi$': '<rootDir>/src/tests/__mocks__/membersApi.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
};