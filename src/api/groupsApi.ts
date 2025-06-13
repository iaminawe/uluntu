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
  }
};
