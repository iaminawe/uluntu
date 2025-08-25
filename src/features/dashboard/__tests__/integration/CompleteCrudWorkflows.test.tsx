/**
 * Complete CRUD Workflows Integration Tests
 * End-to-end testing of Create, Read, Update, Delete operations in the dashboard
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

describe('Complete CRUD Workflows Integration Tests', () => {
  const testUser = createTestUser({
    id: 'user-crud-test',
    email: 'crud@example.com',
    memberId: 'member-crud',
    role: 'member',
    groups: ['general', 'test-group'],
    companies: ['test-company']
  });

  let mockContent: any[];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize mock content
    mockContent = [
      createTestContent('member-crud', {
        id: 'content-1',
        type: 'photo',
        title: 'Test Photo',
        status: 'published'
      }),
      createTestContent('member-crud', {
        id: 'content-2',
        type: 'event',
        title: 'Test Event',
        status: 'draft'
      })
    ];

    // Default API responses
    mockApi.getAllUserContent.mockResolvedValue({
      data: mockContent,
      error: null,
      status: 200,
      pagination: {
        page: 1,
        limit: 20,
        total: mockContent.length,
        total_pages: 1,
        has_more: false
      },
      filters_applied: {}
    });

    mockApi.getContentStatistics.mockResolvedValue({
      data: [],
      summary: {
        total_content: mockContent.length,
        total_views: 100,
        total_engagement: 20,
        growth_percentage: 5.2
      }
    });

    mockApi.getContentPermissions.mockResolvedValue({
      can_edit: true,
      can_delete: true,
      can_publish: true,
      can_feature: true,
      can_view_analytics: true
    });
  });

  describe('Create Operations', () => {
    test('Complete content creation workflow', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
      });

      // Step 1: Start content creation
      const createButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(createButton);

      // Step 2: Fill out creation form
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Select content type
      const contentTypeSelect = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.selectOptions(contentTypeSelect, 'news');

      // Fill in basic information
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.type(titleInput, 'New Article Title');

      const descriptionInput = screen.getByRole('textbox', { name: /description/i });
      await userEventInstance.type(descriptionInput, 'This is a test article description.');

      // Select company association
      const companySelect = screen.getByRole('combobox', { name: /company/i });
      await userEventInstance.selectOptions(companySelect, 'test-company');

      // Step 3: Mock successful creation
      const newContent = createTestContent('member-crud', {
        id: 'content-new',
        type: 'news',
        title: 'New Article Title',
        description: 'This is a test article description.',
        companyId: 'test-company',
        status: 'draft'
      });

      mockApi.updateContentItem.mockResolvedValue(newContent);

      // Update mock to include new content
      const updatedContent = [...mockContent, newContent];
      mockApi.getAllUserContent.mockResolvedValue({
        data: updatedContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: updatedContent.length,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      // Step 4: Submit the form
      const submitButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(submitButton);

      // Step 5: Verify creation success
      await waitFor(() => {
        expect(mockApi.updateContentItem).toHaveBeenCalledWith(
          'content-new',
          'news',
          expect.objectContaining({
            title: 'New Article Title',
            description: 'This is a test article description.',
            companyId: 'test-company'
          })
        );
      });

      // Step 6: Verify new content appears in list
      await waitFor(() => {
        expect(screen.getByText('New Article Title')).toBeInTheDocument();
      });

      // Step 7: Verify success notification
      expect(screen.getByText(/content created successfully/i)).toBeInTheDocument();
    });

    test('Create content with validation errors', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Try to submit without required fields
      const submitButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Fill in title but leave content type unselected
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.type(titleInput, 'Test Title');

      await userEventInstance.click(submitButton);

      // Should show content type validation error
      await waitFor(() => {
        expect(screen.getByText(/content type is required/i)).toBeInTheDocument();
      });

      // Verify no API call was made
      expect(mockApi.updateContentItem).not.toHaveBeenCalled();
    });

    test('Create content with API error handling', async () => {
      const userEventInstance = userEvent.setup();

      mockApi.updateContentItem.mockRejectedValue(new Error('Server error'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(createButton);

      // Fill out form
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
      });

      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.type(titleInput, 'Test Title');

      const contentTypeSelect = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.selectOptions(contentTypeSelect, 'news');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to create content/i)).toBeInTheDocument();
      });

      // Should not add content to list
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });
  });

  describe('Read Operations', () => {
    test('Display and filter user content correctly', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Should load and display all user content
      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Verify API was called correctly
      expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
        expect.objectContaining({
          // Should include user filtering parameters
          filters: expect.any(Object)
        })
      );
    });

    test('Search functionality works correctly', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
      });

      // Mock filtered search results
      mockApi.getAllUserContent.mockResolvedValue({
        data: [mockContent[0]], // Only photo content
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: { search: 'Photo' }
      });

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search content/i);
      await userEventInstance.type(searchInput, 'Photo');

      // Should trigger API call with search filter
      await waitFor(() => {
        expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              search: 'Photo'
            })
          })
        );
      });

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
        expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
      });
    });

    test('Pagination works correctly', async () => {
      const userEventInstance = userEvent.setup();

      // Mock large dataset with pagination
      const manyItems = Array.from({ length: 30 }, (_, i) => 
        createTestContent('member-crud', {
          id: `content-${i}`,
          type: 'photo',
          title: `Photo ${i}`,
          status: 'published'
        })
      );

      mockApi.getAllUserContent.mockResolvedValue({
        data: manyItems.slice(0, 20), // First page
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 30,
          total_pages: 2,
          has_more: true
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Should show first 20 items
      await waitFor(() => {
        expect(screen.getByText('Photo 0')).toBeInTheDocument();
        expect(screen.getByText('Photo 19')).toBeInTheDocument();
      });

      // Should show pagination controls
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();

      // Mock second page
      mockApi.getAllUserContent.mockResolvedValue({
        data: manyItems.slice(20, 30), // Second page
        error: null,
        status: 200,
        pagination: {
          page: 2,
          limit: 20,
          total: 30,
          total_pages: 2,
          has_more: false
        },
        filters_applied: {}
      });

      // Click next page
      const nextButton = screen.getByRole('button', { name: /next page/i });
      await userEventInstance.click(nextButton);

      // Should show second page items
      await waitFor(() => {
        expect(screen.getByText('Photo 20')).toBeInTheDocument();
        expect(screen.getByText('Photo 29')).toBeInTheDocument();
      });

      // Should not show first page items
      expect(screen.queryByText('Photo 0')).not.toBeInTheDocument();
    });
  });

  describe('Update Operations', () => {
    test('Complete content editing workflow', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
      });

      // Step 1: Start editing
      const editButton = screen.getByRole('button', { name: /edit.*test photo/i });
      await userEventInstance.click(editButton);

      // Step 2: Edit form should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Step 3: Modify content
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.clear(titleInput);
      await userEventInstance.type(titleInput, 'Updated Photo Title');

      const descriptionInput = screen.getByRole('textbox', { name: /description/i });
      await userEventInstance.type(descriptionInput, 'Updated description content.');

      // Step 4: Mock successful update
      const updatedContent = {
        ...mockContent[0],
        title: 'Updated Photo Title',
        description: 'Updated description content.'
      };

      mockApi.updateContentItem.mockResolvedValue(updatedContent);

      // Update mock data
      const updatedMockContent = [updatedContent, mockContent[1]];
      mockApi.getAllUserContent.mockResolvedValue({
        data: updatedMockContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      // Step 5: Save changes
      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEventInstance.click(saveButton);

      // Step 6: Verify update API call
      await waitFor(() => {
        expect(mockApi.updateContentItem).toHaveBeenCalledWith(
          'content-1',
          'photo',
          expect.objectContaining({
            title: 'Updated Photo Title',
            description: 'Updated description content.'
          })
        );
      });

      // Step 7: Verify updated content appears
      await waitFor(() => {
        expect(screen.getByText('Updated Photo Title')).toBeInTheDocument();
      });

      // Step 8: Verify success notification
      expect(screen.getByText(/content updated successfully/i)).toBeInTheDocument();
    });

    test('Bulk update operations', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
      });

      // Step 1: Select multiple items
      const checkboxes = screen.getAllByRole('checkbox');
      await userEventInstance.click(checkboxes[0]); // Select first item
      await userEventInstance.click(checkboxes[1]); // Select second item

      // Step 2: Open bulk actions
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /bulk actions/i })).toBeInTheDocument();
      });

      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await userEventInstance.click(bulkActionsButton);

      // Step 3: Choose bulk action
      const publishButton = screen.getByRole('menuitem', { name: /publish/i });
      await userEventInstance.click(publishButton);

      // Step 4: Mock successful bulk operation
      mockApi.performBulkContentOperation.mockResolvedValue({
        data: {
          success_count: 2,
          error_count: 0,
          errors: []
        },
        error: null,
        status: 200,
        operation: 'publish',
        total_processed: 2
      });

      // Step 5: Confirm bulk action
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await userEventInstance.click(confirmButton);

      // Step 6: Verify bulk operation API call
      await waitFor(() => {
        expect(mockApi.performBulkContentOperation).toHaveBeenCalledWith({
          content_ids: ['content-1', 'content-2'],
          operation: 'publish',
          metadata: {}
        });
      });

      // Step 7: Verify success message
      expect(screen.getByText(/2 items updated successfully/i)).toBeInTheDocument();
    });

    test('Update with validation errors', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const editButton = screen.getByRole('button', { name: /edit.*test photo/i });
      await userEventInstance.click(editButton);

      // Clear required field
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
      });

      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.clear(titleInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEventInstance.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Should not make API call
      expect(mockApi.updateContentItem).not.toHaveBeenCalled();
    });
  });

  describe('Delete Operations', () => {
    test('Complete content deletion workflow', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
      });

      // Step 1: Start deletion
      const deleteButton = screen.getByRole('button', { name: /delete.*test photo/i });
      await userEventInstance.click(deleteButton);

      // Step 2: Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/are you sure.*delete/i)).toBeInTheDocument();
      });

      // Step 3: Mock successful deletion
      mockApi.deleteContentItem.mockResolvedValue(true);

      // Update mock data to remove deleted item
      const updatedMockContent = [mockContent[1]]; // Remove first item
      mockApi.getAllUserContent.mockResolvedValue({
        data: updatedMockContent,
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

      // Step 4: Confirm deletion
      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      await userEventInstance.click(confirmDeleteButton);

      // Step 5: Verify deletion API call
      await waitFor(() => {
        expect(mockApi.deleteContentItem).toHaveBeenCalledWith('content-1', 'photo');
      });

      // Step 6: Verify item is removed from list
      await waitFor(() => {
        expect(screen.queryByText('Test Photo')).not.toBeInTheDocument();
        expect(screen.getByText('Test Event')).toBeInTheDocument(); // Other item should remain
      });

      // Step 7: Verify success notification
      expect(screen.getByText(/content deleted successfully/i)).toBeInTheDocument();
    });

    test('Cancel deletion workflow', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete.*test photo/i });
      await userEventInstance.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure.*delete/i)).toBeInTheDocument();
      });

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEventInstance.click(cancelButton);

      // Should close dialog without deleting
      await waitFor(() => {
        expect(screen.queryByText(/are you sure.*delete/i)).not.toBeInTheDocument();
      });

      // Item should still be present
      expect(screen.getByText('Test Photo')).toBeInTheDocument();

      // No API call should be made
      expect(mockApi.deleteContentItem).not.toHaveBeenCalled();
    });

    test('Bulk delete operations', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
      });

      // Select multiple items
      const checkboxes = screen.getAllByRole('checkbox');
      await userEventInstance.click(checkboxes[0]);
      await userEventInstance.click(checkboxes[1]);

      // Open bulk actions
      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await userEventInstance.click(bulkActionsButton);

      // Select delete action
      const deleteAction = screen.getByRole('menuitem', { name: /delete/i });
      await userEventInstance.click(deleteAction);

      // Confirm bulk deletion
      await waitFor(() => {
        expect(screen.getByText(/delete 2 items/i)).toBeInTheDocument();
      });

      mockApi.performBulkContentOperation.mockResolvedValue({
        data: {
          success_count: 2,
          error_count: 0,
          errors: []
        },
        error: null,
        status: 200,
        operation: 'delete',
        total_processed: 2
      });

      // Update mock to show empty list
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

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      await userEventInstance.click(confirmButton);

      // Verify bulk delete API call
      await waitFor(() => {
        expect(mockApi.performBulkContentOperation).toHaveBeenCalledWith({
          content_ids: ['content-1', 'content-2'],
          operation: 'delete',
          metadata: {}
        });
      });

      // Should show empty state
      await waitFor(() => {
        expect(screen.queryByText('Test Photo')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
        expect(screen.getByText(/no content found/i)).toBeInTheDocument();
      });
    });

    test('Delete with API error handling', async () => {
      const userEventInstance = userEvent.setup();

      mockApi.deleteContentItem.mockRejectedValue(new Error('Delete failed'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const deleteButton = screen.getByRole('button', { name: /delete.*test photo/i });
      await userEventInstance.click(deleteButton);

      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      await userEventInstance.click(confirmDeleteButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to delete content/i)).toBeInTheDocument();
      });

      // Item should still be present
      expect(screen.getByText('Test Photo')).toBeInTheDocument();
    });
  });

  describe('Cross-Operation Integration', () => {
    test('Create, edit, then delete content in sequence', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Step 1: Create new content
      const createButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(createButton);

      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.type(titleInput, 'Integration Test Article');

      const contentTypeSelect = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.selectOptions(contentTypeSelect, 'news');

      const newContent = createTestContent('member-crud', {
        id: 'content-integration',
        type: 'news',
        title: 'Integration Test Article',
        status: 'draft'
      });

      mockApi.updateContentItem.mockResolvedValue(newContent);

      const submitButton = screen.getByRole('button', { name: /create/i });
      await userEventInstance.click(submitButton);

      // Update mock to include new content
      mockContent.push(newContent);
      mockApi.getAllUserContent.mockResolvedValue({
        data: mockContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: mockContent.length,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      await waitFor(() => {
        expect(screen.getByText('Integration Test Article')).toBeInTheDocument();
      });

      // Step 2: Edit the created content
      const editButton = screen.getByRole('button', { name: /edit.*integration test article/i });
      await userEventInstance.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('Integration Test Article');
      });

      const editTitleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.clear(editTitleInput);
      await userEventInstance.type(editTitleInput, 'Updated Integration Test Article');

      const updatedContent = {
        ...newContent,
        title: 'Updated Integration Test Article'
      };

      mockApi.updateContentItem.mockResolvedValue(updatedContent);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEventInstance.click(saveButton);

      // Update mock with edited content
      mockContent[2] = updatedContent;
      mockApi.getAllUserContent.mockResolvedValue({
        data: mockContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: mockContent.length,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      await waitFor(() => {
        expect(screen.getByText('Updated Integration Test Article')).toBeInTheDocument();
      });

      // Step 3: Delete the content
      const deleteButton = screen.getByRole('button', { name: /delete.*updated integration test article/i });
      await userEventInstance.click(deleteButton);

      mockApi.deleteContentItem.mockResolvedValue(true);

      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      await userEventInstance.click(confirmDeleteButton);

      // Update mock to remove deleted content
      mockContent = mockContent.slice(0, 2); // Remove the integration test content
      mockApi.getAllUserContent.mockResolvedValue({
        data: mockContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: mockContent.length,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      await waitFor(() => {
        expect(screen.queryByText('Updated Integration Test Article')).not.toBeInTheDocument();
      });

      // Verify all operations were called correctly
      expect(mockApi.updateContentItem).toHaveBeenCalledTimes(2); // Create and update
      expect(mockApi.deleteContentItem).toHaveBeenCalledWith('content-integration', 'news');
    });

    test('Operations maintain proper state across filtering', async () => {
      const userEventInstance = userEvent.setup();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Apply filter to show only photos
      mockApi.getAllUserContent.mockResolvedValue({
        data: [mockContent[0]], // Only photo content
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: { type: ['photo'] }
      });

      // Navigate to All Content tab, then Photo Galleries sub-tab
      const allContentTab = screen.getByRole('tab', { name: /all content/i });
      await userEventInstance.click(allContentTab);

      const photoGalleriesTab = screen.getByRole('tab', { name: /photo galleries/i });
      await userEventInstance.click(photoGalleriesTab);

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
        expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
      });

      // Edit the visible photo content
      const editButton = screen.getByRole('button', { name: /edit.*test photo/i });
      await userEventInstance.click(editButton);

      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEventInstance.clear(titleInput);
      await userEventInstance.type(titleInput, 'Filtered and Edited Photo');

      const updatedContent = {
        ...mockContent[0],
        title: 'Filtered and Edited Photo'
      };

      mockApi.updateContentItem.mockResolvedValue(updatedContent);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEventInstance.click(saveButton);

      // Update filter results with edited content
      mockApi.getAllUserContent.mockResolvedValue({
        data: [updatedContent],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: { type: ['photo'] }
      });

      await waitFor(() => {
        expect(screen.getByText('Filtered and Edited Photo')).toBeInTheDocument();
      });

      // Clear filter - should now show all content including the edited one
      mockContent[0] = updatedContent; // Update original mock data
      mockApi.getAllUserContent.mockResolvedValue({
        data: mockContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: mockContent.length,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      const allTab = screen.getByRole('tab', { name: /all content/i });
      await userEventInstance.click(allTab);

      await waitFor(() => {
        expect(screen.getByText('Filtered and Edited Photo')).toBeInTheDocument();
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});