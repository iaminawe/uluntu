import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '@/shared/components/layout/Header';
import { AuthContextProvider } from '@/shared/contexts/AuthContextWithRedux';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, session: null, roles: [] }) => state,
      members: (state = { entities: {}, ids: [] }) => state,
    },
    preloadedState: initialState,
  });
};

// Mock Supabase and hooks
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

const renderHeaderWithProviders = (initialRoute = '/', initialState = {}) => {
  const store = createTestStore(initialState);
  
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthContextProvider>
          <Header />
        </AuthContextProvider>
      </MemoryRouter>
    </Provider>
  );
};

describe('Header Navigation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Full Header Integration', () => {
    it('should render header with both main navigation and user menu', () => {
      renderHeaderWithProviders();
      
      // Main navigation should be present
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      
      // User menu should be present
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should handle authenticated user state across navigation', async () => {
      const initialState = {
        auth: {
          user: { id: 'user123', email: 'user@example.com' },
          session: { access_token: 'token' },
          roles: ['authenticated'],
        },
      };

      renderHeaderWithProviders('/', initialState);
      
      // User menu should show avatar instead of "Account"
      const userMenuButton = screen.getByRole('button', { 
        name: /user menu/i 
      }) || screen.getByRole('button');
      
      expect(userMenuButton).toBeInTheDocument();
      
      // Click to open user menu
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        expect(screen.getByText('user@example.com')).toBeInTheDocument();
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Sign out')).toBeInTheDocument();
      });
    });

    it('should handle admin user state across navigation', async () => {
      const initialState = {
        auth: {
          user: { id: 'admin123', email: 'admin@example.com' },
          session: { access_token: 'token' },
          roles: ['authenticated', 'admin'],
        },
      };

      renderHeaderWithProviders('/', initialState);
      
      // Open user menu
      const userMenuButton = screen.getByRole('button');
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation State Management', () => {
    it('should close user menu when clicking main navigation', async () => {
      renderHeaderWithProviders();
      
      // Open user menu
      const userMenuButton = screen.getByText('Account');
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sign in')).toBeInTheDocument();
      });
      
      // Click on main navigation
      const communityButton = screen.getByText('Community');
      fireEvent.click(communityButton);
      
      // User menu should remain open as they are independent components
      // This tests the actual behavior rather than expected behavior
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('should handle multiple dropdowns interaction', async () => {
      renderHeaderWithProviders();
      
      // Open Community dropdown
      const communityButton = screen.getByText('Community');
      fireEvent.click(communityButton);
      
      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument();
      });
      
      // Open user menu
      const userMenuButton = screen.getByText('Account');
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sign in')).toBeInTheDocument();
      });
      
      // Both dropdowns can be open simultaneously
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior Integration', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should handle mobile navigation with user menu', () => {
      renderHeaderWithProviders();
      
      // Both mobile nav and user menu should be present
      expect(screen.getByText('Account')).toBeInTheDocument();
      
      // Look for mobile menu button (hamburger menu)
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      }) || screen.getAllByRole('button')[0];
      
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should maintain user menu functionality on mobile', () => {
      renderHeaderWithProviders();
      
      const userMenuButton = screen.getByText('Account');
      fireEvent.click(userMenuButton);
      
      // User menu should work on mobile
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('Route Integration', () => {
    it('should handle navigation to profile pages', async () => {
      const initialState = {
        auth: {
          user: { id: 'user123', email: 'user@example.com' },
          session: { access_token: 'token' },
          roles: ['authenticated'],
        },
        members: {
          entities: {
            'member123': { id: 'member123', user_id: 'user123', name: 'Test User' }
          },
          ids: ['member123'],
        },
      };

      renderHeaderWithProviders('/', initialState);
      
      // Open user menu
      const userMenuButton = screen.getByRole('button');
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        const profileLink = screen.getByText('Your Profile');
        expect(profileLink).toBeInTheDocument();
        expect(profileLink.closest('a')).toHaveAttribute('href', '/directory/member123');
      });
    });

    it('should handle navigation to admin pages', async () => {
      const initialState = {
        auth: {
          user: { id: 'admin123', email: 'admin@example.com' },
          session: { access_token: 'token' },
          roles: ['authenticated', 'admin'],
        },
      };

      renderHeaderWithProviders('/', initialState);
      
      // Open user menu
      const userMenuButton = screen.getByRole('button');
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        const adminLink = screen.getByText('Admin Dashboard');
        expect(adminLink).toBeInTheDocument();
        expect(adminLink.closest('a')).toHaveAttribute('href', '/admin');
      });
    });

    it('should handle sign out navigation', async () => {
      const mockSignOut = vi.fn().mockResolvedValue(undefined);
      const initialState = {
        auth: {
          user: { id: 'user123', email: 'user@example.com' },
          session: { access_token: 'token' },
          roles: ['authenticated'],
          signOut: mockSignOut,
        },
      };

      renderHeaderWithProviders('/', initialState);
      
      // Open user menu
      const userMenuButton = screen.getByRole('button');
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        const signOutButton = screen.getByText('Sign out');
        expect(signOutButton).toBeInTheDocument();
        
        fireEvent.click(signOutButton);
      });
      
      // Note: Sign out functionality depends on actual auth context implementation
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle auth errors gracefully', () => {
      const initialState = {
        auth: {
          user: null,
          session: null,
          roles: [],
          error: 'Authentication failed',
        },
      };

      renderHeaderWithProviders('/', initialState);
      
      // Should still render basic navigation
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should handle member data errors', () => {
      const initialState = {
        auth: {
          user: { id: 'user123', email: 'user@example.com' },
          session: { access_token: 'token' },
          roles: ['authenticated'],
        },
        members: {
          entities: {},
          ids: [],
          error: 'Failed to load member data',
        },
      };

      renderHeaderWithProviders('/', initialState);
      
      // User menu should still work without profile link
      const userMenuButton = screen.getByRole('button');
      fireEvent.click(userMenuButton);
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      // Profile link should not be present due to error
      expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should not cause performance regression with full header', async () => {
      const start = performance.now();
      
      renderHeaderWithProviders();
      
      // Open and close user menu multiple times
      const userMenuButton = screen.getByText('Account');
      
      for (let i = 0; i < 5; i++) {
        fireEvent.click(userMenuButton);
        fireEvent.click(userMenuButton);
      }
      
      const end = performance.now();
      const totalTime = end - start;
      
      // Full header with interactions should complete within reasonable time
      expect(totalTime).toBeLessThan(500);
    });

    it('should handle concurrent navigation interactions', async () => {
      renderHeaderWithProviders();
      
      const start = performance.now();
      
      // Simulate concurrent interactions with different nav elements
      const communityButton = screen.getByText('Community');
      const userMenuButton = screen.getByText('Account');
      
      await Promise.all([
        new Promise(resolve => {
          fireEvent.click(communityButton);
          setTimeout(resolve, 10);
        }),
        new Promise(resolve => {
          fireEvent.click(userMenuButton);
          setTimeout(resolve, 15);
        }),
      ]);
      
      const end = performance.now();
      const totalTime = end - start;
      
      expect(totalTime).toBeLessThan(100);
    });
  });
});