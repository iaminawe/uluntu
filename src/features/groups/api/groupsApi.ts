import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import {
  adaptGroupFromDatabase,
  adaptGroupToSupabaseInsert,
  adaptGroupToSupabaseUpdate,
  GroupInsertData,
  GroupUpdateData,
} from '../utils/groupAdapter';
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
  // Note: cover_image and member_count are in Supabase schema but not handled by adaptGroupToSupabase currently.
}

export const groupsApi = {
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
      
      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(data || [], adaptGroupFromDatabase);
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
      
      // Adapt only the core group data. The adaptGroupFromDatabase function initializes
      // events, resources, etc., to empty arrays as per FrontendGroup definition.
      return groupData ? adaptGroupFromDatabase(groupData) : null;
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
      
      return data ? adaptGroupFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating group');
      return null;
    }
  },

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          joined_date: new Date().toISOString()
        });

      if (error) {
        handleSupabaseError(error, 'joining group');
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, 'joining group');
      return false;
    }
  },

  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'leaving group');
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, 'leaving group');
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
        .order('joined_date', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'fetching group members');
        return [];
      }
      
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetching group members');
      return [];
    }
  }
};
