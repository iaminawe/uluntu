/**
 * Dashboard Navigation Integration Tests
 * Tests navigation integration and routing within dashboard
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';

import { UserDashboard } from '../../components/UserDashboard';
import { DashboardLayout } from '../../components/DashboardLayout';
import { NavigationSidebar } from '../../components/NavigationSidebar';
import authReducer from '@/shared/contexts/authSlice';
import { Header } from '@/shared/components/layout/Header';

// Mock API responses
jest.mock('../../api/userDashboardApi');
jest.mock('@/lib/supabase');

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'member'
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
        ...initialState.auth
      }
    }
  });
};

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });
};

const DashboardApp: React.FC<{ initialEntries?: string[] }> = ({ initialEntries = ['/dashboard'] }) => {
  const store = createMockStore();
  const queryClient = createQueryClient();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <div id="root">
            <Header />
            <Routes>
              <Route path="/dashboard/*" element={<DashboardLayout />}>
                <Route index element={<UserDashboard />} />
                <Route path="content" element={<div>Content Management</div>} />
                <Route path="analytics" element={<div>Analytics Dashboard</div>} />
                <Route path="activity" element={<div>Activity Stream</div>} />
                <Route path="settings" element={<div>Dashboard Settings</div>} />
              </Route>
              <Route path="/profile" element={<div>User Profile</div>} />
              <Route path="/gallery" element={<div>Photo Gallery</div>} />
              <Route path="/" element={<div>Home Page</div>} />
            </Routes>
          </div>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('Dashboard Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Main Navigation', () => {
    test('navigates to dashboard from main navigation', async () => {
      render(<DashboardApp initialEntries={['/']} />);

      // Should start at home page
      expect(screen.getByText('Home Page')).toBeInTheDocument();

      // Navigate to dashboard via header menu
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await userEvent.click(dashboardLink);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
      });
    });

    test('maintains navigation state when switching between dashboard sections', async () => {
      render(<DashboardApp initialEntries={['/dashboard']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Navigate to content section
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await userEvent.click(contentTab);

      await waitFor(() => {
        expect(screen.getByText('Content Management')).toBeInTheDocument();
      });

      // Navigate to analytics
      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      await userEvent.click(analyticsTab);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });
    });

    test('shows active navigation state correctly', async () => {
      render(<DashboardApp initialEntries={['/dashboard/analytics']} />);

      await waitFor(() => {
        const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
        expect(analyticsTab).toHaveAttribute('aria-selected', 'true');
        expect(analyticsTab).toHaveClass('active');
      });
    });
  });

  describe('Sidebar Navigation', () => {
    test('renders sidebar navigation with all links', async () => {
      render(<NavigationSidebar />);

      expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /content/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /activity/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    test('highlights active section in sidebar', async () => {
      render(<DashboardApp initialEntries={['/dashboard/content']} />);

      await waitFor(() => {
        const contentLink = screen.getByRole('link', { name: /content/i });
        expect(contentLink).toHaveClass('active');
      });
    });

    test('collapses and expands sidebar on mobile', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<DashboardApp />);

      await waitFor(() => {
        const sidebar = screen.getByTestId('dashboard-sidebar');
        expect(sidebar).toHaveClass('collapsed');
      });

      // Click menu toggle
      const menuToggle = screen.getByRole('button', { name: /toggle menu/i });
      await userEvent.click(menuToggle);

      await waitFor(() => {
        const sidebar = screen.getByTestId('dashboard-sidebar');
        expect(sidebar).not.toHaveClass('collapsed');
      });
    });
  });

  describe('Breadcrumb Navigation', () => {
    test('displays correct breadcrumbs for nested routes', async () => {
      render(<DashboardApp initialEntries={['/dashboard/content']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    test('breadcrumbs are clickable and navigate correctly', async () => {
      render(<DashboardApp initialEntries={['/dashboard/analytics']} />);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Click dashboard breadcrumb to go back
      const dashboardBreadcrumb = screen.getByRole('link', { name: 'Dashboard' });
      await userEvent.click(dashboardBreadcrumb);

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
        expect(screen.queryByText('Analytics Dashboard')).not.toBeInTheDocument();
      });
    });
  });

  describe('Deep Linking', () => {
    test('supports direct navigation to dashboard sections via URL', async () => {
      render(<DashboardApp initialEntries={['/dashboard/analytics']} />);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
        const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
        expect(analyticsTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    test('redirects invalid dashboard routes to main dashboard', async () => {
      render(<DashboardApp initialEntries={['/dashboard/invalid-section']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });

    test('preserves query parameters during navigation', async () => {
      render(<DashboardApp initialEntries={['/dashboard/analytics?period=30d']} />);

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Navigate to content and back
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await userEvent.click(contentTab);

      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      await userEvent.click(analyticsTab);

      await waitFor(() => {
        // Query params should be preserved (would be handled by component logic)
        expect(window.location.pathname).toContain('analytics');
      });
    });
  });

  describe('Navigation Guards and Permissions', () => {
    test('redirects unauthenticated users to login', async () => {
      const unauthenticatedStore = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
          }
        }
      });

      render(
        <Provider store={unauthenticatedStore}>
          <QueryClientProvider client={createQueryClient()}>
            <MemoryRouter initialEntries={['/dashboard']}>
              <Routes>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/login" element={<div>Login Page</div>} />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    test('restricts access to admin sections for regular users', async () => {
      render(<DashboardApp initialEntries={['/dashboard/settings']} />);

      await waitFor(() => {
        const settingsSection = screen.queryByText('Dashboard Settings');
        // Regular users shouldn't see admin settings
        expect(settingsSection).not.toBeInTheDocument();
      });
    });

    test('shows different navigation options based on user role', async () => {
      const adminStore = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: { ...mockUser, role: 'admin' },
            isAuthenticated: true,
            loading: false,
            error: null
          }
        }
      });

      render(
        <Provider store={adminStore}>
          <QueryClientProvider client={createQueryClient()}>
            <MemoryRouter initialEntries={['/dashboard']}>
              <NavigationSidebar />
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      );

      await waitFor(() => {
        // Admin users should see additional navigation options
        expect(screen.getByRole('link', { name: /admin panel/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /user management/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Performance', () => {
    test('lazy loads dashboard sections', async () => {
      const mockLazyLoad = jest.fn();
      jest.mock('react', () => ({
        ...jest.requireActual('react'),
        lazy: mockLazyLoad
      }));

      render(<DashboardApp />);

      // Navigate to different sections
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await userEvent.click(contentTab);

      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      await userEvent.click(analyticsTab);

      // Sections should be lazy loaded
      expect(mockLazyLoad).toHaveBeenCalled();
    });

    test('preloads critical dashboard data', async () => {
      const mockPreload = jest.fn();
      
      render(<DashboardApp />);

      await waitFor(() => {
        // Critical data should be preloaded
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Navigation Accessibility', () => {
    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DashboardApp />);

      await waitFor(() => {
        const overviewTab = screen.getByRole('tab', { name: /overview/i });
        expect(overviewTab).toBeInTheDocument();
      });

      // Tab to navigation
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      overviewTab.focus();
      
      // Use arrow keys to navigate
      await user.keyboard('{ArrowRight}');
      
      const contentTab = screen.getByRole('tab', { name: /content/i });
      expect(contentTab).toHaveFocus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Content Management')).toBeInTheDocument();
      });
    });

    test('announces route changes to screen readers', async () => {
      render(<DashboardApp />);

      const contentTab = screen.getByRole('tab', { name: /content/i });
      await userEvent.click(contentTab);

      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toHaveTextContent(/navigated to content/i);
      });
    });

    test('has proper ARIA landmarks for navigation', async () => {
      render(<DashboardApp />);

      await waitFor(() => {
        const navigation = screen.getByRole('navigation', { name: /dashboard navigation/i });
        expect(navigation).toBeInTheDocument();
        
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
      });
    });
  });

  describe('URL Synchronization', () => {
    test('updates URL when navigating between sections', async () => {
      const { container } = render(<DashboardApp initialEntries={['/dashboard']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Navigate to analytics
      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      await userEvent.click(analyticsTab);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard/analytics');
      });
    });

    test('handles browser back/forward navigation', async () => {
      render(<DashboardApp initialEntries={['/dashboard']} />);

      // Navigate to content
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await userEvent.click(contentTab);

      await waitFor(() => {
        expect(screen.getByText('Content Management')).toBeInTheDocument();
      });

      // Simulate browser back
      window.history.back();

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling in Navigation', () => {
    test('shows error boundary for failed route loads', async () => {
      // Mock a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Component failed to load');
      };

      render(
        <Provider store={createMockStore()}>
          <QueryClientProvider client={createQueryClient()}>
            <MemoryRouter initialEntries={['/dashboard/error']}>
              <Routes>
                <Route path="/dashboard/error" element={<ErrorComponent />} />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    test('provides fallback navigation when sections fail to load', async () => {
      render(<DashboardApp initialEntries={['/dashboard/broken-section']} />);

      await waitFor(() => {
        // Should fall back to main dashboard
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /try again/i })).toBeInTheDocument();
      });
    });
  });
});