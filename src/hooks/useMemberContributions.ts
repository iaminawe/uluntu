import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for member contributions
export interface MemberContributions {
  groups: {
    id: string;
    name: string;
    role: string;
    joinedDate: string;
  }[];
  events: {
    id: string;
    title: string;
    date: string;
    presentation: string;
  }[];
  resources: {
    id: string;
    title: string;
    type: string;
    date: string;
    url: string;
  }[];
  posts: {
    id: string;
    title: string;
    excerpt?: string;
    group: {
      id: string;
      name: string;
    };
    date: string;
  }[];
  marketplaceListings: {
    id: string;
    title: string;
    type: string;
    price: number;
    image: string;
    createdAt: string;
  }[];
  opportunities: {
    id: string;
    title: string;
    type: string;
    location: string;
    remote?: boolean;
    description: string;
  }[];
}

/**
 * Hook to fetch all contributions for a member
 */
export function useMemberContributions(memberId?: string) {
  // Remove the duplicate member fetch - we'll pass memberId directly
  // Then fetch all related content in parallel
  return useQuery({
    queryKey: ['member-contributions', memberId],
    queryFn: async () => {
      if (!memberId) {
        throw new Error('Member ID required');
      }

      // Fetch real data from database in parallel
      const [
        groupsData,
        eventsData, 
        resourcesData,
        postsData,
        marketplaceListingsData,
        opportunitiesData
      ] = await Promise.all([
        fetchMemberGroups(memberId),
        fetchMemberEvents(memberId),
        fetchMemberResources(memberId),
        fetchMemberPosts(memberId),
        fetchMemberMarketplaceListings(memberId),
        fetchMemberOpportunities(memberId)
      ]);

      const groups = groupsData || [];
      const events = eventsData || [];
      const resources = resourcesData || [];
      const posts = postsData || [];
      const marketplaceListings = marketplaceListingsData || [];
      const opportunities = opportunitiesData || [];
      
      const contributions: MemberContributions = {
        groups,
        events,
        resources,
        posts,
        marketplaceListings,
        opportunities
      };

      return contributions;
    },
    enabled: !!memberId, // Only run this query if we have a member ID
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

/**
 * Hook to fetch a specific type of contribution for a member
 */
export function useMemberContributionsByType(memberId: string, type: keyof MemberContributions) {
  const { data: contributions, isLoading, error } = useMemberContributions(memberId);
  
  return {
    data: contributions ? contributions[type] : [],
    isLoading,
    error
  };
}

// Real database functions to fetch member contributions from Supabase

/**
 * Fetch groups where the member is a participant
 */
async function fetchMemberGroups(memberId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_date,
      groups:group_id (
        id,
        name,
        slug
      )
    `)
    .eq('member_id', memberId)
    .order('joined_date', { ascending: false });

  if (error) {
    console.error('Error fetching member groups:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.groups?.id || '',
    name: item.groups?.name || '',
    role: item.role,
    joinedDate: item.joined_date
  }));
}

/**
 * Fetch events where the member is an organizer or presenter
 */
async function fetchMemberEvents(memberId: string) {
  // Fetch events where member is organizer (created_by)
  const { data: organizedEvents, error: organizedError } = await supabase
    .from('events')
    .select('id, title, date, slug')
    .eq('organizer_id', memberId)
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (organizedError) {
    console.error('Error fetching organized events:', organizedError);
  }

  // For now, we'll treat organized events as presentations
  // In the future, we could add a separate event_presenters table
  return (organizedEvents || []).map(event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    presentation: 'Event Organizer'
  }));
}

/**
 * Fetch resources contributed by the member
 */
async function fetchMemberResources(memberId: string) {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, type, created_at, url, description')
    .eq('contributor_id', memberId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching member resources:', error);
    return [];
  }

  return (data || []).map(resource => ({
    id: resource.id,
    title: resource.title,
    type: resource.type || 'document',
    date: resource.created_at,
    url: resource.url || '#'
  }));
}

/**
 * Fetch posts authored by the member
 */
async function fetchMemberPosts(memberId: string) {
  const { data, error } = await supabase
    .from('group_posts')
    .select(`
      id,
      title,
      content,
      created_at,
      groups:group_id (
        id,
        name
      )
    `)
    .eq('author_id', memberId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching member posts:', error);
    return [];
  }

  return (data || []).map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.content ? post.content.substring(0, 150) + '...' : undefined,
    group: {
      id: post.groups?.id || '',
      name: post.groups?.name || ''
    },
    date: post.created_at
  }));
}

/**
 * Fetch marketplace listings created by the member
 */
async function fetchMemberMarketplaceListings(memberId: string) {
  // Check if marketplace table exists - this feature may not be fully implemented yet
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('id, title, type, price, image, created_at')
    .eq('seller_id', memberId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.warn('Marketplace listings not available:', error.message);
    return [];
  }

  return (data || []).map(listing => ({
    id: listing.id,
    title: listing.title,
    type: listing.type || 'item',
    price: listing.price || 0,
    image: listing.image || '',
    createdAt: listing.created_at
  }));
}

/**
 * Fetch opportunities posted by the member
 */
async function fetchMemberOpportunities(memberId: string) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, type, location, remote, description, created_at')
    .eq('posted_by', memberId)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Opportunities not available:', error.message);
    return [];
  }

  return (data || []).map(opportunity => ({
    id: opportunity.id,
    title: opportunity.title,
    type: opportunity.type || 'opportunity',
    location: opportunity.location || '',
    remote: opportunity.remote || false,
    description: opportunity.description
  }));
}
