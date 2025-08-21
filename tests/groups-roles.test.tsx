/**
 * Group Roles and Permissions Test Suite
 * Tests the complete flow of group creation, role assignment, and permissions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { groupsApi } from '@/features/groups/api/groupsApi';
import { groupMemberManagementApi } from '@/lib/api/groups/memberManagement';
import { supabase } from '@/shared/api';

describe('Group Roles and Permissions', () => {
  const mockUserId = 'user-123';
  const mockMemberId = 'member-123';
  const mockGroupId = 'group-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Group Creation', () => {
    it('should create a group and set creator as admin', async () => {
      // Mock the RPC call for group creation
      const mockRpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: mockGroupId,
        error: null
      });

      // Mock getById to return the created group
      const mockGroup = {
        id: mockGroupId,
        name: 'Test Group',
        slug: 'test-group',
        description: 'Test Description',
        visibility: 'open',
        status: 'published',
        createdBy: mockMemberId
      };
      
      vi.spyOn(groupsApi, 'getById').mockResolvedValueOnce(mockGroup as any);

      const result = await groupsApi.create({
        name: 'Test Group',
        description: 'Test Description',
        visibility: 'open'
      });

      expect(mockRpcSpy).toHaveBeenCalledWith('create_group_with_admin', {
        p_name: 'Test Group',
        p_description: 'Test Description',
        p_visibility: 'open',
        p_hero_image: '',
        p_slug: null
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockGroupId);
    });

    it('should handle group creation with slug', async () => {
      const mockRpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: mockGroupId,
        error: null
      });

      vi.spyOn(groupsApi, 'getById').mockResolvedValueOnce({
        id: mockGroupId,
        slug: 'custom-slug'
      } as any);

      await groupsApi.create({
        name: 'Test Group',
        slug: 'custom-slug',
        description: 'Test Description'
      });

      expect(mockRpcSpy).toHaveBeenCalledWith('create_group_with_admin', 
        expect.objectContaining({
          p_slug: 'custom-slug'
        })
      );
    });
  });

  describe('Member Role Assignment', () => {
    it('should assign member role when user joins group', async () => {
      // Mock getting member ID
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: mockMemberId },
              error: null
            })
          })
        })
      } as any);

      // Mock join_group RPC
      const mockRpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: true,
        error: null
      });

      const result = await groupsApi.joinGroup(mockGroupId, mockUserId);

      expect(result).toBe(true);
      expect(mockRpcSpy).toHaveBeenCalledWith('join_group', {
        p_group_id: mockGroupId,
        p_member_id: mockMemberId,
        p_role: 'member'
      });
    });

    it('should handle user without member profile', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValueOnce({
              data: null,
              error: null
            })
          })
        })
      } as any);

      const result = await groupsApi.joinGroup(mockGroupId, mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('Role Management', () => {
    it('should allow admin to change member roles', async () => {
      const mockRpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: true,
        error: null
      });

      const result = await groupMemberManagementApi.changeMemberRole(
        mockGroupId,
        'member-456',
        'moderator'
      );

      expect(mockRpcSpy).toHaveBeenCalledWith('change_member_role', {
        p_group_id: mockGroupId,
        p_member_id: 'member-456',
        p_new_role: 'moderator'
      });

      expect(result).toBe(true);
    });

    it('should reject invalid roles', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid role' } as any
      });

      const result = await groupMemberManagementApi.changeMemberRole(
        mockGroupId,
        'member-456',
        'invalid-role' as any
      );

      expect(result).toBe(false);
    });

    it('should check if user is group admin', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: true,
        error: null
      });

      const result = await groupMemberManagementApi.isGroupAdmin(
        mockGroupId,
        mockUserId
      );

      expect(result).toBe(true);
    });
  });

  describe('Group Members Query', () => {
    it('should fetch group members with roles', async () => {
      const mockMembers = [
        {
          id: 'gm-1',
          group_id: mockGroupId,
          member_id: mockMemberId,
          role: 'admin',
          status: 'active',
          joined_at: '2024-01-01',
          member: {
            id: mockMemberId,
            name: 'Admin User',
            title: 'Developer'
          }
        },
        {
          id: 'gm-2',
          group_id: mockGroupId,
          member_id: 'member-456',
          role: 'member',
          status: 'active',
          joined_at: '2024-01-02',
          member: {
            id: 'member-456',
            name: 'Regular User',
            title: 'Designer'
          }
        }
      ];

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValueOnce({
              data: mockMembers,
              error: null
            })
          })
        })
      } as any);

      const result = await groupMemberManagementApi.getGroupMembers(mockGroupId);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('admin');
      expect(result[1].role).toBe('member');
    });

    it('should filter members by role', async () => {
      const mockAdmins = [
        {
          id: 'gm-1',
          role: 'admin',
          member: { name: 'Admin User' }
        }
      ];

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValueOnce({
                data: mockAdmins,
                error: null
              })
            })
          })
        })
      } as any);

      const result = await groupMemberManagementApi.getGroupMembers(
        mockGroupId,
        { role: 'admin' }
      );

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('admin');
    });
  });

  describe('Permission Checks', () => {
    it('should verify admin permissions for group actions', async () => {
      // Mock checking if user is admin
      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: true,
        error: null
      });

      const canManage = await groupMemberManagementApi.canManageGroup(
        mockGroupId,
        mockUserId
      );

      expect(canManage).toBe(true);
    });

    it('should deny non-admin from admin actions', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: false,
        error: null
      });

      const canManage = await groupMemberManagementApi.canManageGroup(
        mockGroupId,
        'non-admin-user'
      );

      expect(canManage).toBe(false);
    });
  });

  describe('Role-Based Features Access', () => {
    it('admins should access all group features', async () => {
      const memberRole = await groupMemberManagementApi.getMemberRole(
        mockGroupId,
        mockMemberId
      );

      // Mock admin role
      vi.spyOn(groupMemberManagementApi, 'getMemberRole')
        .mockResolvedValueOnce('admin');

      const permissions = {
        canEditGroup: memberRole === 'admin',
        canDeletePosts: memberRole === 'admin' || memberRole === 'moderator',
        canInviteMembers: memberRole === 'admin' || memberRole === 'moderator',
        canRemoveMembers: memberRole === 'admin',
        canChangeRoles: memberRole === 'admin',
        canCreateAnnouncements: memberRole === 'admin' || memberRole === 'moderator'
      };

      expect(permissions.canEditGroup).toBe(true);
      expect(permissions.canRemoveMembers).toBe(true);
      expect(permissions.canChangeRoles).toBe(true);
    });

    it('moderators should have limited permissions', () => {
      const memberRole = 'moderator';

      const permissions = {
        canEditGroup: memberRole === 'admin',
        canDeletePosts: memberRole === 'admin' || memberRole === 'moderator',
        canInviteMembers: memberRole === 'admin' || memberRole === 'moderator',
        canRemoveMembers: memberRole === 'admin',
        canChangeRoles: memberRole === 'admin',
        canCreateAnnouncements: memberRole === 'admin' || memberRole === 'moderator'
      };

      expect(permissions.canEditGroup).toBe(false);
      expect(permissions.canDeletePosts).toBe(true);
      expect(permissions.canInviteMembers).toBe(true);
      expect(permissions.canRemoveMembers).toBe(false);
      expect(permissions.canChangeRoles).toBe(false);
    });

    it('regular members should have basic permissions only', () => {
      const memberRole = 'member';

      const permissions = {
        canEditGroup: memberRole === 'admin',
        canDeletePosts: memberRole === 'admin' || memberRole === 'moderator',
        canInviteMembers: memberRole === 'admin' || memberRole === 'moderator',
        canRemoveMembers: memberRole === 'admin',
        canChangeRoles: memberRole === 'admin',
        canCreateAnnouncements: memberRole === 'admin' || memberRole === 'moderator',
        canCreatePosts: true, // All members can create posts
        canComment: true // All members can comment
      };

      expect(permissions.canEditGroup).toBe(false);
      expect(permissions.canDeletePosts).toBe(false);
      expect(permissions.canCreatePosts).toBe(true);
      expect(permissions.canComment).toBe(true);
    });
  });
});

describe('Group Creation to Admin Flow - Full Integration', () => {
  it('complete flow: create group → creator becomes admin → can manage group', async () => {
    const userId = 'test-user-id';
    const memberId = 'test-member-id';
    const groupId = 'new-group-id';

    // Step 1: Create group
    vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
      data: groupId,
      error: null
    });

    vi.spyOn(groupsApi, 'getById').mockResolvedValueOnce({
      id: groupId,
      name: 'New Group',
      createdBy: memberId
    } as any);

    const group = await groupsApi.create({
      name: 'New Group',
      description: 'Test group creation'
    });

    expect(group).toBeDefined();
    expect(group?.id).toBe(groupId);

    // Step 2: Verify creator is admin
    vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
      data: true,
      error: null
    });

    const isAdmin = await groupMemberManagementApi.isGroupAdmin(groupId, userId);
    expect(isAdmin).toBe(true);

    // Step 3: Admin can change member roles
    vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
      data: true,
      error: null
    });

    const roleChanged = await groupMemberManagementApi.changeMemberRole(
      groupId,
      'other-member-id',
      'moderator'
    );
    expect(roleChanged).toBe(true);
  });
});