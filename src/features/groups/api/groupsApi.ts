import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import {
  adaptGroupFromDatabase,
  adaptGroupToSupabaseInsert,
  adaptGroupToSupabaseUpdate,
  GroupInsertData,
  GroupUpdateData,
} from '../utils/groupAdapter';
import { Group as FrontendGroup } from '../types'; // For casting 'visibility'
import { ContentStatus } from '../types/common'; // For casting 'status'
import { lookupContent } from '@/utils/contentUrlUtils';
import { groupMemberManagementApi } from '@/lib/api/groups/memberManagement';
import { groupPostsApi } from '@/lib/api/groups/postsApi';


// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type GroupTableRow = Tables<'groups'>;

// Define the input type for group data passed from the application
export interface GroupInput {
  name: string;
  slug?: string;
  description: string;
  longDescription?: string | null; // Maps to Supabase 'long_description'
  heroImage?: string; // Maps to Supabase 'hero_image'
  coverImage?: string; // Maps to Supabase 'cover_image'
  visibility: 'open' | 'closed' | 'secret' | string; // Maps to Supabase 'visibility'
  status?: string; // e.g., 'published', 'draft', maps to Supabase 'status'
  featured?: boolean | null; // maps to Supabase 'featured'
  // Note: member_count is in Supabase schema but not handled by adaptGroupToSupabase currently.
}

export const groupsApi = {
  async getAll(filters?: { search?: string; visibility?: string | string[]; featured?: boolean; userGroups?: boolean; userId?: string; limit?: number }): Promise<FrontendGroup[]> {
    try {
      
      // Use direct REST API call to bypass Supabase client issues
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error('Missing Supabase configuration');
      }
      
      // Build query string
      let queryString = 'select=*&status=eq.published&order=created_at.desc';
      
      
      const response = await fetch(`${url}/rest/v1/groups?${queryString}`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(data || [], adaptGroupFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching groups');
      return [];
    }
  },

  async getById(identifier: string): Promise<FrontendGroup | null> {
    try {
      // Use the generic lookup function from contentUrlUtils to handle both slugs and IDs
      const { data: groupData, foundBy } = await lookupContent('groups', identifier, supabase);
      
      if (!groupData) {
        console.warn(`Group not found with identifier: ${identifier}`);
        return null;
      }
      
      // Adapt only the core group data. The adaptGroupFromDatabase function initializes
      // events, resources, etc., to empty arrays as per FrontendGroup definition.
      const adaptedGroup = adaptGroupFromDatabase(groupData as any);
      return adaptedGroup;
    } catch (error) {
      handleSupabaseError(error, `fetching group with identifier ${identifier}`);
      return null;
    }
  },

  async update(id: string, groupData: Partial<GroupInput>): Promise<FrontendGroup | null> {
    try {
      // Prepare data for the adapter, ensuring type compatibility
      const preparedDataForAdapter: Partial<Omit<GroupUpdateData, 'id'>> = {};
      if (groupData.name !== undefined) preparedDataForAdapter.name = groupData.name;
      if (groupData.description !== undefined) preparedDataForAdapter.description = groupData.description;
      // Convert null to undefined for properties that expect string | undefined or boolean | undefined
      if (groupData.longDescription !== undefined) preparedDataForAdapter.longDescription = groupData.longDescription === null ? undefined : groupData.longDescription;
      if (groupData.heroImage !== undefined) preparedDataForAdapter.heroImage = groupData.heroImage;
      if (groupData.coverImage !== undefined) preparedDataForAdapter.coverImage = groupData.coverImage;
      if (groupData.visibility !== undefined) preparedDataForAdapter.visibility = groupData.visibility as FrontendGroup['visibility'];
      if (groupData.status !== undefined) preparedDataForAdapter.status = groupData.status as ContentStatus;
      if (groupData.featured !== undefined) preparedDataForAdapter.featured = groupData.featured === null ? undefined : groupData.featured;
      // created_at is not in GroupInput, will be undefined if not set, handled by adapter

      // GroupUpdateData requires 'id'
      const updatePayload: GroupUpdateData = {
        ...preparedDataForAdapter,
        id: id,
      };

      const supabaseData = adaptGroupToSupabaseUpdate(updatePayload);
      
      // First, let's verify the group exists and we have access to it
      const { data: existingGroup, error: verifyError } = await supabase
        .from('groups')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (verifyError) {
        handleSupabaseError(verifyError, `verifying group with id ${id}`);
        return null;
      }
      
      if (!existingGroup) {
        throw new Error(`Group with id ${id} not found or you don't have access to it`);
      }
      
      // Perform the update without .select() first to avoid RLS issues
      const { error: updateError } = await supabase
        .from('groups')
        .update(supabaseData)
        .eq('id', id);

      if (updateError) {
        handleSupabaseError(updateError, `updating group with id ${id}`);
        return null;
      }
      
      // If update succeeded, try to fetch the updated data
      // If RLS blocks this, we'll return a success indicator instead
      const { data: updatedData, error: fetchError } = await supabase
        .from('groups')
        .select()
        .eq('id', id)
        .maybeSingle();
      
      if (fetchError) {
        // Log the fetch error but don't fail - the update succeeded
        console.warn(`Update succeeded but couldn't fetch updated group ${id}:`, fetchError);
        // Return a minimal success response with only the updated payload
        return {
          ...updatePayload,
          // Add default values that might be expected
          createdAt: new Date().toISOString(),
          commentCount: 0,
          likeCount: 0
        } as FrontendGroup;
      }
      
      if (!updatedData) {
        // Update succeeded but no data returned due to RLS - this is OK
        console.warn(`Update succeeded but no data returned for group ${id} due to RLS policies`);
        return {
          ...updatePayload,
          createdAt: new Date().toISOString(),
          commentCount: 0,
          likeCount: 0
        } as FrontendGroup;
      }
      
      return adaptGroupFromDatabase(updatedData as any);
    } catch (error) {
      handleSupabaseError(error, `updating group with id ${id}`);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, `deleting group with id ${id}`);
        return false;
      }
      return true; // Return true if no error, false otherwise
    } catch (error) {
      handleSupabaseError(error, `deleting group with id ${id}`);
      return false;
    }
  },

  async create(groupData: GroupInput): Promise<FrontendGroup | null> {
    try {
      // Use the new create_group_with_admin function to ensure creator becomes admin
      const { data, error } = await supabase
        .rpc('create_group_with_admin', {
          p_name: groupData.name,
          p_description: groupData.description,
          p_visibility: groupData.visibility || 'open',
          p_hero_image: groupData.heroImage || '',
          p_slug: groupData.slug || null
        });

      if (error) {
        handleSupabaseError(error, 'creating group');
        return null;
      }
      
      // Fetch the created group to return full data
      if (data) {
        return await this.getById(data);
      }
      
      return null;
    } catch (error) {
      handleSupabaseError(error, 'creating group');
      return null;
    }
  },

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      // Get the current authenticated user to ensure we're using the correct user ID
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser.user) {
        console.error('Authentication required to join group:', authError);
        return false;
      }
      
      // Use the authenticated user's ID, not the passed userId
      const authenticatedUserId = authUser.user.id;
      
      // First get the member ID from user ID
      let { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', authenticatedUserId)
        .single();
      
      if (!member) {
        console.error('Member not found for user:', authenticatedUserId, 'Creating member record...');
        
        // Create a member record for this user
        const memberName = authUser.user.user_metadata?.name || 
                          authUser.user.user_metadata?.full_name || 
                          authUser.user.email?.split('@')[0] || 
                          'User';
        
        const { data: newMember, error: createError } = await supabase
          .from('members')
          .insert({
            user_id: authenticatedUserId,
            name: memberName,
            status: 'published', // Set to published so they can join groups
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
          
        if (createError || !newMember) {
          console.error('Failed to create member record:', createError);
          return false;
        }
        
        member = newMember;
        console.log('Created member record:', member.id, 'for user:', authenticatedUserId);
      }

      // Use the database function to safely join the group (it will use auth.uid() internally)
      const { data, error } = await supabase
        .rpc('join_group', {
          p_group_id: groupId,
          p_role: 'member'
        });

      if (error) {
        handleSupabaseError(error, 'joining group');
        return false;
      }
      return data === true;
    } catch (error) {
      handleSupabaseError(error, 'joining group');
      return false;
    }
  },

  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      // First get the member ID from user ID
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (!member) {
        console.error('Member not found for user:', userId);
        return false;
      }

      // Use the database function to safely leave the group
      const { data, error } = await supabase
        .rpc('leave_group', {
          p_group_id: groupId,
          p_member_id: member.id
        });

      if (error) {
        handleSupabaseError(error, 'leaving group');
        return false;
      }
      return data === true;
    } catch (error) {
      handleSupabaseError(error, 'leaving group');
      return false;
    }
  },

  async getGroupMembers(groupId: string): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          member:members!member_id (
            id,
            name,
            title,
            bio
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'fetching group members');
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetching group members');
      return [];
    }
  },

  async getGroupEvents(groupId: string): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'published')
        .order('date', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'fetching group events');
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetching group events');
      return [];
    }
  },

  async getGroupResources(groupId: string): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'fetching group resources');
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetching group resources');
      return [];
    }
  },

  async getGroupPosts(groupId: string): Promise<unknown[]> {
    try {
      const { posts } = await groupPostsApi.getGroupPosts(groupId);
      return posts;
    } catch (error) {
      handleSupabaseError(error, 'fetching group posts');
      return [];
    }
  },

  // New member management methods
  async isMember(groupId: string, userId: string): Promise<boolean> {
    return groupMemberManagementApi.isMember(groupId, userId);
  },

  async getMemberRole(groupId: string, userId: string): Promise<'admin' | 'moderator' | 'member' | null> {
    return groupMemberManagementApi.getMemberRole(groupId, userId);
  },

  async updateMemberRole(groupId: string, memberId: string, role: 'admin' | 'moderator' | 'member'): Promise<boolean> {
    return groupMemberManagementApi.updateMemberRole({ group_id: groupId, member_id: memberId, role });
  },

  async removeMember(groupId: string, memberId: string): Promise<boolean> {
    return groupMemberManagementApi.removeMember(groupId, memberId);
  },

  // New invitation methods
  async createInvitation(groupId: string, invitationData: any): Promise<string | null> {
    return groupMemberManagementApi.createInvitation({ group_id: groupId, ...invitationData });
  },

  async acceptInvitation(token: string): Promise<boolean> {
    return groupMemberManagementApi.acceptInvitation(token);
  },

  async getUserInvitations(userId: string): Promise<unknown[]> {
    return groupMemberManagementApi.getUserInvitations(userId);
  },

  async getGroupInvitations(groupId: string): Promise<unknown[]> {
    return groupMemberManagementApi.getGroupInvitations(groupId);
  },

  async cancelInvitation(invitationId: string): Promise<boolean> {
    return groupMemberManagementApi.cancelInvitation(invitationId);
  },

  // New posts methods
  async createPost(groupId: string, postData: any): Promise<unknown | null> {
    return groupPostsApi.createPost({ group_id: groupId, ...postData });
  },

  async getGroupActivities(groupId: string): Promise<unknown[]> {
    const { activities } = await groupPostsApi.getGroupActivities(groupId);
    return activities;
  },

  // Invitation methods - delegate to member management API
  async inviteByEmail(data: { groupId: string; email: string; message?: string; invitedBy: string }): Promise<string | null> {
    return groupMemberManagementApi.createInvitation({
      group_id: data.groupId,
      invited_email: data.email,
      message: data.message
    });
  },

  async inviteMember(data: { groupId: string; memberId: string; invitedBy: string }): Promise<string | null> {
    return groupMemberManagementApi.createInvitation({
      group_id: data.groupId,
      invited_member_id: data.memberId
    });
  },

  async getInvitationByToken(token: string): Promise<unknown | null> {
    return groupMemberManagementApi.getInvitationByToken(token);
  }
};
