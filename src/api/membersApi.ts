import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptMemberFromDatabase,
  adaptMemberToDatabase
} from '../adapters/memberAdapter';
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
      // First, get the basic member data without the problematic joins
      let query = supabase
        .from('members')
        .select(`
          *,
          member_skills(skill)
        `)
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

      // Filter by skills if provided
      let filteredData = data || [];
      if (filters?.skills && filters.skills.length > 0) {
        filteredData = filteredData.filter(member => 
          member.member_skills?.some(s_obj => {
            if (typeof s_obj === 'object' && s_obj !== null && 'skill' in s_obj) {
              const skillVal = (s_obj as { skill: unknown }).skill;
              if (typeof skillVal === 'string') {
                return filters.skills!.includes(skillVal);
              }
            }
            return false;
          })
        );
      }

      // Use our helper function instead of adaptListFromSupabase
      return adaptItemsList(filteredData, adaptMemberFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching members');
      return [];
    }
  },

  async getById(id: string): Promise<Member | null> {
    try {
      // First, get the basic member data without the problematic joins
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select(`
          *,
          member_skills(skill)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (memberError) {
        handleSupabaseError(memberError, 'fetching member by id');
        return null;
      }
      
      // Get the companies for this member in a separate query to avoid RLS recursion
      // This approach fetches the company_id values first, then gets the company details
      const { data: companyMembersData, error: companyMembersError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('member_id', id);
      
      // If we have company IDs, fetch the company details
      let companiesData: { id: string; name: string; logo: string }[] = [];
      if (!companyMembersError && companyMembersData && companyMembersData.length > 0) {
        const companyIds = companyMembersData.map(cm => cm.company_id);
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, logo')
          .in('id', companyIds);
        
        if (!companiesError) {
          companiesData = companies || [];
        }
      }
      
      // Combine the data
      const combinedData = {
        ...memberData,
        company_members: companiesData.map(company => ({
          companies: company
        }))
      };
      
      return adaptMemberFromDatabase(combinedData);
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
