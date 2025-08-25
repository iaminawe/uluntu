/**
 * Test Utilities and Helper Functions
 * Shared utilities for dashboard CRUD testing
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Import reducers
import authReducer from '@/shared/contexts/authSlice';
import { SessionContextWithRedux } from '@/shared/contexts/SessionContextWithRedux';

// Types for test data
export interface TestUser {
  id: string;
  email: string;
  memberId: string;
  role: 'member' | 'moderator' | 'admin';
  groups: string[];
  companies: string[];
}

export interface TestContent {
  id: string;
  type: 'photo' | 'event' | 'news' | 'resource' | 'group' | 'marketplace' | 'opportunity' | 'gallery';
  title: string;
  user_id: string;
  status: 'draft' | 'published' | 'archived' | 'pending';
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  featured: boolean;
  thumbnail_url: string | null;
  url: string;
  slug: string;
  description?: string;
  groupId?: string;
  companyId?: string;
}

export interface TestGroup {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  members: string[];
  admins: string[];
}

export interface TestCompany {
  id: string;
  name: string;
  description: string;
  employees: string[];
  admins: string[];
}

// Mock data generators
export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: `user-${Date.now()}`,
  email: 'test@example.com',
  memberId: `member-${Date.now()}`,
  role: 'member',
  groups: ['general'],
  companies: [],
  ...overrides
});

export const createTestContent = (userId: string, overrides: Partial<TestContent> = {}): TestContent => ({
  id: `content-${Date.now()}`,
  type: 'photo',
  title: 'Test Content',
  user_id: userId,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  view_count: 0,
  like_count: 0,
  comment_count: 0,
  featured: false,
  thumbnail_url: null,
  url: `/content/${Date.now()}`,
  slug: `content-${Date.now()}`,
  description: 'Test content description',
  ...overrides
});

export const createTestGroup = (overrides: Partial<TestGroup> = {}): TestGroup => ({
  id: `group-${Date.now()}`,
  name: 'Test Group',
  description: 'Test group description',
  visibility: 'public',
  members: [],
  admins: [],
  ...overrides
});

export const createTestCompany = (overrides: Partial<TestCompany> = {}): TestCompany => ({
  id: `company-${Date.now()}`,
  name: 'Test Company',
  description: 'Test company description',
  employees: [],
  admins: [],
  ...overrides
});

// Mock store configuration
export const createMockStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        session: null,
        isLoading: false,
        error: null,
        userRoles: [],
        isAdmin: false,
        ...initialState.auth
      }
    }
  });
};

// Query client for testing
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Test wrapper component
interface TestWrapperOptions {
  initialEntries?: string[];
  store?: ReturnType<typeof createMockStore>;
  queryClient?: QueryClient;
}

export const createTestWrapper = (user: TestUser, options: TestWrapperOptions = {}) => {
  const store = options.store || createMockStore({
    auth: {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.email.split('@')[0],
        }
      },
      session: {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        user: {
          id: user.id,
          email: user.email,
        }
      },
      isLoading: false,
      error: null,
      userRoles: [{ role: user.role }],
      isAdmin: user.role === 'admin'
    }
  });

  const queryClient = options.queryClient || createTestQueryClient();
  const initialEntries = options.initialEntries || ['/dashboard'];

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(Provider, { store },
      React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(MemoryRouter, { initialEntries },
          React.createElement(SessionContextWithRedux, null,
            children
          )
        )
      )
    )
  );
};

// Supabase mocking utilities
export const mockSupabaseFrom = (tableName: string) => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };

  return mockQuery;
};

export const mockSupabaseResponse = (data: any = null, error: any = null) => ({
  data,
  error,
  count: data ? (Array.isArray(data) ? data.length : 1) : 0
});

// Permission testing utilities
export const testUserPermissions = {
  member: {
    canRead: ['own_content'],
    canWrite: ['own_content'],
    canDelete: ['own_content'],
    canModerate: [],
    canAdminister: []
  },
  moderator: {
    canRead: ['own_content', 'public_content', 'flagged_content'],
    canWrite: ['own_content'],
    canDelete: ['own_content'],
    canModerate: ['public_content', 'flagged_content'],
    canAdminister: []
  },
  admin: {
    canRead: ['*'],
    canWrite: ['*'],
    canDelete: ['*'],
    canModerate: ['*'],
    canAdminister: ['*']
  }
};

// Content filtering test helpers
export const filterContentByUser = (content: TestContent[], userId: string): TestContent[] => {
  return content.filter(item => item.user_id === userId);
};

export const filterContentByGroup = (content: TestContent[], groupId: string): TestContent[] => {
  return content.filter(item => item.groupId === groupId);
};

export const filterContentByCompany = (content: TestContent[], companyId: string): TestContent[] => {
  return content.filter(item => item.companyId === companyId);
};

export const filterContentByStatus = (content: TestContent[], status: TestContent['status']): TestContent[] => {
  return content.filter(item => item.status === status);
};

export const filterContentByType = (content: TestContent[], type: TestContent['type']): TestContent[] => {
  return content.filter(item => item.type === type);
};

// Performance testing utilities
export const measureRenderTime = async (renderFunction: () => Promise<void>): Promise<number> => {
  const startTime = performance.now();
  await renderFunction();
  const endTime = performance.now();
  return endTime - startTime;
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // This would integrate with jest-axe for accessibility testing
  const { axe, toHaveNoViolations } = require('jest-axe');
  expect.extend(toHaveNoViolations);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// API mocking utilities for specific endpoints
export const mockContentManagementApi = {
  getAllUserContent: jest.fn(),
  getContentStatistics: jest.fn(),
  updateContentItem: jest.fn(),
  deleteContentItem: jest.fn(),
  performBulkContentOperation: jest.fn(),
  getContentPermissions: jest.fn()
};

export const mockUserPermissionsService = {
  canAccessDashboard: jest.fn(),
  hasPermission: jest.fn(),
  getUserContent: jest.fn(),
  canAccessContent: jest.fn(),
  canViewAnalytics: jest.fn(),
  canModifyContent: jest.fn(),
  validateSession: jest.fn(),
  checkRateLimit: jest.fn()
};

export const mockDashboardSecurityService = {
  sanitizeInput: jest.fn(),
  validateInput: jest.fn(),
  logSecurityEvent: jest.fn(),
  validateJWT: jest.fn(),
  encryptSensitiveData: jest.fn(),
  decryptSensitiveData: jest.fn(),
  auditLog: jest.fn(),
  validateContentUpdate: jest.fn(),
  generateSignature: jest.fn(),
  validateSignature: jest.fn(),
  getSecurityHeaders: jest.fn(),
  validateContentType: jest.fn()
};

// Test data sets for common scenarios
export const testDataSets = {
  multiUserContent: {
    user1: [
      createTestContent('member-1', { type: 'photo', title: 'User 1 Photo', status: 'published' }),
      createTestContent('member-1', { type: 'event', title: 'User 1 Event', status: 'draft' }),
    ],
    user2: [
      createTestContent('member-2', { type: 'news', title: 'User 2 News', status: 'published' }),
      createTestContent('member-2', { type: 'marketplace', title: 'User 2 Listing', status: 'archived' }),
    ],
    user3: [
      createTestContent('member-3', { type: 'resource', title: 'User 3 Resource', status: 'pending' }),
    ]
  },
  
  groupContent: [
    createTestContent('member-1', { 
      type: 'group', 
      title: 'Public Group Post', 
      groupId: 'group-public',
      status: 'published' 
    }),
    createTestContent('member-2', { 
      type: 'group', 
      title: 'Private Group Post', 
      groupId: 'group-private',
      status: 'published' 
    }),
  ],

  companyContent: [
    createTestContent('member-1', { 
      type: 'news', 
      title: 'Company A News', 
      companyId: 'company-a',
      status: 'published' 
    }),
    createTestContent('member-2', { 
      type: 'event', 
      title: 'Company B Event', 
      companyId: 'company-b',
      status: 'published' 
    }),
  ],

  performanceTestContent: Array.from({ length: 100 }, (_, i) => 
    createTestContent('member-1', {
      id: `perf-content-${i}`,
      title: `Performance Test Content ${i}`,
      type: 'photo',
      status: 'published',
      view_count: Math.floor(Math.random() * 1000),
      like_count: Math.floor(Math.random() * 100),
    })
  )
};

// Mock environment setup
export const setupTestEnvironment = () => {
  // Mock window.alert
  Object.defineProperty(window, 'alert', {
    writable: true,
    value: jest.fn(),
  });

  // Mock window.confirm
  Object.defineProperty(window, 'confirm', {
    writable: true,
    value: jest.fn().mockReturnValue(true),
  });

  // Mock IntersectionObserver for components that use it
  class MockIntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  // Mock ResizeObserver
  class MockResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  });
};

// Clean up test environment
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

// Export default user for convenience
export const mockUser = createTestUser();