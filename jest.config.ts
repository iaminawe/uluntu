import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Root directory
  rootDir: '.',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest.setup.ts',
    '<rootDir>/tests/setupTests.ts'
  ],
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // Static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
    
    // Supabase mocking
    '^@/lib/supabase$': '<rootDir>/src/__mocks__/lib/supabase.ts'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      }
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react'
      ]
    }]
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|@reduxjs|@testing-library|@tanstack|uuid|browser-image-compression)/)'
  ],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/__mocks__/**',
    '!src/types/**',
    '!src/vite-env.d.ts',
    '!src/main.tsx'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout
  testTimeout: 10000,
  
  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  
  // Module paths to ignore
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/.next/'
  ],
  
  // Watch plugins - commented out as the package may not be installed
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Max workers
  maxWorkers: '50%',
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};

export default config;