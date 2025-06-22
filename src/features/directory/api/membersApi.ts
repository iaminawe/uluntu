import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import {
  adaptMemberFromDatabase,
  adaptMemberToDatabase
} from '../utils/memberAdapter';
import { Member, ContentStatus } from '../types';

// Helper function to adapt a list of items
function adaptItemsList<T, R>(items: T[], adapter: (item: T) => R): R[] {
  return items.map(item => adapter(item));
}

// Define the input type for member data passed from the application
export interface MemberInput {
  name: string;
  title?: string;
  bio?: string;
  location?: string;
  image?: string;
  social?: { website?: string };
  intro?: string;
  status?: ContentStatus;
  featured?: boolean;
  // Removed nullable (null) types to match what adaptMemberToDatabase expects
}

export const membersApi = {
  async getAll(filters?: { search?: string; skills?: string[] }): Promise<Member[]> {
    try {
      // Get the basic member data without joins to prevent timeouts
      let query = supabase
        .from('members')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) {
        handleSupabaseError(error, 'fetching members');
        return [];
      }

      // Log the raw data structure to understand what we're working with
      console.log('[MembersAPI] Raw data structure:', {
        firstItem: data && data.length > 0 ? Object.keys(data[0]) : 'No data',
        sampleData: data?.slice(0, 1)
      });
      
      // Ensure we have data to adapt
      if (!data || data.length === 0) {
        console.log('[MembersAPI] No data to adapt, returning empty array');
        return [];
      }
      
      // Directly adapt the data without using helper functions that might be causing issues
      const adapted = data.map(item => {
        // Create a basic member object with required fields
        const member: Member = {
          id: item.id,
          name: item.name || '',
          title: item.title || '',
          bio: item.bio || '',
          location: item.location || '',
          image: item.image || '',
          social: item.social || {},
          intro: item.intro || '',
          status: item.status || 'draft',
          featured: item.featured || false,
          // Add any other fields that might be needed
        };
        
        return member;
      });
      
      console.log('[MembersAPI] Adapted members:', {
        count: adapted.length,
        sample: adapted.slice(0, 2)
      });
      
      return adapted;
    } catch (error) {
      handleSupabaseError(error, 'fetching members');
      return [];
    }
  },

  async getById(id: string): Promise<Member | null> {
    try {
      // Get the basic member data without joins to prevent timeouts
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        handleSupabaseError(error, 'fetching member by id');
        return null;
      }
      
      return data ? adaptMemberFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'fetching member by id');
      return null;
    }
  },

  async create(memberData: MemberInput): Promise<Member | null> {
    try {
      // Map MemberInput to what adaptMemberToDatabase expects
      const memberWithCorrectFormat: Partial<Member> = {
        name: memberData.name,
        title: memberData.title,
        bio: memberData.bio,
        location: memberData.location,
        image: memberData.image,
        social: memberData.social,
        intro: memberData.intro,
        status: memberData.status,
        featured: memberData.featured
      };
      
      // Convert to the appropriate format for Supabase
      const supabaseData = adaptMemberToDatabase(memberWithCorrectFormat);
      
      // Create object with correct structure for Supabase insert
      const insertData = {
        name: supabaseData.name || memberData.name, // name is required
        title: supabaseData.title,
        bio: supabaseData.bio,
        location: supabaseData.location,
        image: supabaseData.image,
        website: supabaseData.website,
        intro: supabaseData.intro,
        status: supabaseData.status || 'draft',
        featured: supabaseData.featured
      };
      
      const { data, error } = await supabase
        .from('members')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating member');
        return null;
      }
      
      return data ? adaptMemberFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating member');
      return null;
    }
  },

  async update(id: string, memberData: Partial<MemberInput>): Promise<Member | null> {
    try {
      // Map Partial<MemberInput> to what adaptMemberToDatabase expects
      const memberWithCorrectFormat: Partial<Member> = {};
      if (memberData.name !== undefined) memberWithCorrectFormat.name = memberData.name;
      if (memberData.title !== undefined) memberWithCorrectFormat.title = memberData.title;
      if (memberData.bio !== undefined) memberWithCorrectFormat.bio = memberData.bio;
      if (memberData.location !== undefined) memberWithCorrectFormat.location = memberData.location;
      if (memberData.image !== undefined) memberWithCorrectFormat.image = memberData.image;
      if (memberData.social !== undefined) memberWithCorrectFormat.social = memberData.social;
      if (memberData.intro !== undefined) memberWithCorrectFormat.intro = memberData.intro;
      if (memberData.status !== undefined) memberWithCorrectFormat.status = memberData.status;
      if (memberData.featured !== undefined) memberWithCorrectFormat.featured = memberData.featured;
      
      // Convert to the appropriate format for Supabase
      const supabaseData = adaptMemberToDatabase(memberWithCorrectFormat);
      
      // Create object with correct structure for Supabase update
      const updateData: Record<string, string | boolean | null | undefined> = {};
      if (supabaseData.name !== undefined) updateData.name = supabaseData.name;
      if (supabaseData.title !== undefined) updateData.title = supabaseData.title;
      if (supabaseData.bio !== undefined) updateData.bio = supabaseData.bio;
      if (supabaseData.location !== undefined) updateData.location = supabaseData.location;
      if (supabaseData.image !== undefined) updateData.image = supabaseData.image;
      if (supabaseData.website !== undefined) updateData.website = supabaseData.website;
      if (supabaseData.intro !== undefined) updateData.intro = supabaseData.intro;
      if (supabaseData.status !== undefined) updateData.status = supabaseData.status;
      if (supabaseData.featured !== undefined) updateData.featured = supabaseData.featured;
      
      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updating member');
        return null;
      }
      
      return data ? adaptMemberFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'updating member');
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting member');
        return false;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, 'deleting member');
      return false;
    }
  }
};
