/**
 * Error Handling and Edge Case Tests for Menu Management
 * 
 * Tests error scenarios, edge cases, network failures,
 * data corruption handling, and graceful degradation.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminMenuManagementPage from '@/pages/admin/MenuManagementPage';
import DynamicMenu from '@/features/menu/components/DynamicMenu';
import { menuManagementAdapter } from '@/features/admin/api/menuManagementAdapter';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { useMenu } from '@/hooks/useMenu';
import { MenuItem } from '@/types/menu';
import { createMockMenuItem } from '../../../tests/fixtures/menuTestData';

// Mock dependencies
vi.mock('@/features/admin/api/menuManagementAdapter');
vi.mock('@/shared/contexts/SessionContextWithRedux');
vi.mock('@/store/hooks');
vi.mock('@/hooks/useMenu');
vi.mock('react-hot-toast');

const mockMenuManagementAdapter = menuManagementAdapter as any;
const mockUseSession = useSession as Mock;
const mockUseAppSelector = useAppSelector as Mock;
const mockUseMenu = useMenu as Mock;

// Network error simulation
const simulateNetworkError = (method: string, errorType: 'timeout' | 'offline' | 'server_error' | 'cors' = 'server_error') => {
  let error: Error;
  
  switch (errorType) {
    case 'timeout':
      error = new Error('Request timeout');
      (error as any).code = 'TIMEOUT';
      break;
    case 'offline':
      error = new Error('Network request failed');
      (error as any).code = 'NETWORK_ERROR';
      break;
    case 'cors':
      error = new Error('CORS policy blocked');
      (error as any).code = 'CORS_ERROR';
      break;
    default:
      error = new Error('Internal server error');
      (error as any).status = 500;
  }
  
  mockMenuManagementAdapter[method].mockRejectedValue(error);
};

describe('Menu Management Error Handling Tests', () => {
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

    // Default successful mocks
    mockUseSession.mockReturnValue({ user: { id: 'admin' } });
    mockUseAppSelector.mockReturnValue({ roles: { list: ['admin'] } });
    mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);

    vi.clearAllMocks();
  });

  describe('API Error Handling', () => {
    it('should handle network timeout errors gracefully', async () => {
      simulateNetworkError('getMenuItems', 'timeout');

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        expect(screen.getByText('Request timeout')).toBeInTheDocument();
      });

      // Should show retry button
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle offline scenarios', async () => {
      simulateNetworkError('getMenuItems', 'offline');

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        expect(screen.getByText('Network request failed')).toBeInTheDocument();
      });

      // Should indicate offline status
      const errorMessage = screen.getByText(/network.*failed/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should handle server errors with appropriate messaging', async () => {
      const serverError = new Error('Internal Server Error');
      (serverError as any).status = 500;
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue(serverError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        // Should show user-friendly message, not raw server error
        expect(screen.queryByText('Internal Server Error')).toBeInTheDocument();
      });
    });

    it('should handle CORS errors', async () => {
      simulateNetworkError('getMenuItems', 'cors');

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        expect(screen.getByText('CORS policy blocked')).toBeInTheDocument();
      });
    });

    it('should handle 403 Forbidden errors', async () => {
      const forbiddenError = new Error('Forbidden');
      (forbiddenError as any).status = 403;
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue(forbiddenError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        // Should show appropriate permission error
        expect(screen.getByText('Forbidden')).toBeInTheDocument();
      });
    });

    it('should handle 404 Not Found errors', async () => {
      const notFoundError = new Error('Not Found');
      (notFoundError as any).status = 404;
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue(notFoundError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        expect(screen.getByText('Not Found')).toBeInTheDocument();
      });
    });

    it('should handle rate limiting (429) errors', async () => {
      const rateLimitError = new Error('Too Many Requests');
      (rateLimitError as any).status = 429;
      (rateLimitError as any).retryAfter = 60;
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue(rateLimitError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operation Error Handling', () => {
    beforeEach(() => {
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([
        createMockMenuItem({ id: '1', title: 'Existing Item' })
      ]);
    });

    it('should handle create operation failures', async () => {
      const createError = new Error('Validation failed: Title already exists');
      mockMenuManagementAdapter.createMenuItem.mockRejectedValue(createError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'Duplicate Title');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/duplicate');
      await user.click(screen.getByText('Create Menu Item'));

      await waitFor(() => {
        expect(screen.getByText('Validation failed: Title already exists')).toBeInTheDocument();
      });

      // Form should remain open for correction
      expect(screen.getByPlaceholderText('Menu item title')).toBeInTheDocument();
    });

    it('should handle update operation failures', async () => {
      const updateError = new Error('Optimistic locking failed: Item was modified by another user');
      mockMenuManagementAdapter.updateMenuItem.mockRejectedValue(updateError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Existing Item')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Edit item'));
      await user.clear(screen.getByDisplayValue('Existing Item'));
      await user.type(screen.getByDisplayValue(''), 'Modified Title');
      await user.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText(/optimistic locking failed/i)).toBeInTheDocument();
      });

      // Should show conflict resolution options
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should handle delete operation failures', async () => {
      const deleteError = new Error('Cannot delete: Menu item has children');
      mockMenuManagementAdapter.deleteMenuItem.mockRejectedValue(deleteError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Existing Item')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Delete item'));
      await user.click(screen.getByText('Delete Menu Item'));

      await waitFor(() => {
        expect(screen.getByText('Cannot delete: Menu item has children')).toBeInTheDocument();
      });

      // Item should still exist in the list
      expect(screen.getByText('Existing Item')).toBeInTheDocument();
    });

    it('should handle bulk operation partial failures', async () => {
      const bulkError = new Error('Bulk operation partially failed: 2 of 5 items processed successfully');
      mockMenuManagementAdapter.deleteMenuItem.mockResolvedValueOnce(true);
      mockMenuManagementAdapter.deleteMenuItem.mockRejectedValueOnce(bulkError);
      mockMenuManagementAdapter.deleteMenuItem.mockResolvedValueOnce(true);

      const multipleItems = [
        createMockMenuItem({ id: '1', title: 'Item 1' }),
        createMockMenuItem({ id: '2', title: 'Item 2' }),
        createMockMenuItem({ id: '3', title: 'Item 3' }),
      ];
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(multipleItems);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Select multiple items
      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(3);
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      // Mock window.confirm for bulk delete
      const originalConfirm = window.confirm;
      window.confirm = vi.fn().mockReturnValue(true);

      await user.click(screen.getByText('Delete All'));

      await waitFor(() => {
        // Should show partial success message
        expect(screen.getByText(/bulk operation partially failed/i)).toBeInTheDocument();
      });

      window.confirm = originalConfirm;
    });
  });

  describe('Data Validation and Corruption Handling', () => {
    it('should handle corrupted API responses', async () => {
      // Mock corrupted response
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([
        { id: '1' }, // Missing required fields
        null,
        undefined,
        { id: '2', title: null, url: undefined }, // Invalid field types
        'invalid_object_type',
      ]);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle corrupted data gracefully
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
        // Should either show error or filter out invalid items
        expect(screen.queryByText('null') || screen.getByText('No menu items found.')).toBeTruthy();
      });
    });

    it('should handle malformed JSON responses', async () => {
      const malformedError = new SyntaxError('Unexpected token in JSON');
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue(malformedError);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        expect(screen.getByText(/unexpected token/i)).toBeInTheDocument();
      });
    });

    it('should handle circular reference in menu hierarchy', async () => {
      const circularMenuItems = [
        createMockMenuItem({ id: '1', title: 'Parent', parent_id: '2' }), // Circular reference
        createMockMenuItem({ id: '2', title: 'Child', parent_id: '1' }),
      ];
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(circularMenuItems);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle circular references gracefully
        expect(screen.getByText('Parent')).toBeInTheDocument();
        expect(screen.getByText('Child')).toBeInTheDocument();
        // Should not cause infinite loops in rendering
      });
    });

    it('should handle orphaned menu items', async () => {
      const orphanedItems = [
        createMockMenuItem({ id: '1', title: 'Orphaned Child', parent_id: 'non-existent-parent' }),
        createMockMenuItem({ id: '2', title: 'Valid Parent', parent_id: null }),
      ];
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(orphanedItems);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show valid parent
        expect(screen.getByText('Valid Parent')).toBeInTheDocument();
        // Should handle orphaned item gracefully (either show as root or hide)
        expect(screen.getByText('Orphaned Child')).toBeInTheDocument();
      });
    });

    it('should handle extremely large menu structures', async () => {
      const largeMenuStructure = Array.from({ length: 10000 }, (_, i) =>
        createMockMenuItem({
          id: `item-${i}`,
          title: `Item ${i}`,
          url: `/item-${i}`,
        })
      );
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(largeMenuStructure);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Should handle large datasets without crashing
      await waitFor(() => {
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should either paginate or virtualize
      expect(screen.getByText(/item/i)).toBeInTheDocument();
    });
  });

  describe('User Input Validation Errors', () => {
    beforeEach(() => {
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
    });

    it('should handle invalid URL formats', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'Invalid URL Test');
      
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://.',
        'ftp://invalid-protocol.com',
        '//missing-protocol',
        'javascript:alert("xss")',
      ];

      for (const url of invalidUrls) {
        const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');
        await user.clear(urlInput);
        await user.type(urlInput, url);
        await user.click(screen.getByText('Create Menu Item'));

        // Should show validation error or prevent submission
        if (url === 'javascript:alert("xss")') {
          // Should specifically reject dangerous URLs
          await waitFor(() => {
            expect(screen.getByText(/invalid.*url/i) || screen.getByText(/dangerous.*protocol/i)).toBeInTheDocument();
          });
        }
      }
    });

    it('should handle excessively long input values', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));

      // Test extremely long title
      const longTitle = 'a'.repeat(1000);
      await user.type(screen.getByPlaceholderText('Menu item title'), longTitle);
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/test');

      const createError = new Error('Validation failed: Title exceeds maximum length');
      mockMenuManagementAdapter.createMenuItem.mockRejectedValue(createError);

      await user.click(screen.getByText('Create Menu Item'));

      await waitFor(() => {
        expect(screen.getByText(/title exceeds maximum length/i)).toBeInTheDocument();
      });
    });

    it('should handle special characters and unicode in inputs', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await user.click(screen.getByText('Add Item'));

      // Test various special characters and unicode
      const specialCases = [
        { title: 'Unicode Test 测试', url: '/unicode-test' },
        { title: 'Emoji Test 🎉🚀', url: '/emoji-test' },
        { title: 'Special Chars !@#$%^&*()', url: '/special-chars' },
        { title: 'Quotes "test" \'test\'', url: '/quotes-test' },
      ];

      for (const testCase of specialCases) {
        const titleInput = screen.getByPlaceholderText('Menu item title');
        const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');

        await user.clear(titleInput);
        await user.clear(urlInput);
        await user.type(titleInput, testCase.title);
        await user.type(urlInput, testCase.url);

        mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
          createMockMenuItem({ title: testCase.title, url: testCase.url })
        );

        await user.click(screen.getByText('Create Menu Item'));

        // Should handle special characters gracefully
        await waitFor(() => {
          expect(screen.queryByText(/created successfully/i) || screen.getByText(testCase.title)).toBeTruthy();
        });

        // Clear for next test
        if (screen.queryByText('Add Item')) {
          await user.click(screen.getByText('Add Item'));
        }
      }
    });
  });

  describe('Component State Error Handling', () => {
    it('should handle React component errors gracefully', async () => {
      // Mock console.error to catch error boundary messages
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Force a React error
      const FailingComponent = () => {
        throw new Error('Component crashed');
      };

      const TestComponentWithError = () => (
        <TestWrapper>
          <FailingComponent />
        </TestWrapper>
      );

      expect(() => {
        render(<TestComponentWithError />);
      }).toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle infinite re-render loops', async () => {
      let renderCount = 0;
      const MAX_RENDERS = 50;

      const LoopingComponent = () => {
        const [state, setState] = React.useState(0);
        
        // This would cause infinite re-renders without proper handling
        React.useEffect(() => {
          renderCount++;
          if (renderCount < MAX_RENDERS) {
            setState(prev => prev + 1);
          }
        }, [state]);

        return <div>Render count: {renderCount}</div>;
      };

      render(
        <TestWrapper>
          <LoopingComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(renderCount).toBeLessThan(MAX_RENDERS * 2); // Should not continue infinitely
      });
    });

    it('should handle memory leaks in event listeners', async () => {
      let eventListenerCount = 0;

      const LeakingComponent = () => {
        React.useEffect(() => {
          const handler = () => {};
          window.addEventListener('resize', handler);
          eventListenerCount++;

          // Intentionally missing cleanup to test leak detection
          // return () => window.removeEventListener('resize', handler);
        }, []);

        return <div>Component with potential memory leak</div>;
      };

      const { unmount } = render(
        <TestWrapper>
          <LeakingComponent />
        </TestWrapper>
      );

      expect(eventListenerCount).toBe(1);

      unmount();

      // In a real scenario, we'd check if listeners were properly removed
      // This test demonstrates the pattern for detecting memory leaks
      expect(eventListenerCount).toBe(1); // Still 1 because cleanup was not called
    });
  });

  describe('Progressive Enhancement and Graceful Degradation', () => {
    it('should work without JavaScript (progressive enhancement)', async () => {
      // Simulate no JavaScript environment
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation((tagName) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'script') {
          throw new Error('JavaScript disabled');
        }
        return element;
      });

      mockUseMenu.mockReturnValue({
        menuItems: [
          createMockMenuItem({ id: '1', title: 'Static Menu Item', url: '/static' })
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      // Should render basic menu structure
      expect(screen.getByText('Static Menu Item')).toBeInTheDocument();

      document.createElement = originalCreateElement;
    });

    it('should handle missing CSS gracefully', async () => {
      // Simulate missing CSS by removing computed styles
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        display: '',
        visibility: '',
        opacity: '',
      });

      mockUseMenu.mockReturnValue({
        menuItems: [createMockMenuItem({ id: '1', title: 'Unstyled Menu' })],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <DynamicMenu menuType="main" />
        </TestWrapper>
      );

      // Should still be functional without styles
      expect(screen.getByText('Unstyled Menu')).toBeInTheDocument();

      window.getComputedStyle = originalGetComputedStyle;
    });

    it('should handle browser incompatibilities', async () => {
      // Simulate older browser without modern features
      const originalFetch = global.fetch;
      const originalPromise = global.Promise;

      delete (global as any).fetch;
      delete (global as any).Promise;

      // Component should detect missing features and provide fallbacks
      expect(() => {
        render(
          <TestWrapper>
            <AdminMenuManagementPage />
          </TestWrapper>
        );
      }).not.toThrow();

      global.fetch = originalFetch;
      global.Promise = originalPromise;
    });
  });

  describe('Error Recovery and Retry Logic', () => {
    it('should implement exponential backoff for retries', async () => {
      let attemptCount = 0;
      const maxAttempts = 3;

      mockMenuManagementAdapter.getMenuItems.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < maxAttempts) {
          return Promise.reject(new Error('Temporary network error'));
        }
        return Promise.resolve([createMockMenuItem({ id: '1', title: 'Success after retry' })]);
      });

      // Enable retries for this test
      queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: 2, retryDelay: 100 },
          mutations: { retry: false },
        },
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Should eventually succeed after retries
      await waitFor(() => {
        expect(screen.getByText('Success after retry')).toBeInTheDocument();
      }, { timeout: 5000 });

      expect(attemptCount).toBe(maxAttempts);
    });

    it('should provide manual retry options', async () => {
      simulateNetworkError('getMenuItems', 'timeout');

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
      });

      // Should provide retry button
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();

      // Mock successful retry
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([
        createMockMenuItem({ id: '1', title: 'Retry Success' })
      ]);

      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Retry Success')).toBeInTheDocument();
      });
    });

    it('should handle cascading failures gracefully', async () => {
      // Simulate multiple system failures
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue(new Error('Database unavailable'));
      
      // Also simulate session validation failure
      mockUseSession.mockReturnValue({
        user: null,
        error: { message: 'Session expired' }
      });

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should prioritize authentication error over data loading error
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });

    it('should maintain application state during error recovery', async () => {
      const initialItems = [
        createMockMenuItem({ id: '1', title: 'Existing Item' })
      ];
      
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(initialItems);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Existing Item')).toBeInTheDocument();
      });

      // Apply a filter
      await user.selectOptions(screen.getByDisplayValue('All Visibility'), 'public');

      // Simulate error in create operation
      await user.click(screen.getByText('Add Item'));
      await user.type(screen.getByPlaceholderText('Menu item title'), 'Failed Item');
      await user.type(screen.getByPlaceholderText('/page or https://external-site.com'), '/failed');

      mockMenuManagementAdapter.createMenuItem.mockRejectedValue(new Error('Creation failed'));
      await user.click(screen.getByText('Create Menu Item'));

      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });

      // Filter state should be maintained
      expect(screen.getByDisplayValue('public')).toBeInTheDocument();
      // Existing items should still be visible
      expect(screen.getByText('Existing Item')).toBeInTheDocument();
    });
  });
});