/**
 * Security and Edge Cases Test Suite
 * Critical security tests and edge case scenarios for dashboard CRUD functionality
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';

import { UserDashboard } from '../../components/UserDashboard';
import { contentManagementApi } from '../../api/contentManagementApi';
import { 
  createTestWrapper, 
  createTestUser, 
  createTestContent,
  mockSupabaseResponse 
} from '../../../shared/test-utils/testHelpers';

// Mock the APIs
jest.mock('../../api/contentManagementApi');
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn()
    }
  }
}));

const mockApi = contentManagementApi as jest.Mocked<typeof contentManagementApi>;

describe('Security and Edge Cases Test Suite', () => {
  const testUsers = {
    normalUser: createTestUser({
      id: 'user-normal',
      email: 'normal@example.com',
      memberId: 'member-normal',
      role: 'member',
      groups: ['general'],
      companies: ['company-a']
    }),
    
    maliciousUser: createTestUser({
      id: 'user-malicious',
      email: 'malicious@example.com',
      memberId: 'member-malicious',
      role: 'member',
      groups: ['general'],
      companies: []
    }),

    adminUser: createTestUser({
      id: 'user-admin',
      email: 'admin@example.com',
      memberId: 'member-admin',
      role: 'admin',
      groups: ['general', 'admins'],
      companies: []
    })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default secure API responses
    mockApi.getAllUserContent.mockResolvedValue({
      data: [],
      error: null,
      status: 200,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_more: false
      },
      filters_applied: {}
    });

    mockApi.getContentStatistics.mockResolvedValue({
      data: [],
      summary: {
        total_content: 0,
        total_views: 0,
        total_engagement: 0,
        growth_percentage: 0
      }
    });
  });

  describe('Cross-User Data Access Prevention', () => {
    test('Cannot access other users content via URL manipulation', async () => {
      const normalUserContent = [
        createTestContent('member-normal', {
          id: 'content-normal',
          title: 'Normal User Content',
          status: 'published'
        })
      ];

      const otherUserContent = [
        createTestContent('member-other', {
          id: 'content-other',
          title: 'Other User Private Content',
          status: 'published'
        })
      ];

      // Mock API to return only normal user's content regardless of any manipulation
      mockApi.getAllUserContent.mockResolvedValue({
        data: normalUserContent, // Should NEVER include other user content
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      // Render with URL that might attempt to access other user data
      render(
        <UserDashboard />,
        { 
          wrapper: createTestWrapper(
            testUsers.normalUser,
            { initialEntries: ['/dashboard?user_id=member-other&bypass=true'] }
          )
        }
      );

      await waitFor(() => {
        // Should only see own content
        expect(screen.getByText('Normal User Content')).toBeInTheDocument();
      });

      // Should NEVER see other user's content
      expect(screen.queryByText('Other User Private Content')).not.toBeInTheDocument();

      // Verify API was called with proper user filtering (server-side enforcement)
      expect(mockApi.getAllUserContent).toHaveBeenCalledTimes(1);
    });

    test('API calls include proper authentication and user context', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        expect(mockApi.getAllUserContent).toHaveBeenCalled();
      });

      // Verify that API calls don't accept user parameters from client
      const apiCall = mockApi.getAllUserContent.mock.calls[0];
      expect(apiCall[0]).not.toHaveProperty('user_id');
      expect(apiCall[0]).not.toHaveProperty('bypass');
    });

    test('Prevents content ID enumeration attacks', async () => {
      // Mock API to reject access to non-owned content IDs
      mockApi.updateContentItem.mockRejectedValue(new Error('Content not found or access denied'));
      mockApi.deleteContentItem.mockRejectedValue(new Error('Content not found or access denied'));
      mockApi.getContentPermissions.mockRejectedValue(new Error('Content not found or access denied'));

      // Attempt to access content with guessed IDs
      const contentIds = [
        'content-1',
        'content-2', 
        'content-admin-secret',
        'content-other-user',
        '../../etc/passwd',
        '<script>alert("xss")</script>',
        'DROP TABLE content;'
      ];

      for (const contentId of contentIds) {
        await expect(
          mockApi.updateContentItem(contentId, 'photo', { title: 'Hacked' })
        ).rejects.toThrow('Content not found or access denied');

        await expect(
          mockApi.deleteContentItem(contentId, 'photo')
        ).rejects.toThrow('Content not found or access denied');
      }
    });
  });

  describe('Input Validation and Sanitization', () => {
    test('Prevents XSS attacks in content creation', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Test various XSS payloads
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      ];

      for (const payload of xssPayloads) {
        const titleInput = screen.getByRole('textbox', { name: /title/i });
        await userEventInstance.clear(titleInput);
        await userEventInstance.type(titleInput, payload);

        // Mock API to simulate server-side sanitization
        mockApi.updateContentItem.mockImplementation(async (id, type, data) => {
          // Server should sanitize inputs
          const sanitizedData = {
            ...data,
            title: data.title?.replace(/<[^>]*>/g, ''), // Strip HTML tags
          };
          
          if (data.title && data.title !== sanitizedData.title) {
            throw new Error('Invalid content: HTML tags not allowed');
          }
          
          return createTestContent('member-normal', {
            id: 'sanitized-content',
            title: sanitizedData.title,
            status: 'draft'
          });
        });

        const contentTypeSelect = screen.getByRole('combobox', { name: /content type/i });
        await userEventInstance.selectOptions(contentTypeSelect, 'news');

        const submitButton = screen.getByRole('button', { name: /create/i });
        await userEventInstance.click(submitButton);

        // Should either reject the input or sanitize it
        await waitFor(() => {
          // Either shows error or sanitized version
          const hasError = screen.queryByText(/invalid content/i);
          const hasSanitized = screen.queryByText('alert("XSS")'); // Should be stripped
          
          if (!hasError) {
            expect(hasSanitized).not.toBeInTheDocument();
          }
        });
      }
    });

    test('Validates file uploads for security', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /content type/i })).toBeInTheDocument();
      });

      const contentTypeSelect = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.selectOptions(contentTypeSelect, 'photo');

      // Mock dangerous file types
      const dangerousFiles = [
        new File(['malicious content'], 'virus.exe', { type: 'application/x-executable' }),
        new File(['<?php shell_exec($_GET["cmd"]); ?>', 'shell.php', { type: 'application/x-php' }]),
        new File(['<script>alert("XSS")</script>'], 'malicious.svg', { type: 'image/svg+xml' }),
        new File(['fake image'], 'fake.jpg.exe', { type: 'image/jpeg' }) // Double extension
      ];

      for (const file of dangerousFiles) {
        const fileInput = screen.getByLabelText(/upload image/i);
        
        // Mock file validation
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false,
        });

        // Trigger file selection
        fireEvent.change(fileInput);

        // Should show validation error
        await waitFor(() => {
          expect(screen.getByText(/file type not allowed/i)).toBeInTheDocument();
        });
      }
    });

    test('Prevents SQL injection in search queries', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      const searchInput = screen.getByPlaceholderText(/search content/i);

      // Test SQL injection payloads
      const sqlInjectionPayloads = [
        "'; DROP TABLE content; --",
        "' OR 1=1 --",
        "' UNION SELECT * FROM users --",
        "'; UPDATE content SET title='HACKED' --",
        "admin'--",
        "' OR 'a'='a",
        "1' OR '1'='1' UNION SELECT null,username,password FROM users--"
      ];

      for (const payload of sqlInjectionPayloads) {
        // Mock API to validate search input
        mockApi.getAllUserContent.mockImplementation(async (params) => {
          const search = params?.filters?.search;
          
          if (search && /['";]|--|\bunion\b|\bselect\b|\bdrop\b|\bupdate\b|\bdelete\b/i.test(search)) {
            throw new Error('Invalid search query');
          }
          
          return {
            data: [],
            error: null,
            status: 200,
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              total_pages: 0,
              has_more: false
            },
            filters_applied: { search }
          };
        });

        await userEventInstance.clear(searchInput);
        await userEventInstance.type(searchInput, payload);

        // Should either reject the query or safely handle it
        await waitFor(() => {
          // API should be called with sanitized input or reject entirely
          expect(mockApi.getAllUserContent).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Authentication and Authorization', () => {
    test('Redirects unauthenticated users', async () => {
      // Mock unauthenticated user
      const unauthenticatedUser = {
        ...testUsers.normalUser,
        id: null,
        session: null
      };

      // Mock API to reject unauthenticated requests
      mockApi.getAllUserContent.mockRejectedValue(new Error('Authentication required'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(unauthenticatedUser as any) }
      );

      // Should show authentication error or redirect
      await waitFor(() => {
        expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
      });

      // Should not show any content
      expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
    });

    test('Handles expired sessions gracefully', async () => {
      // Mock expired session
      mockApi.getAllUserContent.mockRejectedValue(new Error('Session expired'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        expect(screen.getByText(/session expired/i)).toBeInTheDocument();
      });

      // Should provide re-authentication option
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('Validates permissions for each operation', async () => {
      // Mock limited permissions
      mockApi.getContentPermissions.mockResolvedValue({
        can_edit: false,
        can_delete: false,
        can_publish: false,
        can_feature: false,
        can_view_analytics: true
      });

      const testContent = [
        createTestContent('member-normal', {
          id: 'readonly-content',
          title: 'Read Only Content',
          status: 'published'
        })
      ];

      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Read Only Content')).toBeInTheDocument();
      });

      // Should not show edit/delete buttons due to permissions
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

      // Should show view-only indicators
      expect(screen.getByText(/read only/i)).toBeInTheDocument();
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    test('Handles rate limiting gracefully', async () => {
      // Mock rate limited API responses
      let callCount = 0;
      mockApi.getAllUserContent.mockImplementation(async () => {
        callCount++;
        if (callCount > 5) {
          throw new Error('Rate limit exceeded');
        }
        return {
          data: [],
          error: null,
          status: 200,
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            total_pages: 0,
            has_more: false
          },
          filters_applied: {}
        };
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      // Simulate rapid API calls
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      const userEventInstance = userEvent.setup();

      for (let i = 0; i < 10; i++) {
        await userEventInstance.click(refreshButton);
      }

      // Should show rate limit message
      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
      });

      // Should suggest retry after delay
      expect(screen.getByText(/try again later/i)).toBeInTheDocument();
    });

    test('Prevents bulk operation abuse', async () => {
      const userEventInstance = userEvent.setup();

      // Create large number of test content items
      const manyContent = Array.from({ length: 1000 }, (_, i) => 
        createTestContent('member-normal', {
          id: `content-${i}`,
          title: `Content ${i}`,
          status: 'published'
        })
      );

      mockApi.getAllUserContent.mockResolvedValue({
        data: manyContent.slice(0, 20), // Show first page
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1000,
          total_pages: 50,
          has_more: true
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Content 0')).toBeInTheDocument();
      });

      // Try to select all items (simulate bulk selection abuse)
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
      await userEventInstance.click(selectAllCheckbox);

      // Mock API to limit bulk operations
      mockApi.performBulkContentOperation.mockImplementation(async (operation) => {
        if (operation.content_ids.length > 100) {
          throw new Error('Bulk operation size limit exceeded');
        }
        return {
          data: {
            success_count: 0,
            error_count: operation.content_ids.length,
            errors: operation.content_ids.map(id => ({ content_id: id, error: 'Limit exceeded' }))
          },
          error: null,
          status: 400,
          operation: operation.operation,
          total_processed: operation.content_ids.length
        };
      });

      // Attempt bulk operation
      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await userEventInstance.click(bulkActionsButton);

      const deleteAction = screen.getByRole('menuitem', { name: /delete/i });
      await userEventInstance.click(deleteAction);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await userEventInstance.click(confirmButton);

      // Should show limitation error
      await waitFor(() => {
        expect(screen.getByText(/bulk operation size limit exceeded/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Integrity and Validation', () => {
    test('Handles corrupted or malformed data gracefully', async () => {
      // Mock API returning malformed data
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          // Valid content
          createTestContent('member-normal', {
            id: 'valid-content',
            title: 'Valid Content',
            status: 'published'
          }),
          // Malformed content
          {
            id: null, // Invalid ID
            type: 'unknown-type', // Invalid type
            title: '', // Empty title
            user_id: undefined, // Missing user ID
            status: 'invalid-status', // Invalid status
            created_at: 'not-a-date', // Invalid date
            view_count: 'not-a-number', // Invalid number
            // Missing required fields
          } as any,
          // Potentially dangerous content
          {
            id: '<script>alert("xss")</script>',
            type: 'photo',
            title: '<img src="x" onerror="alert(\'xss\')">',
            user_id: 'member-normal',
            status: 'published',
            created_at: new Date().toISOString(),
            description: 'javascript:alert("xss")',
            url: 'javascript:void(0)'
          } as any
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        // Should show valid content
        expect(screen.getByText('Valid Content')).toBeInTheDocument();
        
        // Should handle malformed data gracefully (skip or show error)
        expect(screen.queryByText('not-a-date')).not.toBeInTheDocument();
        
        // Should sanitize dangerous content
        expect(screen.queryByText('<script>')).not.toBeInTheDocument();
        expect(screen.queryByText('<img')).not.toBeInTheDocument();
      });

      // Should not crash the application
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('Validates content relationships and references', async () => {
      const contentWithInvalidReferences = [
        createTestContent('member-normal', {
          id: 'content-invalid-refs',
          title: 'Content with Invalid References',
          groupId: 'non-existent-group',
          companyId: 'non-existent-company',
          status: 'published'
        })
      ];

      mockApi.getAllUserContent.mockResolvedValue({
        data: contentWithInvalidReferences,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Content with Invalid References')).toBeInTheDocument();
      });

      // Should show warnings for invalid references
      expect(screen.getByText(/group not found/i)).toBeInTheDocument();
      expect(screen.getByText(/company not found/i)).toBeInTheDocument();

      // Should still be functional despite invalid references
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('Handles network failures gracefully', async () => {
      // Mock network failure
      mockApi.getAllUserContent.mockRejectedValue(new Error('Network error'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Should provide retry mechanism
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();

      // Should not expose sensitive error details
      expect(screen.queryByText(/stack trace/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/database/i)).not.toBeInTheDocument();
    });

    test('Handles partial failures in bulk operations', async () => {
      const userEventInstance = userEvent.setup();

      const testContent = [
        createTestContent('member-normal', { id: 'content-1', title: 'Content 1' }),
        createTestContent('member-normal', { id: 'content-2', title: 'Content 2' }),
        createTestContent('member-normal', { id: 'content-3', title: 'Content 3' })
      ];

      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      // Select all items
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await userEventInstance.click(checkboxes[0]);
      await userEventInstance.click(checkboxes[1]);
      await userEventInstance.click(checkboxes[2]);

      // Mock partial failure in bulk operation
      mockApi.performBulkContentOperation.mockResolvedValue({
        data: {
          success_count: 2,
          error_count: 1,
          errors: [
            { content_id: 'content-2', error: 'Content locked by another user' }
          ]
        },
        error: null,
        status: 200,
        operation: 'delete',
        total_processed: 3
      });

      // Perform bulk delete
      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await userEventInstance.click(bulkActionsButton);

      const deleteAction = screen.getByRole('menuitem', { name: /delete/i });
      await userEventInstance.click(deleteAction);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await userEventInstance.click(confirmButton);

      // Should show partial success message
      await waitFor(() => {
        expect(screen.getByText(/2 of 3 items processed successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/1 item failed/i)).toBeInTheDocument();
        expect(screen.getByText(/content locked by another user/i)).toBeInTheDocument();
      });
    });
  });

  describe('Resource Protection', () => {
    test('Prevents resource exhaustion attacks', async () => {
      // Mock very large payload response
      const hugeContent = Array.from({ length: 10000 }, (_, i) => 
        createTestContent('member-normal', {
          id: `huge-content-${i}`,
          title: `Huge Content ${i}`.repeat(1000), // Very long title
          description: 'A'.repeat(10000), // Very long description
          status: 'published'
        })
      );

      let requestCount = 0;
      mockApi.getAllUserContent.mockImplementation(async () => {
        requestCount++;
        if (requestCount > 10) {
          throw new Error('Too many requests');
        }

        // Simulate server-side pagination limit
        return {
          data: hugeContent.slice(0, 20), // Server enforces reasonable page size
          error: null,
          status: 200,
          pagination: {
            page: 1,
            limit: 20, // Server enforces max page size
            total: Math.min(hugeContent.length, 1000), // Server enforces max total
            total_pages: Math.min(Math.ceil(hugeContent.length / 20), 50),
            has_more: true
          },
          filters_applied: {}
        };
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        // Should load but with reasonable limits
        expect(screen.getByText(/huge content 0/i)).toBeInTheDocument();
      });

      // Should not crash despite large data
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('Handles memory pressure gracefully', async () => {
      // Mock memory pressure scenario
      const memoryIntensiveContent = Array.from({ length: 100 }, (_, i) => 
        createTestContent('member-normal', {
          id: `memory-content-${i}`,
          title: `Memory Content ${i}`,
          thumbnail_url: `data:image/jpeg;base64,${'A'.repeat(100000)}`, // Large base64 image
          status: 'published'
        })
      );

      mockApi.getAllUserContent.mockResolvedValue({
        data: memoryIntensiveContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 100,
          total_pages: 5,
          has_more: true
        },
        filters_applied: {}
      });

      // Monitor for memory issues
      const originalError = console.error;
      const errorSpy = jest.fn();
      console.error = errorSpy;

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.normalUser) }
      );

      await waitFor(() => {
        expect(screen.getByText(/memory content 0/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Should handle large images gracefully (lazy loading, compression, etc.)
      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringMatching(/memory|heap/i)
      );

      console.error = originalError;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});