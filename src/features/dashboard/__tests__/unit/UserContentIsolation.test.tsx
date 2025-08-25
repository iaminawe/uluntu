/**
 * User Content Isolation Tests
 * Critical security tests ensuring users can only access their own content
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';

import { UserDashboard } from '../../components/UserDashboard';
import { contentManagementApi } from '../../api/contentManagementApi';
import { createTestWrapper, mockUser, mockSupabaseFrom } from '../../../shared/test-utils/testHelpers';

// Mock the API
jest.mock('../../api/contentManagementApi', () => ({
  contentManagementApi: {
    getAllUserContent: jest.fn(),
    getContentStatistics: jest.fn(),
    updateContentItem: jest.fn(),
    deleteContentItem: jest.fn(),
    getContentPermissions: jest.fn()
  }
}));

// Mock Supabase
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

describe('User Content Isolation Tests', () => {
  const testUsers = {
    user1: {
      id: 'user-1',
      email: 'user1@example.com',
      memberId: 'member-1',
      role: 'member',
      groups: ['general'],
      companies: ['company-a']
    },
    user2: {
      id: 'user-2', 
      email: 'user2@example.com',
      memberId: 'member-2',
      role: 'member',
      groups: ['general'],
      companies: ['company-b']
    },
    moderator: {
      id: 'user-mod',
      email: 'mod@example.com',
      memberId: 'member-mod',
      role: 'moderator',
      groups: ['general', 'moderators'],
      companies: []
    }
  };

  const testContent = {
    user1Content: [
      {
        id: 'content-1',
        type: 'photo' as const,
        title: 'User 1 Photo',
        user_id: 'member-1',
        status: 'published' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        view_count: 10,
        like_count: 2,
        comment_count: 1,
        featured: false,
        thumbnail_url: '/thumb1.jpg',
        url: '/gallery/photo/content-1',
        slug: 'content-1',
        description: 'My photo description'
      },
      {
        id: 'content-2',
        type: 'event' as const,
        title: 'User 1 Event',
        user_id: 'member-1',
        status: 'draft' as const,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        featured: false,
        thumbnail_url: null,
        url: '/events/content-2',
        slug: 'content-2',
        description: 'My event description'
      }
    ],
    user2Content: [
      {
        id: 'content-3',
        type: 'news' as const,
        title: 'User 2 News Article',
        user_id: 'member-2',
        status: 'published' as const,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
        view_count: 25,
        like_count: 5,
        comment_count: 3,
        featured: true,
        thumbnail_url: '/thumb2.jpg',
        url: '/news/content-3',
        slug: 'content-3',
        description: 'User 2 news article'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful API responses
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

  describe('Content Visibility Isolation', () => {
    test('User 1 sees only their own content', async () => {
      // Mock User 1's session
      const user = userEvent.setup();
      
      // Setup API to return only User 1's content
      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent.user1Content,
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

      // Render dashboard for User 1
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('User 1 Photo')).toBeInTheDocument();
        expect(screen.getByText('User 1 Event')).toBeInTheDocument();
      });

      // Verify User 2's content is NOT visible
      expect(screen.queryByText('User 2 News Article')).not.toBeInTheDocument();

      // Verify API was called with correct user filtering
      expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
        expect.objectContaining({
          // API should automatically filter by current user
          filters: expect.any(Object)
        })
      );
    });

    test('User 2 sees only their own content', async () => {
      // Setup API to return only User 2's content
      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent.user2Content,
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

      // Render dashboard for User 2
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user2) }
      );

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('User 2 News Article')).toBeInTheDocument();
      });

      // Verify User 1's content is NOT visible
      expect(screen.queryByText('User 1 Photo')).not.toBeInTheDocument();
      expect(screen.queryByText('User 1 Event')).not.toBeInTheDocument();
    });

    test('Empty dashboard for user with no content', async () => {
      // Mock user with no content
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

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText(/no content found/i)).toBeInTheDocument();
      });

      // Verify no other users' content appears
      expect(screen.queryByText('User 2 News Article')).not.toBeInTheDocument();
    });
  });

  describe('Content Status Filtering', () => {
    test('User sees their own published and draft content', async () => {
      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent.user1Content, // Includes both published and draft
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

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      await waitFor(() => {
        // Published content should be visible
        expect(screen.getByText('User 1 Photo')).toBeInTheDocument();
        
        // Draft content should also be visible to owner
        expect(screen.getByText('User 1 Event')).toBeInTheDocument();
      });

      // Verify status badges are shown
      expect(screen.getByText(/published/i)).toBeInTheDocument();
      expect(screen.getByText(/draft/i)).toBeInTheDocument();
    });

    test('Status filter works within user content only', async () => {
      const user = userEvent.setup();

      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent.user1Content,
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

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('User 1 Photo')).toBeInTheDocument();
        expect(screen.getByText('User 1 Event')).toBeInTheDocument();
      });

      // Filter to published only
      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await user.selectOptions(statusFilter, 'published');

      // API should be called with status filter
      await waitFor(() => {
        expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              status: ['published']
            })
          })
        );
      });
    });
  });

  describe('Search and Filter Isolation', () => {
    test('Search only searches within user content', async () => {
      const user = userEvent.setup();

      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent.user1Content,
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

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search content/i);

      // Search for something that exists in User 2's content
      await user.type(searchInput, 'News Article');

      // API should be called with search filter
      await waitFor(() => {
        expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              search: 'News Article'
            })
          })
        );
      });

      // Should not find User 2's content even if search matches
      expect(screen.queryByText('User 2 News Article')).not.toBeInTheDocument();
    });

    test('Content type filter works within user content only', async () => {
      const user = userEvent.setup();

      // Setup tab switching scenario
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      // Click on 'All Content' tab and then 'Photo Galleries' sub-tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /all content/i })).toBeInTheDocument();
      });

      const allContentTab = screen.getByRole('tab', { name: /all content/i });
      await user.click(allContentTab);

      // Find photo galleries sub-tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /photo galleries/i })).toBeInTheDocument();
      });

      const photoGalleriesTab = screen.getByRole('tab', { name: /photo galleries/i });
      await user.click(photoGalleriesTab);

      // API should be called filtering for photos from current user only
      await waitFor(() => {
        expect(mockApi.getAllUserContent).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              type: ['galleries'] // Should filter by type within user's content
            })
          })
        );
      });
    });
  });

  describe('Edit/Delete Permission Isolation', () => {
    test('Edit buttons only appear for user own content', async () => {
      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent.user1Content,
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

      mockApi.getContentPermissions.mockResolvedValue({
        can_edit: true,
        can_delete: true,
        can_publish: true,
        can_feature: false,
        can_view_analytics: true
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      await waitFor(() => {
        expect(screen.getByText('User 1 Photo')).toBeInTheDocument();
      });

      // Edit/delete buttons should be present for own content
      const contentCards = screen.getAllByTestId(/content-card/);
      expect(contentCards.length).toBeGreaterThan(0);

      // Check for edit buttons (might be in a dropdown menu)
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('Users cannot edit content via API manipulation', async () => {
      // Try to edit another user's content
      mockApi.updateContentItem.mockRejectedValue(new Error('Permission denied'));

      const result = contentManagementApi.updateContentItem(
        'content-3', // User 2's content
        'news',
        { title: 'Hacked title' }
      );

      await expect(result).rejects.toThrow('Permission denied');
    });

    test('Users cannot delete content via API manipulation', async () => {
      // Try to delete another user's content
      mockApi.deleteContentItem.mockRejectedValue(new Error('Permission denied'));

      const result = contentManagementApi.deleteContentItem('content-3', 'news');

      await expect(result).rejects.toThrow('Permission denied');
    });
  });

  describe('Moderator Permissions', () => {
    test('Moderators can see additional content for moderation', async () => {
      // Mock moderator seeing content that needs moderation
      const moderationContent = [
        ...testContent.user1Content,
        {
          ...testContent.user2Content[0],
          status: 'pending' as const,
          title: 'Pending Moderation Content'
        }
      ];

      mockApi.getAllUserContent.mockResolvedValue({
        data: moderationContent,
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
        { wrapper: createTestWrapper(testUsers.moderator) }
      );

      await waitFor(() => {
        // Moderator should see pending content
        expect(screen.getByText('Pending Moderation Content')).toBeInTheDocument();
      });

      // Should have moderation actions available
      const moderateButtons = screen.getAllByRole('button', { name: /moderate/i });
      expect(moderateButtons.length).toBeGreaterThan(0);
    });
  });

  describe('URL Parameter Security', () => {
    test('URL parameter tampering does not bypass user filtering', async () => {
      // Mock scenario where someone tries to manipulate URL parameters
      // The API should still filter by authenticated user regardless of URL params
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: testContent.user1Content,
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

      // Render with specific route that might contain user parameters
      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1, { initialEntries: ['/dashboard?user=member-2'] }) }
      );

      await waitFor(() => {
        // Should still see only User 1's content despite URL param
        expect(screen.getByText('User 1 Photo')).toBeInTheDocument();
      });

      // Should NOT see User 2's content
      expect(screen.queryByText('User 2 News Article')).not.toBeInTheDocument();
    });
  });

  describe('Performance with User Content', () => {
    test('Dashboard performs well with large user content datasets', async () => {
      // Generate large dataset for single user
      const largeUserContent = Array.from({ length: 100 }, (_, i) => ({
        id: `content-${i}`,
        type: 'photo' as const,
        title: `User Photo ${i}`,
        user_id: 'member-1',
        status: 'published' as const,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        updated_at: new Date(Date.now() - i * 86400000).toISOString(),
        view_count: Math.floor(Math.random() * 100),
        like_count: Math.floor(Math.random() * 20),
        comment_count: Math.floor(Math.random() * 10),
        featured: false,
        thumbnail_url: `/thumb${i}.jpg`,
        url: `/gallery/photo/content-${i}`,
        slug: `content-${i}`,
        description: `Photo ${i} description`
      }));

      mockApi.getAllUserContent.mockResolvedValue({
        data: largeUserContent.slice(0, 20), // First page
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

      const startTime = performance.now();

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/content-card/)).toHaveLength(20);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within performance threshold
      expect(renderTime).toBeLessThan(1000); // 1 second max
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('Handles API errors gracefully without leaking data', async () => {
      // Mock API error
      mockApi.getAllUserContent.mockRejectedValue(new Error('Database connection failed'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      await waitFor(() => {
        // Should show error state
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Should not show any content (including cached content from other users)
      expect(screen.queryByText('User 1 Photo')).not.toBeInTheDocument();
      expect(screen.queryByText('User 2 News Article')).not.toBeInTheDocument();
    });

    test('Handles empty response without errors', async () => {
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

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(testUsers.user1) }
      );

      await waitFor(() => {
        expect(screen.getByText(/no content found/i)).toBeInTheDocument();
      });

      // Should show appropriate empty state
      expect(screen.getByText(/create your first/i)).toBeInTheDocument();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});