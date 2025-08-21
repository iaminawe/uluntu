/**
 * Group Member Management API
 * Comprehensive member management functions for groups
 */

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type GroupMember = Database['public']['Tables']['group_members']['Row'];
type GroupInvitation = Database['public']['Tables']['group_invitations']['Row'];
type Member = Database['public']['Tables']['members']['Row'];

export interface MemberWithRole extends Member {
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive' | 'pending' | 'banned';
  joined_at: string | null;
}

export interface GroupInvitationCreate {
  group_id: string;
  invited_email?: string;
  invited_member_id?: string;
  role?: 'admin' | 'moderator' | 'member';
  message?: string;
}

export interface MemberRoleUpdate {
  group_id: string;
  member_id: string;
  role: 'admin' | 'moderator' | 'member';
}

/**
 * Group Member Management API
 */
export const groupMemberManagementApi = {
  /**
   * Check if a user is a member of a group
   */
  async isMember(groupId: string, userId: string): Promise<boolean> {
    
    try {
      // First get the member ID from user ID
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (!member) return false;
      
      // Check membership
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('member_id', member.id)
        .eq('status', 'active')
        .single();
      
      return !error && !!data;
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  },

  /**
   * Get member role in a group
   */
  async getMemberRole(groupId: string, userId: string): Promise<'admin' | 'moderator' | 'member' | null> {
    
    try {
      // First get the member ID from user ID
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (!member) return null;
      
      // Get member role
      const { data, error } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('member_id', member.id)
        .eq('status', 'active')
        .single();
      
      if (error || !data) return null;
      
      return data.role as 'admin' | 'moderator' | 'member';
    } catch (error) {
      console.error('Error getting member role:', error);
      return null;
    }
  },

  /**
   * Update member role in a group
   */
  async updateMemberRole({ group_id, member_id, role }: MemberRoleUpdate): Promise<boolean> {
    
    try {
      // Get current user's member ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: currentMember } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!currentMember) throw new Error('Current user not found');
      
      // Call the database function to change role
      const { data, error } = await supabase
        .rpc('change_member_role', {
          p_group_id: group_id,
          p_member_id: member_id,
          p_new_role: role,
          p_changed_by: currentMember.id
        });
      
      if (error) throw error;
      
      return data === true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  },

  /**
   * Remove a member from a group
   */
  async removeMember(groupId: string, memberId: string): Promise<boolean> {
    
    try {
      // Update member status to inactive
      const { error } = await supabase
        .from('group_members')
        .update({ 
          status: 'inactive',
          left_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('member_id', memberId);
      
      if (error) throw error;
      
      // Update group member count
      await supabase
        .rpc('decrement', {
          table_name: 'groups',
          column_name: 'member_count',
          row_id: groupId
        });
      
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  },

  /**
   * Ban a member from a group
   */
  async banMember(groupId: string, memberId: string, reason?: string): Promise<boolean> {
    
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ 
          status: 'banned',
          ban_reason: reason,
          left_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('member_id', memberId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error banning member:', error);
      return false;
    }
  },

  /**
   * Get all members of a group with pagination
   */
  async getGroupMembers(
    groupId: string, 
    options?: {
      page?: number;
      limit?: number;
      role?: string;
      status?: string;
      search?: string;
    }
  ): Promise<{ members: MemberWithRole[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;
    
    try {
      let query = supabase
        .from('group_members')
        .select(`
          *,
          member:members!inner(*)
        `, { count: 'exact' })
        .eq('group_id', groupId);
      
      // Apply filters
      if (options?.role) {
        query = query.eq('role', options.role);
      }
      
      if (options?.status) {
        query = query.eq('status', options.status);
      } else {
        query = query.eq('status', 'active');
      }
      
      if (options?.search) {
        query = query.or(`member.name.ilike.%${options.search}%,member.email.ilike.%${options.search}%`);
      }
      
      // Apply pagination
      query = query
        .range(offset, offset + limit - 1)
        .order('joined_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const members: MemberWithRole[] = (data || []).map(item => ({
        ...item.member,
        role: item.role,
        status: item.status,
        joined_at: item.joined_at
      }));
      
      return {
        members,
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting group members:', error);
      return { members: [], total: 0 };
    }
  },

  /**
   * Create a group invitation
   */
  async createInvitation(invitation: GroupInvitationCreate): Promise<string | null> {
    
    try {
      // Get current user's member ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: currentMember } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!currentMember) throw new Error('Current user not found');
      
      // Create invitation
      const { data, error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: invitation.group_id,
          invited_by: currentMember.id,
          invited_email: invitation.invited_email,
          invited_member_id: invitation.invited_member_id,
          role: invitation.role || 'member',
          message: invitation.message,
          status: 'pending'
        })
        .select('token')
        .single();
      
      if (error) throw error;
      
      return data?.token || null;
    } catch (error) {
      console.error('Error creating invitation:', error);
      return null;
    }
  },

  /**
   * Accept a group invitation
   */
  async acceptInvitation(token: string): Promise<boolean> {
    
    try {
      // Get current user's member ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!member) throw new Error('Member not found');
      
      // Call the accept_invitation function
      const { data, error } = await supabase
        .rpc('accept_invitation', {
          p_token: token,
          p_member_id: member.id
        });
      
      if (error) throw error;
      
      return data === true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  },

  /**
   * Decline a group invitation
   */
  async declineInvitation(token: string): Promise<boolean> {
    
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ 
          status: 'declined',
          declined_at: new Date().toISOString()
        })
        .eq('token', token)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error declining invitation:', error);
      return false;
    }
  },

  /**
   * Cancel a group invitation
   */
  async cancelInvitation(invitationId: string): Promise<boolean> {
    
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      return false;
    }
  },

  /**
   * Get pending invitations for a group
   */
  async getGroupInvitations(groupId: string): Promise<GroupInvitation[]> {
    
    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          invited_by_member:members!invited_by(name, avatar_url),
          invited_member:members!invited_member_id(name, email, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  },

  /**
   * Get user's pending invitations
   */
  async getUserInvitations(userId: string): Promise<GroupInvitation[]> {
    
    try {
      // Get member ID
      const { data: member } = await supabase
        .from('members')
        .select('id, email')
        .eq('user_id', userId)
        .single();
      
      if (!member) return [];
      
      // Get invitations
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          group:groups!group_id(id, name, slug, image_url, visibility),
          invited_by_member:members!invited_by(name, avatar_url)
        `)
        .or(`invited_member_id.eq.${member.id},invited_email.eq.${member.email}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting user invitations:', error);
      return [];
    }
  },

  /**
   * Promote member to admin
   */
  async promoteMember(groupId: string, memberId: string): Promise<boolean> {
    return this.updateMemberRole({ group_id: groupId, member_id: memberId, role: 'admin' });
  },

  /**
   * Demote admin to member
   */
  async demoteMember(groupId: string, memberId: string): Promise<boolean> {
    return this.updateMemberRole({ group_id: groupId, member_id: memberId, role: 'member' });
  },

  /**
   * Transfer group ownership
   */
  async transferOwnership(groupId: string, newOwnerId: string): Promise<boolean> {
    
    try {
      // Update group creator
      const { error: groupError } = await supabase
        .from('groups')
        .update({ created_by: newOwnerId })
        .eq('id', groupId);
      
      if (groupError) throw groupError;
      
      // Make new owner an admin
      const { error: memberError } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('group_id', groupId)
        .eq('member_id', newOwnerId);
      
      if (memberError) throw memberError;
      
      return true;
    } catch (error) {
      console.error('Error transferring ownership:', error);
      return false;
    }
  }
};

export default groupMemberManagementApi;