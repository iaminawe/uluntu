/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  // Mock environment variables
  globals: {
    'import.meta': {
      env: {
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_KEY: 'mock-supabase-key',
        NODE_ENV: 'test',
      },
    },
  },
  // Ignore transformations for node_modules except for specific packages
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|@testing-library)/)',
  ],
};

export default config;