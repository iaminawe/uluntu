import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../Dashboard';
import UsersPage from '../UsersPage';
import SettingsPage from '../SettingsPage';
import ModerationPage from '../ModerationPage';
import RolesPage from '../RolesPage';
import AuditPage from '../AuditPage';

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    rpc: jest.fn(() => Promise.resolve({ data: { count: 0 }, error: null }))
  }
}));

// Mock API modules
jest.mock('@/api/admin/features', () => ({
  adminFeaturesApi: {
    getFeatures: jest.fn(() => Promise.resolve([])),
    toggleFeature: jest.fn(),
    updateFeatureConfig: jest.fn(),
    getFeatureTranslations: jest.fn(() => Promise.resolve([])),
    upsertFeatureTranslation: jest.fn()
  }
}));

jest.mock('@/api/admin/roles', () => ({
  adminRolesApi: {
    getRoles: jest.fn(() => Promise.resolve([])),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
    assignRole: jest.fn(),
    removeRole: jest.fn(),
    getUserRoles: jest.fn(() => Promise.resolve([]))
  }
}));

jest.mock('@/api/admin/moderation', () => ({
  adminModerationApi: {
    getModerationQueue: jest.fn(() => Promise.resolve({ data: [], count: 0 })),
    getModerationStats: jest.fn(() => Promise.resolve({
      totalPending: 0,
      byType: {}
    })),
    approveContent: jest.fn(),
    rejectContent: jest.fn(),
    getContentDetails: jest.fn(),
    approveItem: jest.fn(),
    rejectItem: jest.fn()
  }
}));

jest.mock('@/api/admin/stats', () => ({
  adminStatsApi: {
    getDashboardStats: jest.fn(() => Promise.resolve({
      totalMembers: 0,
      totalCompanies: 0,
      totalGroups: 0,
      totalEvents: 0,
      totalNews: 0,
      totalResources: 0,
      totalMarketplaceListings: 0,
      totalOpportunities: 0,
      pendingModeration: 0,
      totalUsers: 0,
      recentActivity: []
    })),
    getUserGrowthStats: jest.fn(() => Promise.resolve({
      labels: [],
      data: []
    })),
    getContentStats: jest.fn(() => Promise.resolve({
      published: 0,
      draft: 0,
      archived: 0
    })),
    getEngagementStats: jest.fn(() => Promise.resolve({
      activeUsers: 0,
      pageViews: 0,
      interactions: 0
    }))
  }
}));

jest.mock('@/api/admin/audit', () => ({
  adminAuditApi: {
    getAuditLogs: jest.fn(() => Promise.resolve({ data: [], count: 0 })),
    exportAuditLogs: jest.fn(() => Promise.resolve(''))
  }
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Admin Pages', () => {
  describe('AdminDashboard', () => {
    it('renders dashboard with stats', async () => {
      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Overview of your platform\'s activity and statistics')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Total Members')).toBeInTheDocument();
        expect(screen.getByText('Companies')).toBeInTheDocument();
      });
    });
  });

  describe('UsersPage', () => {
    it('renders user management page', async () => {
      render(
        <TestWrapper>
          <UsersPage />
        </TestWrapper>
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Manage user accounts, roles, and permissions')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search users by email or name...')).toBeInTheDocument();
    });
  });

  describe('SettingsPage', () => {
    it('renders settings page with tabs', async () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Manage feature flags and translations')).toBeInTheDocument();
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      expect(screen.getByText('Translations')).toBeInTheDocument();
    });
  });

  describe('ModerationPage', () => {
    it('renders moderation queue', async () => {
      render(
        <TestWrapper>
          <ModerationPage />
        </TestWrapper>
      );

      expect(screen.getByText('Content Moderation')).toBeInTheDocument();
      expect(screen.getByText('Review and moderate user-submitted content')).toBeInTheDocument();
    });
  });

  describe('RolesPage', () => {
    it('renders role management page', async () => {
      render(
        <TestWrapper>
          <RolesPage />
        </TestWrapper>
      );

      expect(screen.getByText('Role Management')).toBeInTheDocument();
      expect(screen.getByText('Create and manage user roles with granular permissions')).toBeInTheDocument();
    });
  });

  describe('AuditPage', () => {
    it('renders audit log viewer', async () => {
      render(
        <TestWrapper>
          <AuditPage />
        </TestWrapper>
      );

      expect(screen.getByText('Audit Log')).toBeInTheDocument();
      expect(screen.getByText('Track all administrative actions and changes')).toBeInTheDocument();
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
  });
});