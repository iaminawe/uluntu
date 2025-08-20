import type { Company, Member, ContentStatus } from '../../types';
import type { Database } from '../../types/supabase';
import type { SocialLinks } from '../../types/common';

// Define Supabase table row types for easier reference
type SupabaseCompany = Database['public']['Tables']['companies']['Row'];
type SupabaseMember = Database['public']['Tables']['members']['Row'];

/**
 * Adapts a Supabase company record to the frontend Company type
 * This handles property name differences and ensures type compatibility
 */
export function adaptCompanyForUI(supabaseCompany: SupabaseCompany): Company {
  // Convert status string to ContentStatus type
  const status: ContentStatus = (supabaseCompany.status === 'published' || 
                               supabaseCompany.status === 'draft' || 
                               supabaseCompany.status === 'archived') 
    ? supabaseCompany.status 
    : 'published';
    
  // Create a company object with the required frontend properties
  const company: Company = {
    id: supabaseCompany.id,
    name: supabaseCompany.name,
    description: supabaseCompany.description,
    logo: supabaseCompany.logo || '',
    coverImage: supabaseCompany.cover_image || undefined,
    industry: Array.isArray(supabaseCompany.industry) ? supabaseCompany.industry : [],
    size: supabaseCompany.size,
    founded: supabaseCompany.founded,
    location: supabaseCompany.location,
    website: supabaseCompany.website || undefined,
    // Since social is not in the Supabase schema, we'll create an empty object
    social: {} as SocialLinks,
    status: status,
    created_at: supabaseCompany.created_at,
    // Handle the case where updated_at doesn't exist in the Supabase schema
    updated_at: supabaseCompany.created_at || new Date().toISOString(),
    employees: []
  };
  
  return company;
}

/**
 * Adapts a Supabase member record to the frontend Member type
 * This handles property name differences and ensures type compatibility
 */
export function adaptMemberForUI(supabaseMember: SupabaseMember): Member {
  // Convert status string to ContentStatus type
  const status: ContentStatus = (supabaseMember.status === 'published' || 
                               supabaseMember.status === 'draft' || 
                               supabaseMember.status === 'archived') 
    ? supabaseMember.status as ContentStatus 
    : 'published';
    
  // Create a member object with the required frontend properties
  const member: Member = {
    id: supabaseMember.id,
    slug: (supabaseMember as any).slug || undefined, // Include slug field for proper URL generation
    name: supabaseMember.name || '',
    title: supabaseMember.title || '',
    // Handle missing fields in Supabase schema
    company: undefined, // Not in the Supabase schema
    location: supabaseMember.location || undefined,
    image: supabaseMember.image || '',
    bio: supabaseMember.bio || undefined,
    intro: (supabaseMember as any).intro || undefined,
    skills: [], // Not in the Supabase schema, provide empty array
    joinDate: supabaseMember.created_at || new Date().toISOString(), // Use created_at as joinDate
    social: {} as SocialLinks, // Not in the Supabase schema
    status: status,
    created_at: supabaseMember.created_at || new Date().toISOString(),
    // Handle the case where updated_at doesn't exist in the Supabase schema
    updated_at: supabaseMember.created_at || new Date().toISOString()
  };
  
  return member;
}

/**
 * Adapts an array of Supabase company records to frontend Company types
 */
export function adaptCompaniesForUI(supabaseCompanies: SupabaseCompany[]): Company[] {
  return supabaseCompanies.map(adaptCompanyForUI);
}

/**
 * Adapts an array of Supabase member records to frontend Member types
 */
export function adaptMembersForUI(supabaseMembers: SupabaseMember[]): Member[] {
  return supabaseMembers.map(adaptMemberForUI);
}
