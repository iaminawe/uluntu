import { Member as MockMember } from '../data/mock/mockData';
import { Member as ProfileMember, MemberGroup, MemberEvent, MemberResource, MemberPost, MarketplaceListing, MemberOpportunity, MemberAchievement } from '../components/MemberProfile/types';

/**
 * Adapter to convert from the mock data Member type to the profile component Member type
 */
export function mapMemberToProfileMember(member: MockMember): Partial<ProfileMember> {
  // Create empty arrays for all the collections that might not exist in the mock data
  const groups: MemberGroup[] = [];
  const events: MemberEvent[] = [];
  const resources: MemberResource[] = [];
  const posts: MemberPost[] = [];
  const marketplaceListings: MarketplaceListing[] = [];
  const opportunities: MemberOpportunity[] = [];
  const achievements: MemberAchievement[] = [];
  const organizations: { id: number; name: string; role: string }[] = [];

  // Map the basic properties
  return {
    id: member.id,
    name: member.name,
    title: member.title || '',
    bio: member.bio || '',
    location: member.location || '',
    image: member.image,
    skills: member.skills || [],
    organizations,
    groups,
    events,
    resources,
    posts,
    marketplaceListings,
    opportunities,
    achievements,
    website: member.social?.website || '',
    socialLinks: member.social ? [
      ...(member.social.linkedin ? [{ platform: 'LinkedIn', url: member.social.linkedin }] : []),
      ...(member.social.twitter ? [{ platform: 'Twitter', url: member.social.twitter }] : []),
      ...(member.social.github ? [{ platform: 'GitHub', url: member.social.github }] : []),
      ...(member.social.website ? [{ platform: 'Website', url: member.social.website }] : [])
    ] : [],
    employmentStatus: 'freelance', // Default value
    openToVolunteering: false, // Default value
    arrivedInNelson: member.joinDate // Use joinDate as a fallback
  };
}

/**
 * Fetch member contributions from various sources and format them for the profile
 */
export function getMemberContributions() {
  // In a real application, this would make API calls to fetch related content
  // For now, we'll return empty arrays
  return {
    groups: [],
    events: [],
    resources: [],
    posts: [],
    marketplaceListings: [],
    opportunities: []
  };
}
