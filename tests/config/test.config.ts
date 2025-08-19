/**
 * Test Configuration for Menu Management System
 * 
 * Centralized configuration for all test types including
 * setup, teardown, and test environment management.
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Test environment configuration
export const testEnvironmentConfig = {
  // Base URLs for different environments
  baseUrls: {
    development: 'http://localhost:5555',
    staging: 'https://staging.example.com',
    production: 'https://example.com',
  },
  
  // Database configuration for testing
  database: {
    testDb: 'postgresql://test:test@localhost:5432/menu_test',
    migrations: './supabase/migrations',
    seeds: './tests/seeds',
  },
  
  // Authentication test credentials
  auth: {
    admin: {
      email: 'admin@test.com',
      password: 'admin123',
      roles: ['admin', 'superadmin'],
    },
    user: {
      email: 'user@test.com', 
      password: 'user123',
      roles: ['user'],
    },
    editor: {
      email: 'editor@test.com',
      password: 'editor123',
      roles: ['editor'],
    },
  },
  
  // Timeout configurations
  timeouts: {
    unit: 5000,
    integration: 10000,
    e2e: 30000,
    performance: 60000,
  },
  
  // Performance thresholds
  performance: {
    renderTime: 100, // ms
    memoryUsage: 50 * 1024 * 1024, // 50MB
    bundleSize: 2 * 1024 * 1024, // 2MB
    firstContentfulPaint: 1800, // ms
    largestContentfulPaint: 2500, // ms
  },
  
  // Accessibility standards
  accessibility: {
    wcagLevel: 'AA',
    colorContrastRatio: 4.5,
    minTouchTargetSize: 44, // pixels
  },
  
  // Browser support matrix
  browsers: {
    chrome: { min: '90', target: 'latest' },
    firefox: { min: '88', target: 'latest' },
    safari: { min: '14', target: 'latest' },
    edge: { min: '90', target: 'latest' },
  },
  
  // Mobile device configurations
  devices: {
    mobile: {
      viewport: { width: 375, height: 667 },
      userAgent: 'Mobile Safari',
    },
    tablet: {
      viewport: { width: 768, height: 1024 },
      userAgent: 'iPad Safari',
    },
    desktop: {
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Desktop Chrome',
    },
  },
};

// Vitest configuration
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/menu/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/features/admin/api/menuManagement*': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
    testTimeout: testEnvironmentConfig.timeouts.unit,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Parallel execution configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'tests/e2e/**', // E2E tests run separately with Playwright
    ],
    // Mock configuration
    deps: {
      external: ['@supabase/supabase-js'],
    },
    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@tests': resolve(__dirname, '../'),
    },
  },
  define: {
    'import.meta.env.DEV': false,
    'import.meta.env.PROD': false,
    'import.meta.env.TEST': true,
  },
});

// Jest configuration for legacy compatibility
export const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  testMatch: [
    '<rootDir>/src/**/*.{test,spec}.{js,ts,jsx,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/tests/e2e/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts,jsx,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,ts,jsx,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/features/menu/**/*.{js,ts,jsx,tsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testTimeout: testEnvironmentConfig.timeouts.unit,
  maxWorkers: '50%',
};

// Playwright configuration for E2E tests
export const playwrightConfig = {
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html'],
    ['json', { outputFile: './test-results/results.json' }],
    ['junit', { outputFile: './test-results/results.xml' }],
  ],
  use: {
    baseURL: testEnvironmentConfig.baseUrls.development,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...testEnvironmentConfig.devices.desktop, channel: 'chrome' },
    },
    {
      name: 'firefox',
      use: { ...testEnvironmentConfig.devices.desktop, channel: 'firefox' },
    },
    {
      name: 'webkit',
      use: { ...testEnvironmentConfig.devices.desktop, channel: 'webkit' },
    },
    
    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: {
        ...testEnvironmentConfig.devices.mobile,
        channel: 'chrome',
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...testEnvironmentConfig.devices.mobile,
        channel: 'webkit',
      },
    },
    
    // Tablet devices
    {
      name: 'iPad',
      use: {
        ...testEnvironmentConfig.devices.tablet,
        channel: 'webkit',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: testEnvironmentConfig.baseUrls.development,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
};

// Test utilities and helpers
export class TestEnvironment {
  private static instance: TestEnvironment;
  private config = testEnvironmentConfig;

  static getInstance(): TestEnvironment {
    if (!TestEnvironment.instance) {
      TestEnvironment.instance = new TestEnvironment();
    }
    return TestEnvironment.instance;
  }

  getConfig() {
    return this.config;
  }

  getBaseUrl(env: string = 'development'): string {
    return this.config.baseUrls[env as keyof typeof this.config.baseUrls] || 
           this.config.baseUrls.development;
  }

  getTestCredentials(role: string) {
    return this.config.auth[role as keyof typeof this.config.auth] || 
           this.config.auth.user;
  }

  getTimeout(testType: string): number {
    return this.config.timeouts[testType as keyof typeof this.config.timeouts] || 
           this.config.timeouts.unit;
  }

  getPerformanceThreshold(metric: string): number {
    return this.config.performance[metric as keyof typeof this.config.performance] || 0;
  }

  isCI(): boolean {
    return !!process.env.CI;
  }

  getDeviceConfig(device: string) {
    return this.config.devices[device as keyof typeof this.config.devices] ||
           this.config.devices.desktop;
  }

  // Test data cleanup utilities
  async cleanupTestData() {
    // Implement cleanup logic for test databases
    console.log('Cleaning up test data...');
  }

  // Test environment setup
  async setupTestEnvironment() {
    console.log('Setting up test environment...');
    // Initialize test database, create test users, etc.
  }

  // Performance monitoring
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      console.log(`${name}: ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${name} failed after ${end - start}ms:`, error);
      throw error;
    }
  }

  // Memory monitoring
  measureMemory<T>(name: string, fn: () => T): T {
    const initialMemory = process.memoryUsage();
    try {
      const result = fn();
      const finalMemory = process.memoryUsage();
      const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;
      console.log(`${name} memory usage: ${memoryDelta} bytes`);
      return result;
    } catch (error) {
      console.error(`${name} memory measurement failed:`, error);
      throw error;
    }
  }
}

// Test runner utilities
export class TestRunner {
  private testEnv = TestEnvironment.getInstance();

  async runUnitTests(options: { coverage?: boolean; watch?: boolean } = {}) {
    const { execSync } = await import('child_process');
    
    let command = 'vitest run';
    if (options.coverage) command += ' --coverage';
    if (options.watch) command += ' --watch';
    
    execSync(command, { stdio: 'inherit' });
  }

  async runIntegrationTests() {
    const { execSync } = await import('child_process');
    execSync('vitest run tests/integration/', { stdio: 'inherit' });
  }

  async runE2ETests(browser?: string) {
    const { execSync } = await import('child_process');
    
    let command = 'playwright test';
    if (browser) command += ` --project=${browser}`;
    
    execSync(command, { stdio: 'inherit' });
  }

  async runAllTests() {
    console.log('Running comprehensive test suite...');
    
    try {
      console.log('1. Running unit tests...');
      await this.runUnitTests({ coverage: true });
      
      console.log('2. Running integration tests...');
      await this.runIntegrationTests();
      
      console.log('3. Running E2E tests...');
      await this.runE2ETests();
      
      console.log('✅ All tests completed successfully!');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async runPerformanceTests() {
    console.log('Running performance tests...');
    const { execSync } = await import('child_process');
    execSync('vitest run tests/performance/', { stdio: 'inherit' });
  }

  async runAccessibilityTests() {
    console.log('Running accessibility tests...');
    const { execSync } = await import('child_process');
    execSync('vitest run tests/accessibility/', { stdio: 'inherit' });
  }

  async runSecurityTests() {
    console.log('Running security tests...');
    const { execSync } = await import('child_process');
    execSync('vitest run tests/security/', { stdio: 'inherit' });
  }

  async runCrossBrowserTests() {
    console.log('Running cross-browser tests...');
    const { execSync } = await import('child_process');
    execSync('playwright test tests/cross-browser/', { stdio: 'inherit' });
  }
}

export { testEnvironmentConfig };
export default testEnvironmentConfig;