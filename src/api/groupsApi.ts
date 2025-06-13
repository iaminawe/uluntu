import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptGroupFromDatabase,
  adaptGroupToSupabaseInsert,
  adaptGroupToSupabaseUpdate,
  GroupInsertData,
  GroupUpdateData,
} from '../adapters/groupAdapter';
import { Group as FrontendGroup } from '../types'; // For casting 'visibility'
import { ContentStatus } from '../types/common'; // For casting 'status'

// Helper function to adapt a list of items
function adaptItemsList<T, R>(items: T[], adapter: (item: T) => R): R[] {
  return items.map(item => adapter(item));
}

// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type GroupTableRow = Tables<'groups'>;

// Define the input type for group data passed from the application
export interface GroupInput {
  name: string;
  description: string;
  longDescription?: string | null; // Maps to Supabase 'long_description'
  heroImage: string; // Maps to Supabase 'hero_image'
  visibility: 'open' | 'closed' | 'secret' | string; // Maps to Supabase 'visibility'
  status?: string; // e.g., 'published', 'draft', maps to Supabase 'status'
  featured?: boolean | null; // maps to Supabase 'featured'
  interests?: string[]; // Added for interests/hobbies/goals
  // Note: cover_image and member_count are in Supabase schema but not handled by adaptGroupToSupabase currently.
}

export const groupsApi = {
  async getInterests(groupId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('group_interests')
        .select('interest')
        .eq('group_id', groupId)
        .order('interest');

      if (error) {
        handleSupabaseError(error, `fetching interests for group ${groupId}`);
        return [];
      }

      return data?.map(item => item.interest) || [];
    } catch (error) {
      handleSupabaseError(error, `fetching interests for group ${groupId}`);
      return [];
    }
  },

  async updateInterests(groupId: string, interests: string[]): Promise<boolean> {
    try {
      // First delete existing interests
      const { error: deleteError } = await supabase
        .from('group_interests')
        .delete()
        .eq('group_id', groupId);

      if (deleteError) {
        handleSupabaseError(deleteError, `deleting interests for group ${groupId}`);
        return false;
      }

      // Then insert new interests if any
      if (interests.length > 0) {
        const interestRecords = interests.map(interest => ({
          group_id: groupId,
          interest: interest.trim()
        }));

        const { error: insertError } = await supabase
          .from('group_interests')
          .insert(interestRecords);

        if (insertError) {
          handleSupabaseError(insertError, `inserting interests for group ${groupId}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, `updating interests for group ${groupId}`);
      return false;
    }
  },
  async getAll(filters?: { search?: string; visibility?: string[] }): Promise<FrontendGroup[]> {
    try {
      let query = supabase
        .from('groups')
        .select(`*`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.visibility && filters.visibility.length > 0) {
        query = query.in('visibility', filters.visibility);
      }

      const { data, error } = await query;
      if (error) {
        handleSupabaseError(error, 'fetching groups');
        return [];
      }
      
      // Fetch interests for each group
      const groupsWithInterests = await Promise.all(
        (data || []).map(async (group) => {
          const interests = await this.getInterests(group.id);
          return { ...group, interests };
        })
      );
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(groupsWithInterests, adaptGroupFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching groups');
      return [];
    }
  },

  async getById(id: string): Promise<FrontendGroup | null> {
    try {
      // First, get the basic group data without any joins
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) {
        handleSupabaseError(groupError, `fetching group with id ${id}`);
        return null;
      }
      
      // Fetch interests for the group
      const interests = groupData ? await this.getInterests(groupData.id) : [];
      
      // Adapt only the core group data. The adaptGroupFromDatabase function initializes
      // events, resources, etc., to empty arrays as per FrontendGroup definition.
      return groupData ? adaptGroupFromDatabase({ ...groupData, interests }) : null;
    } catch (error) {
      handleSupabaseError(error, `fetching group with id ${id}`);
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
      if (groupData.visibility !== undefined) preparedDataForAdapter.visibility = groupData.visibility as FrontendGroup['visibility'];
      if (groupData.status !== undefined) preparedDataForAdapter.status = groupData.status as ContentStatus;
      if (groupData.featured !== undefined) preparedDataForAdapter.featured = groupData.featured === null ? undefined : groupData.featured;
      // coverImage and created_at are not in GroupInput, will be undefined if not set, handled by adapter

      // GroupUpdateData requires 'id'
      const updatePayload: GroupUpdateData = {
        ...preparedDataForAdapter,
        id: id,
      };

      const supabaseData = adaptGroupToSupabaseUpdate(updatePayload);
      const { data, error } = await supabase
        .from('groups')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, `updating group with id ${id}`);
        return null;
      }
      
      // Update interests if provided
      if (groupData.interests !== undefined && data) {
        await this.updateInterests(id, groupData.interests);
        // Fetch updated interests
        const interests = await this.getInterests(id);
        return adaptGroupFromDatabase({ ...data, interests });
      }
      
      return data ? adaptGroupFromDatabase(data) : null;
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
      // Prepare data for the adapter, ensuring type compatibility
      const preparedData: GroupInsertData = {
        name: groupData.name,
        description: groupData.description,
        heroImage: groupData.heroImage,
        visibility: groupData.visibility as FrontendGroup['visibility'],
        // Optional fields from GroupInput
        ...(groupData.longDescription && { longDescription: groupData.longDescription }),
        ...(groupData.status && { status: groupData.status as ContentStatus }),
        ...(groupData.featured !== undefined && { featured: groupData.featured }),
        // coverImage and created_at are not in GroupInput, will be undefined if not set, handled by adapter
      };
      const supabaseData = adaptGroupToSupabaseInsert(preparedData);
      const { data, error } = await supabase
        .from('groups')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating group');
        return null;
      }
      
      // Create interests if provided
      if (groupData.interests && groupData.interests.length > 0 && data) {
        await this.updateInterests(data.id, groupData.interests);
        // Fetch created interests
        const interests = await this.getInterests(data.id);
        return adaptGroupFromDatabase({ ...data, interests });
      }
      
      return data ? adaptGroupFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating group');
      return null;
    }
  },

  async joinGroup(groupId: string, memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          member_id: memberId,
          role: 'member',
          created_at: new Date().toISOString()
        });

      if (error) {
        handleSupabaseError(error, `joining group ${groupId}`);
        return false;
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, `joining group ${groupId}`);
      return false;
    }
  },

  async leaveGroup(groupId: string, memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('member_id', memberId);

      if (error) {
        handleSupabaseError(error, `leaving group ${groupId}`);
        return false;
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, `leaving group ${groupId}`);
      return false;
    }
  },

  async getGroupMembers(groupId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          member:members(*)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        handleSupabaseError(error, `fetching members for group ${groupId}`);
        return [];
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error, `fetching members for group ${groupId}`);
      return [];
    }
  },

  async isMember(groupId: string, memberId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('member_id', memberId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        handleSupabaseError(error, `checking membership for group ${groupId}`);
        return false;
      }

      return !!data;
    } catch (error) {
      handleSupabaseError(error, `checking membership for group ${groupId}`);
      return false;
    }
  },

  async getMemberRole(groupId: string, memberId: string): Promise<'admin' | 'member' | null> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('member_id', memberId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
          handleSupabaseError(error, `fetching member role for group ${groupId}`);
        }
        return null;
      }

      return data?.role as 'admin' | 'member' || null;
    } catch (error) {
      handleSupabaseError(error, `fetching member role for group ${groupId}`);
      return null;
    }
  },

  async updateMemberRole(groupId: string, memberId: string, role: 'admin' | 'member'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role })
        .eq('group_id', groupId)
        .eq('member_id', memberId);

      if (error) {
        handleSupabaseError(error, `updating member role in group ${groupId}`);
        return false;
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, `updating member role in group ${groupId}`);
      return false;
    }
  },

  async removeMember(groupId: string, memberId: string): Promise<boolean> {
    try {
      // Check if member is not the last admin
      const { data: admins } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('role', 'admin');

      if (admins && admins.length <= 1) {
        const { data: memberRole } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', groupId)
          .eq('member_id', memberId)
          .single();

        if (memberRole?.role === 'admin') {
          console.error('Cannot remove the last admin from the group');
          return false;
        }
      }

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('member_id', memberId);

      if (error) {
        handleSupabaseError(error, `removing member from group ${groupId}`);
        return false;
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, `removing member from group ${groupId}`);
      return false;
    }
  },

  // Activities methods
  async getActivities(groupId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('group_activities')
        .select(`
          *,
          creator:members!created_by(*)
        `)
        .eq('group_id', groupId)
        .gte('activity_date', new Date().toISOString())
        .order('activity_date', { ascending: true });

      if (error) {
        handleSupabaseError(error, `fetching activities for group ${groupId}`);
        return [];
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error, `fetching activities for group ${groupId}`);
      return [];
    }
  },

  async createActivity(groupId: string, activityData: {
    title: string;
    description: string;
    activity_date: string;
    location?: string;
    created_by: string;
  }): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('group_activities')
        .insert({
          group_id: groupId,
          ...activityData
        })
        .select(`
          *,
          creator:members!created_by(*)
        `)
        .single();

      if (error) {
        handleSupabaseError(error, 'creating activity');
        return null;
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'creating activity');
      return null;
    }
  },

  // Announcements methods
  async getAnnouncements(groupId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('group_announcements')
        .select(`
          *,
          creator:members!created_by(*)
        `)
        .eq('group_id', groupId)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, `fetching announcements for group ${groupId}`);
        return [];
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error, `fetching announcements for group ${groupId}`);
      return [];
    }
  },

  async createAnnouncement(groupId: string, announcementData: {
    title: string;
    content: string;
    priority: 'normal' | 'high' | 'urgent';
    created_by: string;
    expires_at?: string;
  }): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('group_announcements')
        .insert({
          group_id: groupId,
          ...announcementData
        })
        .select(`
          *,
          creator:members!created_by(*)
        `)
        .single();

      if (error) {
        handleSupabaseError(error, 'creating announcement');
        return null;
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'creating announcement');
      return null;
    }
  },

  // Invitation methods
  async getInvitations(groupId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          inviter:members!invited_by(*),
          group:groups!group_id(*)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, `fetching invitations for group ${groupId}`);
        return [];
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error, `fetching invitations for group ${groupId}`);
      return [];
    }
  },

  async createInvitation(groupId: string, invitationData: {
    email: string;
    invited_by: string;
    message?: string;
  }): Promise<any | null> {
    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('email', invitationData.email)
        .single();

      if (existingMember) {
        const { data: membership } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('member_id', existingMember.id)
          .single();

        if (membership) {
          throw new Error('User is already a member of this group');
        }
      }

      // Check for existing pending invitation
      const { data: existingInvite } = await supabase
        .from('group_invitations')
        .select('id')
        .eq('group_id', groupId)
        .eq('email', invitationData.email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new Error('An invitation has already been sent to this email');
      }

      const { data, error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          ...invitationData
        })
        .select(`
          *,
          inviter:members!invited_by(*),
          group:groups!group_id(*)
        `)
        .single();

      if (error) {
        handleSupabaseError(error, 'creating invitation');
        return null;
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'creating invitation');
      return null;
    }
  },

  async cancelInvitation(invitationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId)
        .eq('status', 'pending');

      if (error) {
        handleSupabaseError(error, 'canceling invitation');
        return false;
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'canceling invitation');
      return false;
    }
  },

  async acceptInvitation(token: string, memberId: string): Promise<boolean> {
    try {
      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        console.error('Invalid or expired invitation');
        return false;
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('group_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);
        return false;
      }

      // Add member to group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: invitation.group_id,
          member_id: memberId,
          role: 'member'
        });

      if (joinError) {
        handleSupabaseError(joinError, 'joining group via invitation');
        return false;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('group_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        handleSupabaseError(updateError, 'updating invitation status');
        // Still return true since the member was added
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'accepting invitation');
      return false;
    }
  },

  async getInvitationByToken(token: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          inviter:members!invited_by(*),
          group:groups!group_id(*)
        `)
        .eq('token', token)
        .single();

      if (error) {
        handleSupabaseError(error, 'fetching invitation by token');
        return null;
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetching invitation by token');
      return null;
    }
  }
};
