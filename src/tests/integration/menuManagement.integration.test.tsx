/**
 * Integration Tests for Menu Management System
 * 
 * Tests the complete workflow from database to UI components,
 * including data flow, mutations, and user interactions.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DragDropContext } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

import AdminMenuManagementPage from '@/pages/admin/MenuManagementPage';
import { menuManagementAdapter } from '@/features/admin/api/menuManagementAdapter';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { MenuItem, MenuType, MenuVisibility } from '@/types/menu';
import { mockMenuItems, createMockMenuItem } from '../../../tests/fixtures/menuTestData';

// Mock dependencies
vi.mock('@/features/admin/api/menuManagementAdapter');
vi.mock('@/shared/contexts/SessionContextWithRedux');
vi.mock('@/store/hooks');
vi.mock('react-hot-toast');
vi.mock('react-beautiful-dnd', async () => {
  const actual = await vi.importActual('react-beautiful-dnd');
  return {
    ...actual,
    DragDropContext: ({ children, onDragEnd }: any) => children,
    Droppable: ({ children }: any) => children({ innerRef: vi.fn(), draggableProps: {}, placeholder: null }),
    Draggable: ({ children }: any) => children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {}, isDragging: false }, {}),
  };
});

const mockMenuManagementAdapter = menuManagementAdapter as any;
const mockUseSession = useSession as Mock;
const mockUseAppSelector = useAppSelector as Mock;
const mockToast = toast as any;

describe('Menu Management Integration Tests', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  const mockUser = {
    id: 'admin-user',
    email: 'admin@test.com',
  };

  const mockAuthState = {
    roles: {
      list: ['admin', 'superadmin'],
    },
  };

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
    
    mockUseSession.mockReturnValue({ user: mockUser });
    mockUseAppSelector.mockReturnValue(mockAuthState);
    
    // Reset all adapter mocks
    Object.keys(mockMenuManagementAdapter).forEach(key => {
      if (typeof mockMenuManagementAdapter[key] === 'function') {
        mockMenuManagementAdapter[key].mockReset();
      }
    });

    mockToast.success = vi.fn();
    mockToast.error = vi.fn();
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('Complete CRUD Workflow', () => {
    it('should complete full create-read-update-delete workflow', async () => {
      // Setup - Mock initial empty state
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
      
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Verify initial load
      expect(mockMenuManagementAdapter.getMenuItems).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('No menu items found.')).toBeInTheDocument();
      });

      // CREATE: Add new menu item
      const createButton = screen.getByText('Add Item');
      await user.click(createButton);

      // Fill out form
      const titleInput = screen.getByPlaceholderText('Menu item title');
      const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');
      const descriptionTextarea = screen.getByPlaceholderText('Optional description for admin reference');

      await user.type(titleInput, 'Test Menu Item');
      await user.type(urlInput, '/test-page');
      await user.type(descriptionTextarea, 'Test description');

      // Mock successful creation
      const newMenuItem = createMockMenuItem({
        id: 'new-item-1',
        title: 'Test Menu Item',
        url: '/test-page',
        description: 'Test description',
      });
      mockMenuManagementAdapter.createMenuItem.mockResolvedValue(newMenuItem);
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([newMenuItem]);

      // Submit form
      const submitButton = screen.getByText('Create Menu Item');
      await user.click(submitButton);

      // Verify creation
      await waitFor(() => {
        expect(mockMenuManagementAdapter.createMenuItem).toHaveBeenCalledWith({
          title: 'Test Menu Item',
          url: '/test-page',
          description: 'Test description',
          menu_type: 'main',
          parent_id: null,
          sort_order: 0,
          is_enabled: true,
          target: '_self',
          icon: null,
          css_classes: null,
          visibility: 'public',
          required_roles: null,
          is_external: false,
        });
      });

      // READ: Verify item appears in list
      await waitFor(() => {
        expect(screen.getByText('Test Menu Item')).toBeInTheDocument();
      });

      // UPDATE: Edit the item
      const editButton = screen.getByTitle('Edit item');
      await user.click(editButton);

      const editTitleInput = screen.getByDisplayValue('Test Menu Item');
      await user.clear(editTitleInput);
      await user.type(editTitleInput, 'Updated Menu Item');

      // Mock successful update
      const updatedMenuItem = { ...newMenuItem, title: 'Updated Menu Item' };
      mockMenuManagementAdapter.updateMenuItem.mockResolvedValue(updatedMenuItem);
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([updatedMenuItem]);

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Verify update
      await waitFor(() => {
        expect(mockMenuManagementAdapter.updateMenuItem).toHaveBeenCalledWith({
          id: 'new-item-1',
          title: 'Updated Menu Item',
          url: '/test-page',
          description: 'Test description',
          parent_id: null,
          sort_order: 0,
          is_enabled: true,
          target: '_self',
          icon: null,
          css_classes: null,
          visibility: 'public',
          required_roles: null,
          is_external: false,
        });
      });

      // DELETE: Remove the item
      mockMenuManagementAdapter.deleteMenuItem.mockResolvedValue(true);
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);

      const deleteButton = screen.getByTitle('Delete item');
      await user.click(deleteButton);

      // Confirm deletion
      const confirmDeleteButton = screen.getByText('Delete Menu Item');
      await user.click(confirmDeleteButton);

      // Verify deletion
      await waitFor(() => {
        expect(mockMenuManagementAdapter.deleteMenuItem).toHaveBeenCalledWith('new-item-1');
      });
    });
  });

  describe('Menu Type Tab Navigation', () => {
    it('should filter items by menu type when switching tabs', async () => {
      const mainMenuItems = [
        createMockMenuItem({ id: '1', title: 'Main Item', menu_type: 'main' }),
      ];
      const footerMenuItems = [
        createMockMenuItem({ id: '2', title: 'Footer Item', menu_type: 'footer' }),
      ];
      const allMenuItems = [...mainMenuItems, ...footerMenuItems];

      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(allMenuItems);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Initially should show main menu
      await waitFor(() => {
        expect(screen.getByText('Main Item')).toBeInTheDocument();
        expect(screen.queryByText('Footer Item')).not.toBeInTheDocument();
      });

      // Switch to footer menu
      const footerTab = screen.getByText('Footer Menu');
      await user.click(footerTab);

      await waitFor(() => {
        expect(screen.queryByText('Main Item')).not.toBeInTheDocument();
        expect(screen.getByText('Footer Item')).toBeInTheDocument();
      });

      // Switch to mobile menu (empty)
      const mobileTab = screen.getByText('Mobile Menu');
      await user.click(mobileTab);

      await waitFor(() => {
        expect(screen.getByText('No menu items found.')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    const testMenuItems = [
      createMockMenuItem({ id: '1', title: 'Community Events', url: '/events', visibility: 'public' }),
      createMockMenuItem({ id: '2', title: 'Admin Panel', url: '/admin', visibility: 'admin' }),
      createMockMenuItem({ id: '3', title: 'User Profile', url: '/profile', visibility: 'authenticated', is_enabled: false }),
    ];

    beforeEach(() => {
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(testMenuItems);
    });

    it('should filter items by search term', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Community Events')).toBeInTheDocument();
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
        expect(screen.getByText('User Profile')).toBeInTheDocument();
      });

      // Search for "admin"
      const searchInput = screen.getByPlaceholderText('Search menu items...');
      await user.type(searchInput, 'admin');

      await waitFor(() => {
        expect(screen.queryByText('Community Events')).not.toBeInTheDocument();
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
        expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
      });
    });

    it('should filter items by visibility', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Filter by admin visibility
      const visibilityFilter = screen.getByDisplayValue('All Visibility');
      await user.selectOptions(visibilityFilter, 'admin');

      await waitFor(() => {
        expect(screen.queryByText('Community Events')).not.toBeInTheDocument();
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
        expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
      });
    });

    it('should filter items by enabled status', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Filter by disabled status
      const enabledFilter = screen.getByDisplayValue('All Status');
      await user.selectOptions(enabledFilter, 'false');

      await waitFor(() => {
        expect(screen.queryByText('Community Events')).not.toBeInTheDocument();
        expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
        expect(screen.getByText('User Profile')).toBeInTheDocument();
      });
    });

    it('should combine multiple filters', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      // Apply search and visibility filter
      const searchInput = screen.getByPlaceholderText('Search menu items...');
      const visibilityFilter = screen.getByDisplayValue('All Visibility');

      await user.type(searchInput, 'profile');
      await user.selectOptions(visibilityFilter, 'authenticated');

      await waitFor(() => {
        expect(screen.queryByText('Community Events')).not.toBeInTheDocument();
        expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
        expect(screen.getByText('User Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Operations', () => {
    const testMenuItems = [
      createMockMenuItem({ id: '1', title: 'Item 1', is_enabled: true }),
      createMockMenuItem({ id: '2', title: 'Item 2', is_enabled: false }),
      createMockMenuItem({ id: '3', title: 'Item 3', is_enabled: true }),
    ];

    beforeEach(() => {
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(testMenuItems);
    });

    it('should perform bulk enable operation', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      // Select multiple items
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Item 1
      await user.click(checkboxes[2]); // Item 2

      // Bulk enable
      mockMenuManagementAdapter.toggleMenuItemStatus.mockResolvedValue(
        createMockMenuItem({ is_enabled: true })
      );

      const enableAllButton = screen.getByText('Enable All');
      await user.click(enableAllButton);

      // Verify only disabled item was toggled
      await waitFor(() => {
        expect(mockMenuManagementAdapter.toggleMenuItemStatus).toHaveBeenCalledTimes(1);
        expect(mockMenuManagementAdapter.toggleMenuItemStatus).toHaveBeenCalledWith('2', true);
      });
    });

    it('should perform bulk delete operation', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      // Select items
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Item 1
      await user.click(checkboxes[3]); // Item 3

      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = vi.fn().mockReturnValue(true);

      mockMenuManagementAdapter.deleteMenuItem.mockResolvedValue(true);

      const deleteAllButton = screen.getByText('Delete All');
      await user.click(deleteAllButton);

      await waitFor(() => {
        expect(mockMenuManagementAdapter.deleteMenuItem).toHaveBeenCalledTimes(2);
        expect(mockMenuManagementAdapter.deleteMenuItem).toHaveBeenCalledWith('1');
        expect(mockMenuManagementAdapter.deleteMenuItem).toHaveBeenCalledWith('3');
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Drag and Drop Reordering', () => {
    const testMenuItems = [
      createMockMenuItem({ id: '1', title: 'Item 1', sort_order: 0 }),
      createMockMenuItem({ id: '2', title: 'Item 2', sort_order: 1 }),
      createMockMenuItem({ id: '3', title: 'Item 3', sort_order: 2 }),
    ];

    it('should reorder items via drag and drop', async () => {
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(testMenuItems);
      mockMenuManagementAdapter.reorderMenuItems.mockResolvedValue(true);

      const MockDragDropContext = ({ children, onDragEnd }: any) => {
        // Simulate drag and drop by calling onDragEnd directly
        React.useEffect(() => {
          if (onDragEnd) {
            // Simulate moving first item to second position
            setTimeout(() => {
              onDragEnd({
                source: { index: 0 },
                destination: { index: 1 },
                draggableId: '1',
              });
            }, 100);
          }
        }, [onDragEnd]);
        
        return children;
      };

      // Mock DragDropContext for this test
      vi.mocked(DragDropContext).mockImplementation(MockDragDropContext as any);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockMenuManagementAdapter.reorderMenuItems).toHaveBeenCalledWith([
          { id: '2', order_index: 0, parent_id: null },
          { id: '1', order_index: 1, parent_id: null },
          { id: '3', order_index: 2, parent_id: null },
        ]);
      });
    });
  });

  describe('Menu Preview Functionality', () => {
    it('should show correct preview for different menu types', async () => {
      const testMenuItems = [
        createMockMenuItem({ id: '1', title: 'Main Item', menu_type: 'main', is_enabled: true }),
      ];
      
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(testMenuItems);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Menu Preview')).toBeInTheDocument();
        expect(screen.getByText('Main Item')).toBeInTheDocument();
      });

      // Switch to footer and verify preview changes
      const footerTab = screen.getByText('Footer Menu');
      await user.click(footerTab);

      await waitFor(() => {
        expect(screen.getByText('Footer Menu Preview')).toBeInTheDocument();
        expect(screen.getByText('No enabled menu items')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation and Edge Cases', () => {
    beforeEach(() => {
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
    });

    it('should validate required fields', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      const createButton = screen.getByText('Add Item');
      await user.click(createButton);

      // Try to submit without required fields
      const submitButton = screen.getByText('Create Menu Item');
      await user.click(submitButton);

      // Should show validation message
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Title and URL are required');
      });
    });

    it('should detect external URLs automatically', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      const createButton = screen.getByText('Add Item');
      await user.click(createButton);

      const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');
      await user.type(urlInput, 'https://external-site.com');

      await waitFor(() => {
        expect(screen.getByText('External link detected')).toBeInTheDocument();
      });
    });

    it('should handle role-based visibility configuration', async () => {
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      const createButton = screen.getByText('Add Item');
      await user.click(createButton);

      // Select role-based visibility
      const visibilitySelect = screen.getByDisplayValue('Public');
      await user.selectOptions(visibilitySelect, 'role_based');

      await waitFor(() => {
        expect(screen.getByPlaceholderText('admin, superadmin, editor (comma separated)')).toBeInTheDocument();
      });

      // Add roles
      const rolesInput = screen.getByPlaceholderText('admin, superadmin, editor (comma separated)');
      await user.type(rolesInput, 'admin, editor');

      const titleInput = screen.getByPlaceholderText('Menu item title');
      const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');
      await user.type(titleInput, 'Role-based Item');
      await user.type(urlInput, '/admin-only');

      mockMenuManagementAdapter.createMenuItem.mockResolvedValue(
        createMockMenuItem({ id: 'role-based-item' })
      );

      const submitButton = screen.getByText('Create Menu Item');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMenuManagementAdapter.createMenuItem).toHaveBeenCalledWith(
          expect.objectContaining({
            visibility: 'role_based',
            required_roles: ['admin', 'editor'],
          })
        );
      });
    });
  });

  describe('Statistics and Quick Actions', () => {
    it('should display accurate statistics', async () => {
      const testMenuItems = [
        createMockMenuItem({ id: '1', is_enabled: true, visibility: 'public', parent_id: null }),
        createMockMenuItem({ id: '2', is_enabled: false, visibility: 'admin', parent_id: '1' }),
        createMockMenuItem({ id: '3', is_enabled: true, visibility: 'authenticated', parent_id: null }),
      ];
      
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(testMenuItems);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total items
        expect(screen.getByText('2')).toBeInTheDocument(); // Enabled items
        expect(screen.getByText('2')).toBeInTheDocument(); // Top level items
        expect(screen.getByText('1')).toBeInTheDocument(); // Sub items
      });
    });

    it('should export menu structure', async () => {
      const testMenuItems = [
        createMockMenuItem({ id: '1', title: 'Test Item' }),
      ];
      
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue(testMenuItems);

      // Mock URL.createObjectURL and document.createElement
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const mockClick = vi.fn();
      const mockLink = { href: '', download: '', click: mockClick };

      global.URL.createObjectURL = mockCreateObjectURL;
      global.document.createElement = vi.fn().mockReturnValue(mockLink);

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      const exportButton = screen.getByText('Export main Menu');
      await user.click(exportButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockLink.download).toMatch(/main-menu-\d{4}-\d{2}-\d{2}\.json/);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockMenuManagementAdapter.getMenuItems.mockRejectedValue(
        new Error('Database connection failed')
      );

      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Menu')).toBeInTheDocument();
        expect(screen.getByText('Database connection failed')).toBeInTheDocument();
      });

      // Test retry functionality
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('No menu items found.')).toBeInTheDocument();
      });
    });

    it('should handle permission denied', async () => {
      mockUseAppSelector.mockReturnValue({
        roles: { list: ['user'] } // Non-admin user
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
    });

    it('should handle create/update/delete failures', async () => {
      mockMenuManagementAdapter.getMenuItems.mockResolvedValue([]);
      
      render(
        <TestWrapper>
          <AdminMenuManagementPage />
        </TestWrapper>
      );

      const createButton = screen.getByText('Add Item');
      await user.click(createButton);

      const titleInput = screen.getByPlaceholderText('Menu item title');
      const urlInput = screen.getByPlaceholderText('/page or https://external-site.com');
      await user.type(titleInput, 'Test Item');
      await user.type(urlInput, '/test');

      mockMenuManagementAdapter.createMenuItem.mockRejectedValue(
        new Error('Validation failed')
      );

      const submitButton = screen.getByText('Create Menu Item');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Validation failed');
      });
    });
  });
});