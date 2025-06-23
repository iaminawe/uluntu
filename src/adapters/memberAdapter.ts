import { Database } from '../types/supabase';
import { Member, SocialLinks, ContentStatus } from '../types'; // Added SocialLinks and ContentStatus

type SupabaseMember = Database['public']['Tables']['members']['Row'];

export function adaptMemberFromDatabase(dbMember: SupabaseMember): Member {
  return {
    id: dbMember.id,
    name: dbMember.name,
    title: dbMember.title || '',
    company: undefined, // This would need to be populated from employment status or company relationships
    location: dbMember.location || undefined,
    image: dbMember.image || '/placeholder-avatar.png',
    bio: dbMember.bio || undefined,
    intro: (dbMember as any).intro || undefined, // Type assertion for intro field
    skills: [], // This would need to be populated from member_skills table
    joinDate: dbMember.created_at || new Date().toISOString(),
    social: dbMember.website ? { website: dbMember.website } : undefined,
    status: (['draft', 'published', 'archived', 'pending'].includes(dbMember.status ?? '') ? dbMember.status as ContentStatus : 'draft'), // Validate and cast
    featured: dbMember.featured || false,
    created_at: dbMember.created_at || new Date().toISOString()
  };
}

export function adaptMemberToDatabase(member: Partial<Member>): Partial<SupabaseMember> {
  const result: any = {
    name: member.name,
    title: member.title || undefined,
    location: member.location || undefined,
    image: member.image || undefined,
    bio: member.bio || undefined,
    intro: member.intro || undefined,
    website: member.social?.website || undefined,
    status: member.status || 'draft',
    featured: member.featured || undefined
  };
  return result;
}

// Profile-specific adapter function
// Define a type that includes both Member from hooks and the main Member type
type MemberLike = {
  id: string;
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
};

export function mapMemberToProfileMember(member: MemberLike): import('../components/MemberProfile/types').Member {
  return {
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
    intro: (member as any).intro || '', // Type assertion for intro field
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
