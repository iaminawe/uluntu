/**
 * Dashboard Test Configuration
 * Centralized configuration for dashboard test suites
 */

import type { Config } from '@jest/types';
import { PlaywrightTestConfig } from '@playwright/test';

// Jest Configuration for Unit/Integration Tests
export const jestConfig: Config.InitialOptions = {
  displayName: 'Dashboard Tests',
  testMatch: [
    '<rootDir>/src/features/dashboard/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/features/dashboard/**/*.test.{ts,tsx}'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/features/dashboard/__tests__/setup/setupTests.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/features/dashboard/**/*.{ts,tsx}',
    '!src/features/dashboard/**/*.test.{ts,tsx}',
    '!src/features/dashboard/**/*.spec.{ts,tsx}',
    '!src/features/dashboard/**/__tests__/**',
    '!src/features/dashboard/**/types.ts',
    '!src/features/dashboard/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/features/dashboard/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/features/dashboard/api/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  }
};

// Playwright Configuration for E2E Tests
export const playwrightConfig: PlaywrightTestConfig = {
  testDir: './src/features/dashboard/__tests__/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/dashboard-e2e-results.json' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
};

// Test Data Configuration
export const testData = {
  users: {
    member: {
      id: 'test-member-123',
      email: 'member@test.com',
      password: 'TestPassword123!',
      fullName: 'Test Member',
      role: 'member'
    },
    moderator: {
      id: 'test-moderator-123',
      email: 'moderator@test.com',
      password: 'TestPassword123!',
      fullName: 'Test Moderator',
      role: 'moderator'
    },
    admin: {
      id: 'test-admin-123',
      email: 'admin@test.com',
      password: 'TestPassword123!',
      fullName: 'Test Admin',
      role: 'admin'
    }
  },
  content: {
    posts: [
      {
        id: 'post-1',
        title: 'Test Blog Post',
        content: 'This is a test blog post for dashboard testing.',
        status: 'published',
        views: 42,
        likes: 8,
        comments: 3
      },
      {
        id: 'post-2',
        title: 'Draft Post',
        content: 'This is a draft post.',
        status: 'draft',
        views: 0,
        likes: 0,
        comments: 0
      }
    ],
    photos: [
      {
        id: 'photo-1',
        title: 'Test Photo',
        url: '/test-images/photo1.jpg',
        thumbnail: '/test-images/photo1-thumb.jpg',
        views: 156,
        likes: 24
      }
    ],
    events: [
      {
        id: 'event-1',
        title: 'Test Event',
        description: 'A test event for dashboard testing.',
        date: new Date(Date.now() + 86400000).toISOString(),
        attendees: 15
      }
    ]
  },
  analytics: {
    overview: {
      totalViews: 198,
      totalLikes: 32,
      totalComments: 3,
      totalFollowers: 45,
      growthRate: 12.5
    },
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      views: [20, 35, 42, 38, 50, 28, 33],
      engagement: [5, 8, 12, 9, 15, 7, 10]
    }
  }
};

// Test Utilities Configuration
export const testUtils = {
  delays: {
    short: 100,
    medium: 500,
    long: 1000,
    network: 2000
  },
  selectors: {
    dashboard: {
      overview: '[data-testid="dashboard-overview"]',
      sidebar: '[data-testid="dashboard-sidebar"]',
      tabs: {
        overview: '[role="tab"][name*="overview"]',
        content: '[role="tab"][name*="content"]',
        analytics: '[role="tab"][name*="analytics"]',
        activity: '[role="tab"][name*="activity"]'
      }
    },
    content: {
      item: '[data-testid="content-item"]',
      createButton: 'button:has-text("Create New Post")',
      editButton: '[data-testid="edit-button"]',
      deleteButton: '[data-testid="delete-button"]'
    },
    analytics: {
      viewsChart: '[data-testid="views-chart"]',
      engagementChart: '[data-testid="engagement-chart"]',
      timeRangeSelect: '[name="timeRange"]'
    },
    activity: {
      item: '[data-testid="activity-item"]',
      notification: '[data-testid="notification-item"]',
      unreadNotification: '[data-testid="unread-notification"]'
    }
  },
  mockData: {
    generateMockUser: (role: 'member' | 'moderator' | 'admin' = 'member') => ({
      id: `mock-${role}-${Date.now()}`,
      email: `${role}@mock.com`,
      fullName: `Mock ${role}`,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
    generateMockPost: (overrides: Partial<any> = {}) => ({
      id: `mock-post-${Date.now()}`,
      title: 'Mock Post Title',
      content: 'Mock post content for testing purposes.',
      status: 'published',
      views: Math.floor(Math.random() * 100),
      likes: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    }),
    generateMockAnalytics: () => ({
      overview: {
        totalViews: Math.floor(Math.random() * 1000),
        totalLikes: Math.floor(Math.random() * 100),
        totalComments: Math.floor(Math.random() * 50),
        totalFollowers: Math.floor(Math.random() * 200),
        growthRate: Math.random() * 50
      },
      chartData: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        views: Array(7).fill(0).map(() => Math.floor(Math.random() * 60)),
        engagement: Array(7).fill(0).map(() => Math.floor(Math.random() * 20))
      }
    })
  }
};

// Performance Testing Configuration
export const performanceConfig = {
  thresholds: {
    pageLoad: 3000,    // 3 seconds
    tabSwitch: 1000,   // 1 second
    apiResponse: 2000, // 2 seconds
    chartRender: 1500  // 1.5 seconds
  },
  metrics: {
    track: ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'],
    budgets: {
      FCP: 2000,  // First Contentful Paint
      LCP: 3000,  // Largest Contentful Paint
      FID: 100,   // First Input Delay
      CLS: 0.1,   // Cumulative Layout Shift
      TTFB: 800   // Time to First Byte
    }
  }
};

// Security Testing Configuration
export const securityConfig = {
  testCases: {
    xss: [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>'
    ],
    sqlInjection: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES('hacker'); --",
      "' UNION SELECT * FROM users --"
    ],
    paths: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '/proc/self/environ',
      '\\\\localhost\\c$\\windows\\system32'
    ]
  },
  rateLimit: {
    maxRequests: 10,
    timeWindow: 60000, // 1 minute
    blockDuration: 300000 // 5 minutes
  }
};

// Test Environment Configuration
export const environmentConfig = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    authTimeout: 30000,
    retries: 3
  },
  testing: {
    apiBaseUrl: 'http://localhost:3001/api',
    authTimeout: 10000,
    retries: 1
  },
  staging: {
    apiBaseUrl: 'https://staging.example.com/api',
    authTimeout: 15000,
    retries: 2
  },
  production: {
    apiBaseUrl: 'https://api.example.com',
    authTimeout: 20000,
    retries: 3
  }
};

export default {
  jest: jestConfig,
  playwright: playwrightConfig,
  testData,
  testUtils,
  performance: performanceConfig,
  security: securityConfig,
  environment: environmentConfig
};