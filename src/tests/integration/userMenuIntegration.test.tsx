import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserMenu from '@/shared/components/layout/Header/UserMenu';
import { AuthContextProvider } from '@/shared/contexts/AuthContextWithRedux';
import { supabase } from '@/lib/supabase';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, session: null }) => state,
      members: (state = { entities: {}, ids: [] }) => state,
    },
    preloadedState: initialState,
  });
};

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
  sessionCache: new WeakMap(),
}));

const renderWithProviders = (ui: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <AuthContextProvider>
          {ui}
        </AuthContextProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('UserMenu Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching Integration', () => {
    it('should fetch member data when user is authenticated', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      const mockMember = {
        id: 'member123',
        user_id: 'user123',
        name: 'Test User',
        slug: 'test-user',
        bio: 'Test bio',
        avatar_url: null,
      };

      // Mock authenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'test-token',
            expires_at: Date.now() + 3600000,
          },
        },
        error: null,
      });

      // Mock member fetch
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: mockMember,
            error: null,
          }),
        })),
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      renderWithProviders(<UserMenu />);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });

      // Click to open menu
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for member data to load
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('members');
        expect(mockSelect).toHaveBeenCalled();
      });

      // Check that profile link is rendered with correct href
      await waitFor(() => {
        const profileLink = screen.getByText('Your Profile');
        expect(profileLink).toBeInTheDocument();
        expect(profileLink.closest('a')).toHaveAttribute('href', '/directory/member123');
      });
    });

    it('should handle member data fetch errors', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      // Mock authenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'test-token',
            expires_at: Date.now() + 3600000,
          },
        },
        error: null,
      });

      // Mock member fetch error
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch member' },
          }),
        })),
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      renderWithProviders(<UserMenu />);

      // Wait for authentication
      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });

      // Click to open menu
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for member data fetch attempt
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('members');
      });

      // Profile link should not be shown when member data fails to load
      expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
      // But other links should still be available
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should show loading state while fetching member data', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      // Mock authenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'test-token',
            expires_at: Date.now() + 3600000,
          },
        },
        error: null,
      });

      // Mock delayed member fetch
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({
              data: { id: 'member123', name: 'Test User' },
              error: null,
            }), 100))
          ),
        })),
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      renderWithProviders(<UserMenu />);

      // Wait for authentication
      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });

      // Click to open menu immediately
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Profile link should not be shown while loading
      expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();

      // Wait for member data to load
      await waitFor(() => {
        expect(screen.getByText('Your Profile')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Real-time Updates', () => {
    it('should update when user role changes', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      const store = createTestStore({
        auth: {
          user: mockUser,
          session: { user: mockUser },
          roles: ['authenticated'],
        },
      });

      const { rerender } = render(
        <Provider store={store}>
          <BrowserRouter>
            <AuthContextProvider>
              <UserMenu />
            </AuthContextProvider>
          </BrowserRouter>
        </Provider>
      );

      // Click to open menu
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Admin link should not be visible initially
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();

      // Update store with admin role
      store.dispatch({
        type: 'auth/setRoles',
        payload: ['authenticated', 'admin'],
      });

      // Re-render with updated store
      rerender(
        <Provider store={store}>
          <BrowserRouter>
            <AuthContextProvider>
              <UserMenu />
            </AuthContextProvider>
          </BrowserRouter>
        </Provider>
      );

      // Admin link should now be visible
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});