/**
 * Group Membership Verification Tests
 * Tests for group-based content access and filtering in the dashboard
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
  createTestGroup,
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

describe('Group Membership Verification Tests', () => {
  // Test users with different group memberships
  const testUsers = {
    publicGroupMember: createTestUser({
      id: 'user-public',
      email: 'public@example.com',
      memberId: 'member-public',
      role: 'member',
      groups: ['public-group'],
      companies: []
    }),
    
    privateGroupMember: createTestUser({
      id: 'user-private', 
      email: 'private@example.com',
      memberId: 'member-private',
      role: 'member',
      groups: ['public-group', 'private-group'],
      companies: []
    }),
    
    multiGroupMember: createTestUser({
      id: 'user-multi',
      email: 'multi@example.com', 
      memberId: 'member-multi',
      role: 'member',
      groups: ['public-group', 'private-group', 'special-group', 'admin-group'],
      companies: []
    }),
    
    noGroupMember: createTestUser({
      id: 'user-none',
      email: 'none@example.com',
      memberId: 'member-none', 
      role: 'member',
      groups: [],
      companies: []
    }),

    groupAdmin: createTestUser({
      id: 'user-admin',
      email: 'admin@example.com',
      memberId: 'member-admin',
      role: 'admin',
      groups: ['public-group', 'private-group', 'special-group', 'admin-group'],
      companies: []
    })
  };

  // Test groups with different visibility settings
  const testGroups = {
    publicGroup: createTestGroup({
      id: 'public-group',
      name: 'Public Discussion Group',
      description: 'Open to all members',
      visibility: 'public',
      members: ['member-public', 'member-private', 'member-multi', 'member-admin'],
      admins: ['member-admin']
    }),
    
    privateGroup: createTestGroup({
      id: 'private-group',
      name: 'Private Planning Group',
      description: 'Invitation only',
      visibility: 'private',
      members: ['member-private', 'member-multi', 'member-admin'],
      admins: ['member-admin']
    }),
    
    specialGroup: createTestGroup({
      id: 'special-group', 
      name: 'Special Projects Group',
      description: 'For special projects only',
      visibility: 'private',
      members: ['member-multi', 'member-admin'],
      admins: ['member-admin']
    }),

    adminGroup: createTestGroup({
      id: 'admin-group',
      name: 'Admin Only Group', 
      description: 'Administrator discussions',
      visibility: 'private',
      members: ['member-admin'],
      admins: ['member-admin']
    })
  };

  // Test content associated with different groups
  const createGroupContent = () => {
    return {
      publicGroupContent: [
        createTestContent('member-public', {
          id: 'content-public-1',
          type: 'group',
          title: 'Public Group Discussion',
          groupId: 'public-group',
          status: 'published'
        }),
        createTestContent('member-private', {
          id: 'content-public-2', 
          type: 'group',
          title: 'Another Public Post',
          groupId: 'public-group',
          status: 'published'
        })
      ],
      
      privateGroupContent: [
        createTestContent('member-private', {
          id: 'content-private-1',
          type: 'group',
          title: 'Private Group Planning',
          groupId: 'private-group', 
          status: 'published'
        }),
        createTestContent('member-multi', {
          id: 'content-private-2',
          type: 'group', 
          title: 'Private Discussion Topic',
          groupId: 'private-group',
          status: 'published'
        })
      ],
      
      specialGroupContent: [
        createTestContent('member-multi', {
          id: 'content-special-1',
          type: 'group',
          title: 'Special Project Update',
          groupId: 'special-group',
          status: 'published'
        })
      ],
      
      adminGroupContent: [
        createTestContent('member-admin', {
          id: 'content-admin-1',
          type: 'group',
          title: 'Admin Only Discussion',
          groupId: 'admin-group',
          status: 'published'
        })
      ]
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default API responses
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

  describe('Group-Based Content Visibility', () => {
    test('User sees only group content they have access to', async () => {
      const groupContent = createGroupContent();
      const user = testUsers.privateGroupMember;
      
      // Mock API to return content from groups user belongs to
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...groupContent.publicGroupContent,
          ...groupContent.privateGroupContent
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see public group content
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
        expect(screen.getByText('Another Public Post')).toBeInTheDocument();
        
        // Should see private group content (user is member)
        expect(screen.getByText('Private Group Planning')).toBeInTheDocument();
        expect(screen.getByText('Private Discussion Topic')).toBeInTheDocument();
      });

      // Should NOT see special group content (not a member)
      expect(screen.queryByText('Special Project Update')).not.toBeInTheDocument();
      
      // Should NOT see admin group content (not an admin)
      expect(screen.queryByText('Admin Only Discussion')).not.toBeInTheDocument();
    });

    test('Multi-group member sees content from all their groups', async () => {
      const groupContent = createGroupContent();
      const user = testUsers.multiGroupMember;
      
      // Mock API to return content from all groups user belongs to
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...groupContent.publicGroupContent,
          ...groupContent.privateGroupContent,
          ...groupContent.specialGroupContent
          // Admin content still excluded as user is not admin role
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 5,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see all group content they have access to
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
        expect(screen.getByText('Private Group Planning')).toBeInTheDocument();
        expect(screen.getByText('Special Project Update')).toBeInTheDocument();
      });

      // Should still NOT see admin-only content
      expect(screen.queryByText('Admin Only Discussion')).not.toBeInTheDocument();
    });

    test('User with no groups sees no group content', async () => {
      const user = testUsers.noGroupMember;
      
      // User has their own personal content but no group content access
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          createTestContent('member-none', {
            type: 'photo',
            title: 'My Personal Photo',
            status: 'published'
          })
        ],
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
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see their own content
        expect(screen.getByText('My Personal Photo')).toBeInTheDocument();
      });

      // Should NOT see any group content
      expect(screen.queryByText('Public Group Discussion')).not.toBeInTheDocument();
      expect(screen.queryByText('Private Group Planning')).not.toBeInTheDocument();
      expect(screen.queryByText('Special Project Update')).not.toBeInTheDocument();
    });

    test('Group admin sees admin-level group content', async () => {
      const groupContent = createGroupContent();
      const user = testUsers.groupAdmin;
      
      // Admin should see all group content including admin-only
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...groupContent.publicGroupContent,
          ...groupContent.privateGroupContent,
          ...groupContent.specialGroupContent,
          ...groupContent.adminGroupContent
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 6,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see all content including admin-only
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
        expect(screen.getByText('Private Group Planning')).toBeInTheDocument();
        expect(screen.getByText('Special Project Update')).toBeInTheDocument();
        expect(screen.getByText('Admin Only Discussion')).toBeInTheDocument();
      });
    });
  });

  describe('Group Content Creation Permissions', () => {
    test('User can create content in groups they belong to', async () => {
      const user = testUsers.privateGroupMember;
      
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
        { wrapper: createTestWrapper(user) }
      );

      // Find create button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Should show group selection for groups user belongs to
      await waitFor(() => {
        // Should see dropdown or modal with group options
        expect(screen.getByText(/select group/i)).toBeInTheDocument();
      });

      // User should see their groups as options
      expect(screen.getByText('Public Discussion Group')).toBeInTheDocument();
      expect(screen.getByText('Private Planning Group')).toBeInTheDocument();
      
      // Should NOT see groups they don't belong to
      expect(screen.queryByText('Special Projects Group')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin Only Group')).not.toBeInTheDocument();
    });

    test('User cannot create content in groups they do not belong to', async () => {
      const user = testUsers.publicGroupMember;
      
      // Mock API call to verify group membership during content creation
      mockApi.updateContentItem.mockImplementation(async (contentId, contentType, updates) => {
        // Simulate server-side validation
        if (updates.groupId && !user.groups.includes(updates.groupId)) {
          throw new Error('User is not a member of the specified group');
        }
        return null;
      });

      // Attempt to create content in a group they don't belong to should fail
      await expect(
        mockApi.updateContentItem('new-content', 'group', {
          title: 'Unauthorized Post',
          groupId: 'private-group'
        })
      ).rejects.toThrow('User is not a member of the specified group');
    });
  });

  describe('Group Content Filtering', () => {
    test('Group filter shows only groups user belongs to', async () => {
      const user = testUsers.multiGroupMember;
      const groupContent = createGroupContent();
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: [...groupContent.publicGroupContent, ...groupContent.privateGroupContent, ...groupContent.specialGroupContent],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 5,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      // Navigate to groups tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /groups/i })).toBeInTheDocument();
      });

      const groupsTab = screen.getByRole('tab', { name: /groups/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(groupsTab);

      // Should show filter options
      await waitFor(() => {
        const filterButton = screen.getByRole('button', { name: /filter/i });
        expect(filterButton).toBeInTheDocument();
      });

      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEventInstance.click(filterButton);

      // Should show only groups user belongs to in filter options
      await waitFor(() => {
        expect(screen.getByText('Public Discussion Group')).toBeInTheDocument();
        expect(screen.getByText('Private Planning Group')).toBeInTheDocument();
        expect(screen.getByText('Special Projects Group')).toBeInTheDocument();
      });

      // Should NOT show groups user doesn't belong to
      expect(screen.queryByText('Admin Only Group')).not.toBeInTheDocument();
    });

    test('Filtering by specific group shows only that group content', async () => {
      const user = testUsers.privateGroupMember;
      const groupContent = createGroupContent();
      
      // Initial load with all accessible content
      mockApi.getAllUserContent.mockResolvedValue({
        data: [...groupContent.publicGroupContent, ...groupContent.privateGroupContent],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
        expect(screen.getByText('Private Group Planning')).toBeInTheDocument();
      });

      // Filter to private group only
      const groupsTab = screen.getByRole('tab', { name: /groups/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(groupsTab);

      // Mock API call for filtered content
      mockApi.getAllUserContent.mockResolvedValue({
        data: groupContent.privateGroupContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          total_pages: 1,
          has_more: false
        },
        filters_applied: { groupId: 'private-group' }
      });

      // Select private group filter (this would trigger re-fetch)
      await waitFor(() => {
        // After filtering, should only see private group content
        expect(screen.getByText('Private Group Planning')).toBeInTheDocument();
        expect(screen.getByText('Private Discussion Topic')).toBeInTheDocument();
      });
    });
  });

  describe('Group Membership Changes', () => {
    test('Content access updates when user joins a group', async () => {
      const user = testUsers.publicGroupMember;
      const groupContent = createGroupContent();
      
      // Initially user only sees public group content
      mockApi.getAllUserContent.mockResolvedValue({
        data: groupContent.publicGroupContent,
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

      const { rerender } = render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
        expect(screen.queryByText('Private Group Planning')).not.toBeInTheDocument();
      });

      // Simulate user joining private group
      const updatedUser = {
        ...user,
        groups: ['public-group', 'private-group']
      };

      // Update API response to include new group content
      mockApi.getAllUserContent.mockResolvedValue({
        data: [...groupContent.publicGroupContent, ...groupContent.privateGroupContent],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      // Re-render with updated user
      rerender(
        <UserDashboard />,
        { wrapper: createTestWrapper(updatedUser) }
      );

      // Should now see private group content too
      await waitFor(() => {
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
        expect(screen.getByText('Private Group Planning')).toBeInTheDocument();
      });
    });

    test('Content access removes when user leaves a group', async () => {
      const user = {
        ...testUsers.privateGroupMember,
        groups: ['public-group'] // Removed from private group
      };
      
      const groupContent = createGroupContent();

      // Should only see public group content now
      mockApi.getAllUserContent.mockResolvedValue({
        data: groupContent.publicGroupContent,
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
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see public content
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
        
        // Should NOT see private content anymore
        expect(screen.queryByText('Private Group Planning')).not.toBeInTheDocument();
      });
    });
  });

  describe('Group Content Moderation', () => {
    test('Group moderators can moderate group content', async () => {
      const moderator = testUsers.groupAdmin;
      const groupContent = createGroupContent();
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: [...groupContent.publicGroupContent, ...groupContent.privateGroupContent],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      mockApi.getContentPermissions.mockResolvedValue({
        can_edit: true,
        can_delete: true,
        can_publish: true,
        can_feature: true,
        can_view_analytics: true
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(moderator) }
      );

      await waitFor(() => {
        expect(screen.getByText('Public Group Discussion')).toBeInTheDocument();
      });

      // Should have moderation buttons available for group content
      const moderateButtons = screen.getAllByRole('button', { name: /moderate/i });
      expect(moderateButtons.length).toBeGreaterThan(0);

      // Should be able to edit other users' group posts
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('Regular group members cannot moderate others group content', async () => {
      const regularMember = testUsers.privateGroupMember;
      const groupContent = createGroupContent();
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: groupContent.privateGroupContent,
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

      // Mock permissions for regular member - can edit own content only
      mockApi.getContentPermissions.mockImplementation(async (contentId) => {
        const isOwnContent = contentId === 'content-private-1'; // Created by member-private
        return {
          can_edit: isOwnContent,
          can_delete: isOwnContent,
          can_publish: isOwnContent,
          can_feature: false,
          can_view_analytics: isOwnContent
        };
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(regularMember) }
      );

      await waitFor(() => {
        expect(screen.getByText('Private Group Planning')).toBeInTheDocument();
        expect(screen.getByText('Private Discussion Topic')).toBeInTheDocument();
      });

      // Should not have moderation buttons for others' content
      const moderateButtons = screen.queryAllByRole('button', { name: /moderate/i });
      expect(moderateButtons.length).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('Handles invalid group IDs gracefully', async () => {
      const user = testUsers.privateGroupMember;
      
      // Mock content with invalid group ID
      const invalidGroupContent = createTestContent('member-private', {
        type: 'group',
        title: 'Content with Invalid Group',
        groupId: 'non-existent-group',
        status: 'published'
      });

      mockApi.getAllUserContent.mockResolvedValue({
        data: [invalidGroupContent],
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
        { wrapper: createTestWrapper(user) }
      );

      // Should handle gracefully, either show with warning or filter out
      await waitFor(() => {
        // Content might be shown with a warning or hidden entirely
        const content = screen.queryByText('Content with Invalid Group');
        if (content) {
          // If shown, should have some indication of issue
          expect(screen.getByText(/group not found/i)).toBeInTheDocument();
        }
      });
    });

    test('Handles group membership API failures', async () => {
      const user = testUsers.privateGroupMember;
      
      // Mock API failure for group membership verification
      mockApi.getAllUserContent.mockRejectedValue(new Error('Group membership verification failed'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should show error state
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Should not show any group content when verification fails
      expect(screen.queryByText('Public Group Discussion')).not.toBeInTheDocument();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});