/**
 * Dropdown Functionality Tests
 * Tests for various dropdowns in the dashboard with dynamic data loading
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';

import { UserDashboard } from '../../components/UserDashboard';
import { ContentGrid } from '../../components/ContentGrid';
import { contentManagementApi } from '../../api/contentManagementApi';
import { 
  createTestWrapper, 
  createTestUser, 
  createTestContent, 
  createTestGroup,
  createTestCompany
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

describe('Dropdown Functionality Tests', () => {
  // Test user with multiple associations for comprehensive dropdown testing
  const testUser = createTestUser({
    id: 'user-dropdown-test',
    email: 'dropdown@example.com',
    memberId: 'member-dropdown',
    role: 'member',
    groups: ['public-group', 'private-group', 'special-group'],
    companies: ['company-a', 'company-b']
  });

  const testContent = [
    createTestContent('member-dropdown', {
      id: 'content-1',
      type: 'photo',
      title: 'Photo Content',
      status: 'published',
      companyId: 'company-a'
    }),
    createTestContent('member-dropdown', {
      id: 'content-2',
      type: 'event',
      title: 'Event Content',
      status: 'draft',
      groupId: 'private-group'
    }),
    createTestContent('member-dropdown', {
      id: 'content-3',
      type: 'news',
      title: 'News Content',
      status: 'published',
      featured: true
    })
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default API responses
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

    mockApi.getContentStatistics.mockResolvedValue({
      data: [],
      summary: {
        total_content: 3,
        total_views: 100,
        total_engagement: 20,
        growth_percentage: 5.2
      }
    });
  });

  describe('Content Type Filter Dropdown', () => {
    test('Shows all available content types in filter dropdown', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Photo Content')).toBeInTheDocument();
      });

      // Find and click filter button
      const filterButton = screen.getByRole('button', { name: /filter/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(filterButton);

      // Should show content type dropdown
      await waitFor(() => {
        expect(screen.getByText(/content type/i)).toBeInTheDocument();
      });

      const contentTypeDropdown = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.click(contentTypeDropdown);

      // Should show all content types
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /all types/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /photos/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /events/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /news/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /resources/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /marketplace/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /opportunities/i })).toBeInTheDocument();
      });
    });

    test('Content type filter updates content display', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Photo Content')).toBeInTheDocument();
        expect(screen.getByText('Event Content')).toBeInTheDocument();
        expect(screen.getByText('News Content')).toBeInTheDocument();
      });

      // Mock filtered API response for photos only
      mockApi.getAllUserContent.mockResolvedValue({
        data: [testContent[0]], // Only photo content
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

      // Navigate to All Content and then Photo Galleries sub-tab
      const allContentTab = screen.getByRole('tab', { name: /all content/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(allContentTab);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /photo galleries/i })).toBeInTheDocument();
      });

      const photoGalleriesTab = screen.getByRole('tab', { name: /photo galleries/i });
      await userEventInstance.click(photoGalleriesTab);

      // Should now show only photo content
      await waitFor(() => {
        expect(screen.getByText('Photo Content')).toBeInTheDocument();
        expect(screen.queryByText('Event Content')).not.toBeInTheDocument();
        expect(screen.queryByText('News Content')).not.toBeInTheDocument();
      });
    });

    test('Content type dropdown shows counts for each type', async () => {
      mockApi.getContentStatistics.mockResolvedValue({
        data: [
          {
            content_type: 'photo' as const,
            total_count: 1,
            published_count: 1,
            draft_count: 0,
            archived_count: 0,
            view_count: 50,
            like_count: 10,
            comment_count: 2,
            growth_percentage: 10.0
          },
          {
            content_type: 'event' as const,
            total_count: 1,
            published_count: 0,
            draft_count: 1,
            archived_count: 0,
            view_count: 30,
            like_count: 5,
            comment_count: 1,
            growth_percentage: 0.0
          },
          {
            content_type: 'news' as const,
            total_count: 1,
            published_count: 1,
            draft_count: 0,
            archived_count: 0,
            view_count: 20,
            like_count: 5,
            comment_count: 3,
            growth_percentage: 15.0
          }
        ],
        summary: {
          total_content: 3,
          total_views: 100,
          total_engagement: 26,
          growth_percentage: 8.3
        }
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Check tab counts are displayed
      await waitFor(() => {
        // Main tabs should show counts
        const tabs = screen.getAllByRole('tab');
        const allContentTab = tabs.find(tab => tab.textContent?.includes('All Content'));
        expect(allContentTab?.textContent).toMatch(/3/); // Total count
      });

      // Navigate to All Content to see sub-tab counts
      const allContentTab = screen.getByRole('tab', { name: /all content/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(allContentTab);

      // Sub-tabs should show individual counts
      await waitFor(() => {
        const photoTab = screen.getByRole('tab', { name: /photo galleries/i });
        const eventTab = screen.getByRole('tab', { name: /events/i });
        const newsTab = screen.getByRole('tab', { name: /news/i });

        expect(photoTab.textContent).toMatch(/1/);
        expect(eventTab.textContent).toMatch(/1/);
        expect(newsTab.textContent).toMatch(/1/);
      });
    });
  });

  describe('Status Filter Dropdown', () => {
    test('Status dropdown shows appropriate options', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
      });

      const filterButton = screen.getByRole('button', { name: /filter/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(filterButton);

      // Should show status filter dropdown
      await waitFor(() => {
        const statusDropdown = screen.getByRole('combobox', { name: /status/i });
        expect(statusDropdown).toBeInTheDocument();
      });

      const statusDropdown = screen.getByRole('combobox', { name: /status/i });
      await userEventInstance.click(statusDropdown);

      // Should show status options
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /all status/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /published/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /draft/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /archived/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /pending/i })).toBeInTheDocument();
      });
    });

    test('Status filter affects displayed content', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Photo Content')).toBeInTheDocument();
        expect(screen.getByText('Event Content')).toBeInTheDocument();
      });

      // Mock API response for published content only
      mockApi.getAllUserContent.mockResolvedValue({
        data: [testContent[0], testContent[2]], // Published content only
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          total_pages: 1,
          has_more: false
        },
        filters_applied: { status: ['published'] }
      });

      // Apply status filter
      const filterButton = screen.getByRole('button', { name: /filter/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(filterButton);

      const statusDropdown = screen.getByRole('combobox', { name: /status/i });
      await userEventInstance.selectOptions(statusDropdown, 'published');

      // Should now show only published content
      await waitFor(() => {
        expect(screen.getByText('Photo Content')).toBeInTheDocument();
        expect(screen.getByText('News Content')).toBeInTheDocument();
        expect(screen.queryByText('Event Content')).not.toBeInTheDocument(); // Draft content hidden
      });
    });
  });

  describe('Company Selection Dropdown', () => {
    test('Shows only companies user is associated with', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Find and click create button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Should show company selection in create modal/form
      await waitFor(() => {
        expect(screen.getByText(/select company/i)).toBeInTheDocument();
      });

      const companyDropdown = screen.getByRole('combobox', { name: /company/i });
      await userEventInstance.click(companyDropdown);

      // Should show only user's companies
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /personal content/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /company a/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /company b/i })).toBeInTheDocument();
      });

      // Should NOT show companies user is not associated with
      expect(screen.queryByRole('option', { name: /company c/i })).not.toBeInTheDocument();
    });

    test('Company dropdown updates based on content type selection', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Select content type first
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /content type/i })).toBeInTheDocument();
      });

      const contentTypeDropdown = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.selectOptions(contentTypeDropdown, 'opportunity');

      // Company dropdown should be enabled for business content
      await waitFor(() => {
        const companyDropdown = screen.getByRole('combobox', { name: /company/i });
        expect(companyDropdown).not.toBeDisabled();
      });

      // Select personal content type
      await userEventInstance.selectOptions(contentTypeDropdown, 'photo');

      // Company dropdown should still be available but with personal option
      const companyDropdown = screen.getByRole('combobox', { name: /company/i });
      await userEventInstance.click(companyDropdown);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /personal content/i })).toBeInTheDocument();
      });
    });
  });

  describe('Group Selection Dropdown', () => {
    test('Shows only groups user belongs to', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Select group post content type
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /content type/i })).toBeInTheDocument();
      });

      const contentTypeDropdown = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.selectOptions(contentTypeDropdown, 'group');

      // Should show group selection dropdown
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /group/i })).toBeInTheDocument();
      });

      const groupDropdown = screen.getByRole('combobox', { name: /group/i });
      await userEventInstance.click(groupDropdown);

      // Should show only user's groups
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /public group/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /private group/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /special group/i })).toBeInTheDocument();
      });

      // Should NOT show groups user doesn't belong to
      expect(screen.queryByRole('option', { name: /admin group/i })).not.toBeInTheDocument();
    });

    test('Group dropdown shows group visibility indicators', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      const contentTypeDropdown = screen.getByRole('combobox', { name: /content type/i });
      await userEventInstance.selectOptions(contentTypeDropdown, 'group');

      const groupDropdown = screen.getByRole('combobox', { name: /group/i });
      await userEventInstance.click(groupDropdown);

      await waitFor(() => {
        // Should show visibility indicators
        const publicOption = screen.getByRole('option', { name: /public group/i });
        const privateOption = screen.getByRole('option', { name: /private group/i });

        expect(publicOption).toBeInTheDocument();
        expect(privateOption).toBeInTheDocument();

        // Check for visual indicators (icons, badges, etc.)
        within(publicOption).getByTitle(/public/i);
        within(privateOption).getByTitle(/private/i);
      });
    });
  });

  describe('Sort and Order Dropdowns', () => {
    test('Sort dropdown shows appropriate options', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
      });

      const filterButton = screen.getByRole('button', { name: /filter/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(filterButton);

      // Should show sort dropdown
      await waitFor(() => {
        const sortDropdown = screen.getByRole('combobox', { name: /sort by/i });
        expect(sortDropdown).toBeInTheDocument();
      });

      const sortDropdown = screen.getByRole('combobox', { name: /sort by/i });
      await userEventInstance.click(sortDropdown);

      // Should show sort options
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /date created/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /date modified/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /title/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /views/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /likes/i })).toBeInTheDocument();
      });
    });

    test('Sort dropdown updates content order', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      await waitFor(() => {
        expect(screen.getByText('Photo Content')).toBeInTheDocument();
      });

      // Mock API response for sorted content
      mockApi.getAllUserContent.mockResolvedValue({
        data: [testContent[2], testContent[0], testContent[1]], // Sorted by title
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          total_pages: 1,
          has_more: false
        },
        filters_applied: { sortBy: 'title', sortOrder: 'asc' }
      });

      const filterButton = screen.getByRole('button', { name: /filter/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(filterButton);

      const sortDropdown = screen.getByRole('combobox', { name: /sort by/i });
      await userEventInstance.selectOptions(sortDropdown, 'title');

      // Content should be reordered
      await waitFor(() => {
        expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              sortBy: 'title'
            })
          })
        );
      });
    });

    test('Order dropdown toggles ascending/descending', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const filterButton = screen.getByRole('button', { name: /filter/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(filterButton);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /order/i })).toBeInTheDocument();
      });

      const orderDropdown = screen.getByRole('combobox', { name: /order/i });
      await userEventInstance.click(orderDropdown);

      // Should show order options
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /newest first/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /oldest first/i })).toBeInTheDocument();
      });

      // Select oldest first
      await userEventInstance.selectOptions(orderDropdown, 'asc');

      // Should trigger API call with ascending order
      await waitFor(() => {
        expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              sortOrder: 'asc'
            })
          })
        );
      });
    });
  });

  describe('Bulk Operations Dropdown', () => {
    test('Bulk operations dropdown shows appropriate actions', async () => {
      // Mock content permissions for bulk operations
      mockApi.getContentPermissions.mockResolvedValue({
        can_edit: true,
        can_delete: true,
        can_publish: true,
        can_feature: true,
        can_view_analytics: true
      });

      render(
        <ContentGrid 
          content={testContent} 
          view="grid" 
          isLoading={false} 
        />,
        { wrapper: createTestWrapper(testUser) }
      );

      // Select multiple items first
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      const userEventInstance = userEvent.setup();
      const checkboxes = screen.getAllByRole('checkbox');
      
      // Select first two items
      await userEventInstance.click(checkboxes[0]);
      await userEventInstance.click(checkboxes[1]);

      // Bulk actions dropdown should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /bulk actions/i })).toBeInTheDocument();
      });

      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await userEventInstance.click(bulkActionsButton);

      // Should show bulk action options
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /publish/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /unpublish/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /archive/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /feature/i })).toBeInTheDocument();
      });
    });

    test('Bulk operations dropdown updates based on selection permissions', async () => {
      // Mock limited permissions
      mockApi.getContentPermissions.mockResolvedValue({
        can_edit: true,
        can_delete: false, // Cannot delete
        can_publish: true,
        can_feature: false, // Cannot feature
        can_view_analytics: true
      });

      render(
        <ContentGrid 
          content={testContent} 
          view="grid" 
          isLoading={false} 
        />,
        { wrapper: createTestWrapper(testUser) }
      );

      const userEventInstance = userEvent.setup();
      const checkboxes = screen.getAllByRole('checkbox');
      await userEventInstance.click(checkboxes[0]);

      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await userEventInstance.click(bulkActionsButton);

      await waitFor(() => {
        // Should show allowed actions
        expect(screen.getByRole('menuitem', { name: /publish/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /archive/i })).toBeInTheDocument();
        
        // Should NOT show restricted actions
        expect(screen.queryByRole('menuitem', { name: /delete/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: /feature/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Dynamic Data Loading', () => {
    test('Dropdowns update when user associations change', async () => {
      const { rerender } = render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Initial state - user has 2 companies
      await waitFor(() => {
        const companyDropdown = screen.getByRole('combobox', { name: /company/i });
        userEventInstance.click(companyDropdown);
      });

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /company a/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /company b/i })).toBeInTheDocument();
      });

      // Update user to have additional company
      const updatedUser = {
        ...testUser,
        companies: ['company-a', 'company-b', 'company-c']
      };

      rerender(
        <UserDashboard />,
        { wrapper: createTestWrapper(updatedUser) }
      );

      // Should now show additional company
      await waitFor(() => {
        const companyDropdown = screen.getByRole('combobox', { name: /company/i });
        userEventInstance.click(companyDropdown);
      });

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /company c/i })).toBeInTheDocument();
      });
    });

    test('Dropdown options load asynchronously', async () => {
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Should show loading state initially
      await waitFor(() => {
        const companyDropdown = screen.getByRole('combobox', { name: /company/i });
        expect(companyDropdown).toBeInTheDocument();
      });

      // Click dropdown to trigger loading
      const companyDropdown = screen.getByRole('combobox', { name: /company/i });
      await userEventInstance.click(companyDropdown);

      // Should show loading indicator initially
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });

      // After loading completes, should show options
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        expect(screen.getByRole('option', { name: /company a/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling in Dropdowns', () => {
    test('Handles API errors gracefully in dropdown loading', async () => {
      // Mock API error for company data
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUser) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      const companyDropdown = screen.getByRole('combobox', { name: /company/i });
      await userEventInstance.click(companyDropdown);

      // Should show error message when loading fails
      await waitFor(() => {
        expect(screen.getByText(/failed to load companies/i)).toBeInTheDocument();
      });

      // Should provide retry option
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();

      consoleError.mockRestore();
    });

    test('Shows fallback options when dynamic data unavailable', async () => {
      // Mock empty response
      const userWithNoAssociations = createTestUser({
        id: 'user-no-associations',
        groups: [],
        companies: []
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(userWithNoAssociations) }
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Should show personal content option even when no companies
      const companyDropdown = screen.getByRole('combobox', { name: /company/i });
      await userEventInstance.click(companyDropdown);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /personal content/i })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /company/i })).not.toBeInTheDocument();
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});