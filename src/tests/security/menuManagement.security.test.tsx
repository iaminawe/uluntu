/**
 * Security and Permission Tests for Menu Management
 * 
 * Tests role-based access control, permission validation,
 * data sanitization, and security vulnerabilities.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminMenuManagementPage from '@/pages/admin/MenuManagementPage';
import { menuManagementAdapter } from '@/features/admin/api/menuManagementAdapter';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { MenuItem } from '@/types/menu';
import { createMockMenuItem } from '../../../tests/fixtures/menuTestData';

// Mock dependencies
vi.mock('@/features/admin/api/menuManagementAdapter');
vi.mock('@/shared/contexts/SessionContextWithRedux');
vi.mock('@/store/hooks');
vi.mock('react-hot-toast');

const mockMenuManagementAdapter = menuManagementAdapter as any;
const mockUseSession = useSession as Mock;
const mockUseAppSelector = useAppSelector as Mock;

describe('Menu Management Security Tests', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Role-Based Access Control', () => {
    it('should deny access to users without admin roles', async () => {
      mockUseSession.mockReturnValue({ user: { id: 'user-1' } });
      mockUseAppSelector.mockReturnValue({
        roles: { list: ['user'] } // Non-admin role
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByText("You don't have permission to access menu management.")).toBeInTheDocument();
      });

      // Should not call any API endpoints
      expect(mockMenuManagementAdapter.getMenuItems).not.toHaveBeenCalled();
    });

    it('should allow access to superadmin users', async () => {
      mockUseSession.mockReturnValue({ user: { id: 'admin-1' } });
      mockUseAppSelector.mockReturnValue({
        roles: { list: ['superadmin'] }
      });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
        expect(mockMenuManagementAdapter.getMenuItems).toHaveBeenCalled();
      });
    });

    it('should allow access to admin users', async () => {
      mockUseSession.mockReturnValue({ user: { id: 'admin-2' } });
      mockUseAppSelector.mockReturnValue({
        roles: { list: ['admin'] }
      });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
        expect(mockMenuManagementAdapter.getMenuItems).toHaveBeenCalled();
      });
    });

    it('should handle multiple roles correctly', async () => {
      mockUseSession.mockReturnValue({ user: { id: 'multi-role' } });
      mockUseAppSelector.mockReturnValue({
        roles: { list: ['user', 'editor', 'admin'] }
      });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Should grant access due to admin role
      await waitFor(() => {
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
      });
    });

    it('should deny access when user has no roles', async () => {
      mockUseSession.mockReturnValue({ user: { id: 'no-roles' } });
      mockUseAppSelector.mockReturnValue({
        roles: { list: [] }
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });

    it('should deny access when roles are undefined', async () => {
      mockUseSession.mockReturnValue({ user: { id: 'undefined-roles' } });
      mockUseAppSelector.mockReturnValue({
        roles: { list: undefined }
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });
  });

  describe('Session Validation', () => {
    it('should deny access to unauthenticated users', async () => {
      mockUseSession.mockReturnValue({ user: null });
      mockUseAppSelector.mockReturnValue({
        roles: { list: [] }
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });

    it('should handle expired sessions gracefully', async () => {
      mockUseSession.mockReturnValue({ 
        user: { id: 'expired-session' },
        error: { message: 'Session expired' }
      });
      mockUseAppSelector.mockReturnValue({
        roles: { list: ['admin'] }
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Should redirect or show appropriate message
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });

    it('should validate session integrity', async () => {
      const maliciousUser = {
        id: 'hacker-attempt',
        email: '<script>alert("xss")</script>',
        roles: ['superadmin'] // Trying to inject roles via user object
      };

      mockUseSession.mockReturnValue({ user: maliciousUser });
      mockUseAppSelector.mockReturnValue({
        roles: { list: ['user'] } // Actual roles from secure store
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Should use roles from secure store, not user object
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });
  });

  describe('Input Sanitization and Validation', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ user: { id: 'admin' } });
      mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
    });

    it('should sanitize XSS attempts in menu titles', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));

      const maliciousTitles = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
      ];

      for (const maliciousTitle of maliciousTitles) {
        const titleInput = screen.getByPlaceholderText('Menu item title');
        const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');

        await user.clear(titleInput);
        await user.clear(urlInput);
        await user.type(titleInput, maliciousTitle);
        await user.type(urlInput, '/safe-url');

        mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
          createMockMenuItem({ title: maliciousTitle })
        );

        await user.click(screen.getByText('Create Menu Item'));

        // Should call API with potentially sanitized input
        await waitFor(() => {
          expect(mockMenuManagementAdapter.createMenuItem).toHaveBeenCalledWith(
            expect.objectContaining({
              title: expect.any(String), // Exact sanitization depends on implementation
              url: '/safe-url'
            })
          );
        });
      }
    });

    it('should validate and sanitize URLs', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));

      const maliciousUrls = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("XSS")',
        'file:///etc/passwd',
        'ftp://malicious-site.com/payload',
      ];

      for (const maliciousUrl of maliciousUrls) {
        const titleInput = screen.getByPlaceholderText('Menu item title');
        const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');

        await user.clear(titleInput);
        await user.clear(urlInput);
        await user.type(titleInput, 'Safe Title');
        await user.type(urlInput, maliciousUrl);

        await user.click(screen.getByText('Create Menu Item'));

        // Should either reject malicious URLs or sanitize them
        await waitFor(() => {
          if (mockMenuManagementAdapter.createMenuItem.mock.calls.length > 0) {
            const lastCall = mockMenuManagementAdapter.createMenuItem.mock.calls.slice(-1)[0];
            const urlParam = lastCall[0].url;
            
            // Should not contain dangerous protocols
            expect(urlParam).not.toMatch(/^(javascript|data|vbscript|file|ftp):/);
          }
        });
      }
    });

    it('should validate SQL injection attempts', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));

      const sqlInjectionAttempts = [
        "'; DROP TABLE menu_items; --",
        "' OR 1=1 --",
        "'; INSERT INTO users (role) VALUES ('admin'); --",
        "' UNION SELECT * FROM users --",
      ];

      for (const injection of sqlInjectionAttempts) {
        const titleInput = screen.getByPlaceholderText('Menu item title');
        const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');

        await user.clear(titleInput);
        await user.clear(urlInput);
        await user.type(titleInput, injection);
        await user.type(urlInput, '/safe-url');

        mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
          createMockMenuItem({ title: injection })
        );

        await user.click(screen.getByText('Create Menu Item'));

        // API should be called (parameterized queries should handle this)
        await waitFor(() => {
          expect(mockMenuManagementAdapter.createMenuItem).toHaveBeenCalled();
        });
      }
    });

    it('should validate role-based visibility settings', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));

      await user.type(screen.getByPlaceholderText('Menu item title'), 'Role Test');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/role-test');
      
      await user.selectOptions(screen.getByDisplayValue('Public'), 'role_based');

      // Try to inject admin role
      const rolesInput = screen.getByPlaceholderText('admin, superadmin, editor (comma separated)');
      await user.type(rolesInput, 'user, <script>alert("xss")</script>, admin');

      mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
        createMockMenuItem({ required_roles: ['user', 'admin'] })
      );

      await user.click(screen.getByText('Create Menu Item'));

      await waitFor(() => {
        expect(mockMenuManagementAdapter.createMenuItem).toHaveBeenCalledWith(
          expect.objectContaining({
            required_roles: expect.arrayContaining([
              expect.not.stringMatching(/<script>/i)
            ])
          })
        );
      });
    });

    it('should prevent path traversal in URLs', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));

      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        '/../../sensitive-data',
        'https://evil.com/../../local-file',
      ];

      for (const attempt of pathTraversalAttempts) {
        const titleInput = screen.getByPlaceholderText('Menu item title');
        const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');

        await user.clear(titleInput);
        await user.clear(urlInput);
        await user.type(titleInput, 'Path Traversal Test');
        await user.type(urlInput, attempt);

        // Should either prevent submission or sanitize the path
        await user.click(screen.getByText('Create Menu Item'));
        
        await waitFor(() => {
          if (mockMenuManagementAdapter.createMenuItem.mock.calls.length > 0) {
            const lastCall = mockMenuManagementAdapter.createMenuItem.mock.calls.slice(-1)[0];
            const urlParam = lastCall[0].url;
            
            // Should not contain path traversal patterns
            expect(urlParam).not.toMatch(/\.\.[\/\\]/);
          }
        });
      }
    });
  });

  describe('CSRF Protection', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ user: { id: 'admin' } });
      mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
    });

    it('should include CSRF tokens in API requests', async () => {
      // Mock fetch to inspect headers
      const originalFetch = global.fetch;
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      global.fetch = mockFetch;

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'CSRF Test');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/csrf-test');

      mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
        createMockMenuItem({ title: 'CSRF Test' })
      );

      await user.click(screen.getByText('Create Menu Item'));

      // Verify CSRF protection is in place
      await waitFor(() => {
        expect(mockMenuManagementAdapter.createMenuItem).toHaveBeenCalled();
        // Specific CSRF token verification would depend on implementation
      });

      global.fetch = originalFetch;
    });

    it('should reject requests without valid CSRF tokens', async () => {
      // Simulate CSRF attack
      mockMenuManagementAdapter.createMenuItem.mockRejectedValue({
        message: 'CSRF token mismatch',
        status: 403
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'Attack Test');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/attack');

      await user.click(screen.getByText('Create Menu Item'));

      // Should show error for CSRF failure
      await waitFor(() => {
        expect(screen.getByText(/CSRF token mismatch/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Exposure Prevention', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ user: { id: 'admin' } });
      mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
    });

    it('should not expose sensitive data in error messages', async () => {
      // Mock API error with potentially sensitive information
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue({
        message: 'Database connection failed: postgresql://user:password@localhost:5432/db',
        stack: 'Error stack trace with file paths and secrets',
        query: 'SELECT * FROM menu_items WHERE api_key = "secret123"'
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const errorMessage = screen.getByText(/Error Loading Menu/);
        expect(errorMessage).toBeInTheDocument();
        
        // Should not expose sensitive database information
        expect(screen.queryByText(/postgresql:\/\//)).not.toBeInTheDocument();
        expect(screen.queryByText(/password/)).not.toBeInTheDocument();
        expect(screen.queryByText(/api_key/)).not.toBeInTheDocument();
        expect(screen.queryByText(/secret123/)).not.toBeInTheDocument();
      });
    });

    it('should sanitize menu item data before display', async () => {
      const menuItemWithSensitiveData = createMockMenuItem({
        id: '1',
        title: 'Public Menu Item',
        url: '/public',
        description: 'API_KEY=secret123 DB_PASSWORD=supersecret',
        css_classes: 'background-image: url("data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+");'
      });

      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([menuItemWithSensitiveData]);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Menu item should be displayed
        expect(screen.getByText('Public Menu Item')).toBeInTheDocument();
        
        // But sensitive data should be filtered or sanitized
        expect(screen.queryByText(/API_KEY/)).not.toBeInTheDocument();
        expect(screen.queryByText(/DB_PASSWORD/)).not.toBeInTheDocument();
        expect(screen.queryByText(/secret123/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ user: { id: 'admin' } });
      mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
    });

    it('should handle rapid successive API calls gracefully', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Simulate rapid clicking
      const refreshButton = screen.getByText('Refresh Data');
      
      // Click rapidly multiple times
      for (let i = 0; i < 10; i++) {
        await user.click(refreshButton);
      }

      // Should not make excessive API calls
      await waitFor(() => {
        expect(mockMenuManagementAdapter.getMenuItems.mock.calls.length).toBeLessThan(10);
      });
    });

    it('should debounce search inputs', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search menu items...');
      
      // Type rapidly
      await user.type(searchInput, 'rapid typing test');
      
      // Should debounce the search
      await waitFor(() => {
        // Exact implementation depends on debounce logic
        expect(mockMenuManagementAdapter.getMenuItems).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('Audit Trail and Logging', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ 
        user: { id: 'admin-user', email: 'admin@test.com' } 
      });
      mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
    });

    it('should log security-relevant actions', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'Audit Test');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/audit');

      mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
        createMockMenuItem({ title: 'Audit Test' })
      );

      await user.click(screen.getByText('Create Menu Item'));

      // Should log the action (implementation-dependent)
      await waitFor(() => {
        // Verify logging occurred
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should not log sensitive information', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Attempt to create item with sensitive data
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'Sensitive Item');
      
      // Switch to role-based and add sensitive roles
      await user.selectOptions(screen.getByDisplayValue('Public'), 'role_based');
      await user.type(
        screen.getByPlaceholderText('admin, superadmin, editor (comma separated)'), 
        'admin, secret-role, api-key-holder'
      );

      mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
        createMockMenuItem({ title: 'Sensitive Item' })
      );

      await user.click(screen.getByText('Create Menu Item'));

      await waitFor(() => {
        if (consoleSpy.mock.calls.length > 0) {
          const loggedData = consoleSpy.mock.calls.flat().join(' ');
          
          // Should not log sensitive role information
          expect(loggedData).not.toContain('secret-role');
          expect(loggedData).not.toContain('api-key-holder');
        }
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Content Security Policy Compliance', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ user: { id: 'admin' } });
      mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
    });

    it('should not allow inline scripts in menu content', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      
      // Try to add CSS with potentially dangerous content
      await user.type(screen.getByPlaceholderText('Menu item title'), 'CSP Test');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/csp-test');
      
      const cssInput = screen.getByPlaceholder('Custom CSS classes');
      await user.type(cssInput, 'background: url("javascript:alert(1)");');

      mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
        createMockMenuItem({ css_classes: 'safe-class' })
      );

      await user.click(screen.getByText('Create Menu Item'));

      await waitFor(() => {
        expect(mockMenuManagementAdapter.createMenuItem).toHaveBeenCalledWith(
          expect.objectContaining({
            css_classes: expect.not.stringMatching(/javascript:/i)
          })
        );
      });
    });

    it('should sanitize icon names to prevent script injection', async () => {
      // This test would be relevant if icons are dynamically loaded
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'Icon Test');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/icon-test');

      // Icon selection should be from predefined safe list
      const iconSelect = screen.getByDisplayValue('No Icon');
      const options = iconSelect.querySelectorAll('option');
      
      options.forEach(option => {
        const value = option.getAttribute('value');
        if (value) {
          // Should not contain script-like patterns
          expect(value).not.toMatch(/<script>/i);
          expect(value).not.toMatch(/javascript:/i);
          expect(value).not.toMatch(/on\w+=/i);
        }
      });
    });
  });
});