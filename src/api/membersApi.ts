import { supabase, handleSupabaseError } from './supabaseUtils';
import {
  adaptMemberFromSupabase,
  adaptMemberToSupabase,
  adaptListFromSupabase
} from '../adapters/dataAdapters';

// TODO: Consider importing specific Supabase row types for 'data' variables
// e.g., import { Tables } from '../types/supabase';
// type MemberTableRow = Tables<'members'>;

// Define the input type for member data passed from the application
export interface MemberInput {
  name: string; // Required for creation, maps to Supabase 'name'
  title?: string | null; // maps to Supabase 'title'
  bio?: string | null; // maps to Supabase 'bio'
  location?: string | null; // maps to Supabase 'location'
  image?: string | null; // maps to Supabase 'image'
  website?: string | null; // maps to Supabase 'website'
  employmentStatus?: string | null; // maps to Supabase 'employment_status'
  openToVolunteering?: boolean | null; // maps to Supabase 'open_to_volunteering'
  arrivedInNelson?: string | null; // maps to Supabase 'arrived_in_nelson'
  status?: string; // maps to Supabase 'status', e.g., 'draft', 'published'
  featured?: boolean | null; // maps to Supabase 'featured'
  // Note: 'id', 'user_id', 'created_at' are typically handled by Supabase or not part of this input structure.
  // 'intro' is not currently mapped by adaptMemberToSupabase.
}

export const membersApi = {
  async getAll(filters?: { search?: string; skills?: string[] }) {
    try {
      console.log('Fetching all members with filters:', filters);
      
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
        console.error('Error fetching members:', error);
        handleSupabaseError(error);
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

      return adaptListFromSupabase(filteredData, adaptMemberFromSupabase);
    } catch (error) {
      handleSupabaseError(error);
      // return []; // Or rethrow, depending on desired error handling for callers
    }
  },

  async getById(id: string) {
    try {
      console.log('Fetching member with ID:', id);
      
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
        console.error('Error fetching member:', memberError);
        handleSupabaseError(memberError);
        return null;
      }
      
      // Get the companies for this member in a separate query to avoid RLS recursion
      // This approach fetches the company_id values first, then gets the company details
      const { data: companyMembersData, error: companyMembersError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('member_id', id);
        
      if (companyMembersError) {
        console.error('Error fetching company members:', companyMembersError);
        // Don't throw error, just log it
      }
      
      // If we have company IDs, fetch the company details
      let companiesData = [];
      if (companyMembersData && companyMembersData.length > 0) {
        const companyIds = companyMembersData.map(cm => cm.company_id);
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, logo')
          .in('id', companyIds);
          
        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          // Don't throw error, just log it
        } else {
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
      
      console.log('Member data combined:', combinedData);
      return adaptMemberFromSupabase(combinedData);
    } catch (error) {
      console.error('Exception in getById:', error);
      handleSupabaseError(error);
      return null;
    }
  },

  async create(memberData: MemberInput) { // Input is App-specific, adapted to Supabase Insert type
    try {
      const supabaseData = adaptMemberToSupabase(memberData);
      const { data, error } = await supabase
        .from('members')
        .insert(supabaseData)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMemberFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async update(id: string, memberData: Partial<MemberInput>) { // Input is App-specific, adapted to Supabase Update type
    try {
      const supabaseData = adaptMemberToSupabase(memberData);
      const { data, error } = await supabase
        .from('members')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data ? adaptMemberFromSupabase(data) : null;
    } catch (error) {
      handleSupabaseError(error);
      // return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
      return !error; // Return true if no error, false otherwise
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }
};
