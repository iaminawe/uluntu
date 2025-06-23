import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import { AuthContext } from '@/shared/contexts/AuthContext';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import UsersPage from '@/pages/admin/UsersPage';
import RolesPage from '@/pages/admin/RolesPage';
import ModerationPage from '@/pages/admin/ModerationPage';
import { adminFeaturesApi } from '@/features/admin/api/features';
import { adminRolesApi } from '@/features/admin/api/roles';
import { adminStatsApi } from '@/features/admin/api/stats';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } } })),
      admin: {
        listUsers: jest.fn(() => Promise.resolve({ 
          data: { 
            users: [
              {
                id: 'user-1',
                email: 'test@example.com',
                created_at: '2024-01-01',
                last_sign_in_at: '2024-01-15',
                app_metadata: {},
                user_metadata: { name: 'Test User' }
              }
            ] 
          },
          error: null 
        }))
      }
    }
  }
}));

// Mock the API modules
jest.mock('@/api/admin/features');
jest.mock('@/api/admin/roles');
jest.mock('@/api/admin/stats');

// Test utilities
const mockStore = configureStore({
  reducer: {
    auth: authReducer
  },
  preloadedState: {
    auth: {
      user: { id: 'test-user-id', email: 'admin@test.com' },
      session: { access_token: 'test-token', refresh_token: 'test-refresh' },
      isLoading: false,
      error: null,
      userRoles: [{ role: 'superadmin' }],
      isAdmin: true
    }
  }
});

const mockAuthContext = {
  user: { id: 'test-user-id', email: 'admin@test.com' },
  session: { access_token: 'test-token', refresh_token: 'test-refresh' },
  loading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  userRoles: [{ role: 'superadmin' }],
  isAdmin: true
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            {component}
          </AuthContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('Admin Area Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('Admin Access Control', () => {
    it('should redirect non-admin users', () => {
      const nonAdminContext = {
        ...mockAuthContext,
        userRoles: [{ role: 'user' }],
        isAdmin: false
      };

      render(
        <Provider store={mockStore}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthContext.Provider value={nonAdminContext}>
                <AdminLayout />
              </AuthContext.Provider>
            </BrowserRouter>
          </QueryClientProvider>
        </Provider>
      );

      // Should redirect to home page
      expect(window.location.pathname).toBe('/');
    });

    it('should allow superadmin access', () => {
      renderWithProviders(<AdminLayout />);
      
      // Should show admin panel
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      (adminStatsApi.getDashboardStats as jest.Mock).mockResolvedValue({
        totalUsers: 100,
        totalMembers: 50,
        totalCompanies: 20,
        totalGroups: 15,
        totalEvents: 30,
        totalNews: 25,
        totalResources: 40,
        totalMarketplaceListings: 35,
        totalOpportunities: 10,
        pendingModeration: 5,
        recentActivity: []
      });
    });

    it('should display dashboard statistics', async () => {
      renderWithProviders(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument(); // Total Members
        expect(screen.getByText('20')).toBeInTheDocument(); // Companies
      });
    });

    it('should show pending moderation alert', async () => {
      renderWithProviders(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/5 items waiting for review/)).toBeInTheDocument();
        expect(screen.getByText('Review items')).toBeInTheDocument();
      });
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_roles') {
          return {
            select: jest.fn(() => Promise.resolve({
              data: [
                {
                  user_id: 'user-1',
                  role_id: 'role-1',
                  role: { id: 'role-1', name: 'user' },
                  user: {
                    id: 'user-1',
                    email: 'test@example.com',
                    created_at: '2024-01-01',
                    last_sign_in_at: '2024-01-15',
                    raw_app_meta_data: {},
                    raw_user_meta_data: { name: 'Test User' }
                  }
                }
              ],
              error: null
            }))
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      (adminRolesApi.getRoles as jest.Mock).mockResolvedValue([
        { id: 'role-1', name: 'user', description: 'Standard user', permissions: {}, is_system: true },
        { id: 'role-2', name: 'admin', description: 'Administrator', permissions: {}, is_system: true }
      ]);
    });

    it('should display users list', async () => {
      renderWithProviders(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('should allow searching users', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersPage />);

      const searchInput = screen.getByPlaceholderText('Search users by email or name...');
      await user.type(searchInput, 'test@example');

      expect(searchInput).toHaveValue('test@example');
    });

    it('should open role assignment modal', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Add Role')).toBeInTheDocument();
      });

      await user.click(screen.getByText('+ Add Role'));

      expect(screen.getByText(/Assign Role to test@example.com/)).toBeInTheDocument();
    });
  });

  describe('Role Management', () => {
    const mockRoles = [
      { 
        id: 'role-1', 
        name: 'superadmin', 
        description: 'Full system access', 
        permissions: { '*': ['*'] }, 
        is_system: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      { 
        id: 'role-2', 
        name: 'custom-role', 
        description: 'Custom role', 
        permissions: { members: ['read'] }, 
        is_system: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];

    beforeEach(() => {
      (adminRolesApi.getRoles as jest.Mock).mockResolvedValue(mockRoles);
    });

    it('should display roles list', async () => {
      renderWithProviders(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText('Role Management')).toBeInTheDocument();
        expect(screen.getByText('superadmin')).toBeInTheDocument();
        expect(screen.getByText('custom-role')).toBeInTheDocument();
      });
    });

    it('should prevent editing system roles', async () => {
      renderWithProviders(<RolesPage />);

      await waitFor(() => {
        const superadminCard = screen.getByText('superadmin').closest('div.bg-white');
        expect(superadminCard).toBeInTheDocument();
        
        // System roles should show lock icon
        const lockIcon = superadminCard?.querySelector('svg[title="System role"]');
        expect(lockIcon).toBeInTheDocument();
        
        // Should not have edit/delete buttons
        const editButtons = superadminCard?.querySelectorAll('button');
        expect(editButtons?.length).toBe(0);
      });
    });

    it('should open create role modal', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RolesPage />);

      await waitFor(() => {
        expect(screen.getByText('Create Role')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create Role'));

      expect(screen.getByText('Create New Role')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Content Manager')).toBeInTheDocument();
    });
  });

  describe('Moderation Queue', () => {
    const mockModerationItems = [
      {
        id: 'mod-1',
        entity_type: 'news',
        entity_id: 'news-1',
        action_type: 'create',
        content: { title: 'Test News Article' },
        submitted_by: 'user-1',
        submitted_by_user: { email: 'user@example.com' },
        status: 'pending',
        created_at: '2024-01-15'
      }
    ];

    beforeEach(() => {
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'moderation_queue') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn(() => Promise.resolve({
                    data: mockModerationItems,
                    error: null,
                    count: 1
                  }))
                }))
              })),
              order: jest.fn(() => ({
                range: jest.fn(() => Promise.resolve({
                  data: mockModerationItems,
                  error: null,
                  count: 1
                }))
              }))
            }))
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });
    });

    it('should display moderation queue', async () => {
      renderWithProviders(<ModerationPage />);

      await waitFor(() => {
        expect(screen.getByText('Content Moderation')).toBeInTheDocument();
        expect(screen.getByText('News')).toBeInTheDocument();
        expect(screen.getByText('user@example.com')).toBeInTheDocument();
      });
    });

    it('should filter by status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ModerationPage />);

      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await user.selectOptions(statusFilter, 'approved');

      expect(statusFilter).toHaveValue('approved');
    });

    it('should open review modal', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ModerationPage />);

      await waitFor(() => {
        expect(screen.getByText('Review')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Review'));

      expect(screen.getByText(/Review news Create/)).toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });
  });

  describe('Feature Flags', () => {
    const mockFeatures = [
      {
        id: 'feat-1',
        feature_key: 'members',
        enabled: true,
        config: { maxProfilesPerUser: 1, requireApproval: false },
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: 'feat-2',
        feature_key: 'events',
        enabled: false,
        config: { maxEventsPerUser: 20, requireApproval: true },
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ];

    beforeEach(() => {
      (adminFeaturesApi.getFeatures as jest.Mock).mockResolvedValue(mockFeatures);
      (adminFeaturesApi.toggleFeature as jest.Mock).mockImplementation((key, enabled) => 
        Promise.resolve({ ...mockFeatures.find(f => f.feature_key === key), enabled })
      );
    });

    it('should check if features are enabled', async () => {
      const isEnabled = await adminFeaturesApi.isFeatureEnabled('members');
      expect(isEnabled).toBe(true);
    });

    it('should check if features are disabled', async () => {
      (adminFeaturesApi.getFeature as jest.Mock).mockResolvedValue({
        ...mockFeatures[1],
        enabled: false
      });
      
      const isEnabled = await adminFeaturesApi.isFeatureEnabled('events');
      expect(isEnabled).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should render all navigation links', () => {
      renderWithProviders(<AdminLayout />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Entity Management')).toBeInTheDocument();
      expect(screen.getByText('Users & Roles')).toBeInTheDocument();
      expect(screen.getByText('Moderation')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should show entity sub-navigation', () => {
      renderWithProviders(<AdminLayout />);

      expect(screen.getByText('Members')).toBeInTheDocument();
      expect(screen.getByText('Companies')).toBeInTheDocument();
      expect(screen.getByText('Groups')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
    });
  });
});

describe('Admin API Integration Tests', () => {
  describe('Feature Management API', () => {
    it('should update feature configuration', async () => {
      const newConfig = { maxItems: 10, requireApproval: true };
      (adminFeaturesApi.updateFeatureConfig as jest.Mock).mockResolvedValue({
        feature_key: 'test-feature',
        config: newConfig
      });

      const result = await adminFeaturesApi.updateFeatureConfig('test-feature', newConfig);
      
      expect(result.config).toEqual(newConfig);
      expect(adminFeaturesApi.updateFeatureConfig).toHaveBeenCalledWith('test-feature', newConfig);
    });
  });

  describe('Role Permissions API', () => {
    it('should check user permissions correctly', async () => {
      (adminRolesApi.checkPermission as jest.Mock).mockResolvedValue(true);

      const hasPermission = await adminRolesApi.checkPermission('user-1', 'members', 'create');
      
      expect(hasPermission).toBe(true);
      expect(adminRolesApi.checkPermission).toHaveBeenCalledWith('user-1', 'members', 'create');
    });

    it('should handle wildcard permissions', async () => {
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([
        { role: { permissions: { '*': ['*'] } } }
      ]);
      (adminRolesApi.checkPermission as jest.Mock).mockImplementation(async () => true);

      const hasPermission = await adminRolesApi.checkPermission('admin-user', 'any-resource', 'any-action');
      
      expect(hasPermission).toBe(true);
    });
  });
});