import { Database } from '@/types/supabase';
import { Member, ContentStatus } from '../types';
import { SocialLinks } from '@/types/common';

type SupabaseMember = Database['public']['Tables']['members']['Row'];

// When Supabase returns data from insert/update operations, it may not include all fields
// This type represents the minimal data we can expect from such operations
type PartialSupabaseMember = Pick<SupabaseMember, 
  'id' | 'name' | 'title' | 'bio' | 'location' | 'image' | 
  'website' | 'status' | 'featured' | 'created_at' | 'company' | 
  'social' | 'arrived_in_nelson' | 'employment_status' | 'open_to_volunteering'
> & {
  // These fields might be missing when data comes from insert/update operations
  onboarding_completed_at?: string | null;
  onboarding_current_step?: number | null;
  onboarding_skipped_steps?: unknown | null;
  profile_completion_percentage?: number | null;
  updated_at?: string | null;
  user_id?: string | null;
};

export function adaptMemberFromDatabase(dbMember: PartialSupabaseMember | SupabaseMember): Member {
  // Handle social links - dbMember.social is stored as JSON in the database
  let social: SocialLinks | undefined = undefined;
  
  if (dbMember.social && typeof dbMember.social === 'object') {
    // If social is stored as JSON, use it directly
    social = dbMember.social as SocialLinks;
  } else if (dbMember.website) {
    // Fallback to website field if social is not available
    social = { website: dbMember.website };
  }

  const member = {
    id: dbMember.id,
    slug: (dbMember as any).slug || undefined, // Include slug field
    name: dbMember.name,
    title: dbMember.title || '',
    company: dbMember.company || undefined, // Use company field from database if available
    location: dbMember.location || undefined,
    image: dbMember.image || '/placeholder-avatar.png',
    bio: dbMember.bio || undefined,
    intro: (dbMember as any).intro || undefined,
    skills: [], // This would need to be populated from member_skills table
    joinDate: dbMember.created_at || new Date().toISOString(),
    social: social,
    status: (['draft', 'published', 'archived', 'pending'].includes(dbMember.status ?? '') ? dbMember.status as ContentStatus : 'draft'), // Validate and cast
    featured: dbMember.featured || false,
    created_at: dbMember.created_at || new Date().toISOString()
  };
  
  // Add user_id if available from database
  if (dbMember.user_id) {
    (member as any).user_id = dbMember.user_id;
  }
  
  return member;
}

export function adaptMemberToDatabase(member: Partial<Member>): Partial<SupabaseMember> {
  return {
    name: member.name,
    title: member.title || undefined,
    location: member.location || undefined,
    image: member.image || undefined,
    bio: member.bio || undefined,
    website: member.social?.website || undefined,
    status: member.status || 'draft',
    featured: member.featured || undefined,
    ...((member as any).intro && { intro: (member as any).intro })
  } as any;
}

// Profile-specific adapter function
// Define a type that includes both Member from hooks and the main Member type
type MemberLike = {
  id: string;
  slug?: string;
  name: string;
  title?: string;
  role?: string;
  bio?: string;
  location?: string;
  image?: string;
  skills?: string[];
  joinDate?: string;
  social?: Record<string, string>;
  status?: ContentStatus;
  created_at?: string;
  user_id?: string; // Add user_id to support profile ownership detection
};

export function mapMemberToProfileMember(member: MemberLike): import('../components/MemberProfile/types').Member {
  const profileMember = {
    id: member.id,
    name: member.name,
    title: member.title || member.role || 'Member', // Map title from role if title is not available
    bio: member.bio || '',
    location: member.location || '',
    image: member.image || '/placeholder-avatar.png',
    skills: member.skills || [],
    joinDate: member.joinDate || member.created_at || new Date().toISOString(), // Pass through from MainMember with fallback
    status: member.status || 'published' as ContentStatus,     // Pass through from MainMember with default
    organizations: [], // TODO: Populate from relationships
    groups: [], // TODO: Populate from relationships
    events: [], // TODO: Populate from relationships
    resources: [], // TODO: Populate from relationships
    posts: [], // TODO: Populate from relationships
    marketplaceListings: [], // TODO: Populate from relationships
    opportunities: [], // TODO: Populate from relationships
    achievements: [], // TODO: Populate from relationships
    // website: member.social?.website, // Removed as ProfileMember uses socialLinks array for website
    socialLinks: member.social ? [
      // Ensure 'Website' is capitalized consistently if it matters for platform identification
      { platform: 'Website', url: member.social.website || '' }
    ].filter(link => link.url) : [],
    employmentStatus: 'not-looking' as const, // TODO: Map from member status
    openToVolunteering: false, // TODO: Add to member type
    arrivedInNelson: member.joinDate || member.created_at || new Date().toISOString()
  };
  
  // Add user_id to the profile member so ProfileHeader can check ownership
  if (member.user_id) {
    (profileMember as any).user_id = member.user_id;
  }
  
  return profileMember;
}

// Moved from dataAdapters.ts
export interface AdaptedMember {
  id: string;
  name: string;
  title: string;
  intro: string;
  bio: string;
  location: string;
  image: string;
  website: string;
  employmentStatus: string;
  openToVolunteering: boolean;
  arrivedInNelson: string;
  status: string; 
  featured: boolean;
  createdAt: string;
  company: string;
  skills: string[];
  joinDate: string;
  social: SocialLinks;
}

// This is the adaptMemberFromSupabase from dataAdapters.ts
export function adaptMemberFromSupabase(member: SupabaseMember): AdaptedMember {
  const adaptedMember: AdaptedMember = {
    id: member.id,
    name: member.name,
    title: member.title || '',
    intro: (member as any).intro || '',
    bio: member.bio || '',
    location: member.location || '',
    image: member.image || '',
    website: member.website || '',
    employmentStatus: member.employment_status || '',
    openToVolunteering: member.open_to_volunteering || false,
    arrivedInNelson: member.arrived_in_nelson || '',
    status: member.status || 'published',
    featured: member.featured || false,
    createdAt: member.created_at || new Date().toISOString(),
    company: '', 
    skills: [], 
    joinDate: member.created_at || new Date().toISOString(), 
    social: {
      linkedin: '', // Supabase 'members' table does not have a separate linkedin column
      twitter: '',  // Supabase 'members' table does not have a separate twitter column
      github: '',   // Supabase 'members' table does not have a separate github column
      website: member.website || '' // Use the 'website' column from Supabase
    }
  };
  return adaptedMember;
}

// This is the adaptMemberToSupabase from dataAdapters.ts
export function adaptMemberToSupabase(member: AdaptedMember): Database['public']['Tables']['members']['Insert'] {
  const adaptedMemberForDb: Database['public']['Tables']['members']['Insert'] = {
    name: member.name,
    title: member.title,
    bio: member.bio,
    location: member.location,
    image: member.image,
    website: member.website,
    employment_status: member.employmentStatus,
    open_to_volunteering: member.openToVolunteering,
    arrived_in_nelson: member.arrivedInNelson,
    status: member.status, 
    featured: member.featured
    // Supabase 'members' table does not have separate linkedin, twitter, github columns
    // The 'website' column is already mapped from member.website above
  };
  return adaptedMemberForDb;
}
