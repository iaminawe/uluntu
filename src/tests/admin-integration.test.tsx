import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from '@/shared/contexts/AuthContextWithRedux';

// Mock components to verify they're rendered
jest.mock('@/pages/admin/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Admin Dashboard Component</div>
}));

jest.mock('@/pages/admin/UsersPage', () => ({
  __esModule: true,
  default: () => <div>Users Management Component</div>
}));

jest.mock('@/pages/admin/RolesPage', () => ({
  __esModule: true,
  default: () => <div>Roles Management Component</div>
}));

jest.mock('@/pages/admin/ModerationPage', () => ({
  __esModule: true,
  default: () => <div>Moderation Component</div>
}));

jest.mock('@/pages/admin/entities/MembersPage', () => ({
  __esModule: true,
  default: () => <div>Members Entity Component</div>
}));

// Mock auth to always be authenticated as admin
jest.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-admin', email: 'admin@test.com' },
    userRoles: ['superadmin'],
    isAdmin: true,
    loading: false,
    error: null
  })
}));

// Mock the AuthContext
jest.mock('@/shared/contexts/AuthContextWithRedux', () => ({
  useAuth: () => ({
    user: { id: 'test-admin', email: 'admin@test.com' },
    userRoles: ['superadmin'],
    isAdmin: true,
    loading: false,
    error: null
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Import AdminLayout after mocks
import AdminLayout from '@/pages/admin/AdminLayout';

describe('Admin System Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const renderWithProviders = (component: React.ReactElement, route = '/admin') => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={[route]}>
              {component}
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    );
  };

  describe('AdminLayout Navigation', () => {
    it('renders the admin layout with navigation menu', () => {
      renderWithProviders(<AdminLayout />);
      
      // Check main navigation sections
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Entity Management')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Roles')).toBeInTheDocument();
      expect(screen.getByText('Moderation')).toBeInTheDocument();
      expect(screen.getByText('Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Audit Log')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('displays all entity management submenu items', () => {
      renderWithProviders(<AdminLayout />);
      
      // Check entity management items
      expect(screen.getByText('Members')).toBeInTheDocument();
      expect(screen.getByText('Companies')).toBeInTheDocument();
      expect(screen.getByText('Groups')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Opportunities')).toBeInTheDocument();
    });

    it('shows user email in the sidebar', () => {
      renderWithProviders(<AdminLayout />);
      
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });
  });

  describe('Admin Route Navigation', () => {
    it('navigates to dashboard route', () => {
      const { container } = renderWithProviders(<AdminLayout />, '/admin');
      
      // Check for active state on dashboard
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-gray-800');
    });

    it('highlights active entity management routes', () => {
      renderWithProviders(<AdminLayout />, '/admin/entities/members');
      
      // Members link should be active
      const membersLinks = screen.getAllByText('Members');
      const entityMembersLink = membersLinks.find(link => 
        link.closest('a')?.getAttribute('href') === '/admin/entities/members'
      );
      expect(entityMembersLink?.closest('a')).toHaveClass('bg-gray-800');
    });

    it('highlights users route when active', () => {
      renderWithProviders(<AdminLayout />, '/admin/users');
      
      const usersLink = screen.getByRole('link', { name: /users/i });
      expect(usersLink).toHaveClass('bg-gray-800');
    });

    it('highlights roles route when active', () => {
      renderWithProviders(<AdminLayout />, '/admin/roles');
      
      const rolesLink = screen.getByRole('link', { name: /roles/i });
      expect(rolesLink).toHaveClass('bg-gray-800');
    });
  });

  describe('Admin Components Integration', () => {
    it('renders all navigation links with correct hrefs', () => {
      renderWithProviders(<AdminLayout />);
      
      // Check main navigation links
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin');
      expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute('href', '/admin/users');
      expect(screen.getByRole('link', { name: /roles/i })).toHaveAttribute('href', '/admin/roles');
      expect(screen.getByRole('link', { name: /moderation/i })).toHaveAttribute('href', '/admin/moderation');
      expect(screen.getByRole('link', { name: /audit log/i })).toHaveAttribute('href', '/admin/audit');
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/admin/settings');
    });

    it('renders entity management links correctly', () => {
      renderWithProviders(<AdminLayout />);
      
      // Find all links and check entity management ones
      const allLinks = screen.getAllByRole('link');
      
      const entityLinks = [
        { text: 'Members', href: '/admin/entities/members' },
        { text: 'Companies', href: '/admin/entities/companies' },
        { text: 'Groups', href: '/admin/entities/groups' },
        { text: 'Events', href: '/admin/entities/events' },
        { text: 'News', href: '/admin/entities/news' },
        { text: 'Resources', href: '/admin/entities/resources' },
        { text: 'Marketplace', href: '/admin/entities/marketplace' },
        { text: 'Opportunities', href: '/admin/entities/opportunities' }
      ];

      entityLinks.forEach(({ text, href }) => {
        const links = screen.getAllByText(text);
        const entityLink = links.find(link => 
          link.closest('a')?.getAttribute('href') === href
        );
        expect(entityLink).toBeTruthy();
      });
    });

    it('renders newsletter submenu correctly', () => {
      renderWithProviders(<AdminLayout />);
      
      // Find newsletter links
      const dashboardLinks = screen.getAllByText('Dashboard');
      const newsletterDashboard = dashboardLinks.find(link => 
        link.closest('a')?.getAttribute('href') === '/admin/newsletter'
      );
      expect(newsletterDashboard).toBeTruthy();

      expect(screen.getByRole('link', { name: /campaigns/i }))
        .toHaveAttribute('href', '/admin/newsletter/campaigns');
      expect(screen.getByRole('link', { name: /subscribers/i }))
        .toHaveAttribute('href', '/admin/newsletter/subscribers');
      expect(screen.getByRole('link', { name: /analytics/i }))
        .toHaveAttribute('href', '/admin/newsletter/analytics');
    });
  });

  describe('Error Handling', () => {
    it('redirects non-admin users', () => {
      // Mock non-admin user
      const mockUseAuth = jest.fn(() => ({
        user: { id: 'test-user', email: 'user@test.com' },
        userRoles: ['authenticated'],
        isAdmin: false,
        loading: false,
        error: null
      }));

      jest.spyOn(require('@/shared/contexts/AuthContextWithRedux'), 'useAuth')
        .mockImplementation(mockUseAuth);

      renderWithProviders(<AdminLayout />);
      
      // Should redirect (component returns Navigate)
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });
  });
});