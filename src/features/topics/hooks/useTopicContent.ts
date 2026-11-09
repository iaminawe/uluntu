import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api';
import { 
  getEventUrl, 
  getNewsArticleUrl, 
  getResourceUrl, 
  getGroupUrl, 
  getMarketplaceListingUrl, 
  getOpportunityUrl, 
  getCompanyUrl,
  getGalleryUrl
} from '@/utils/contentUrlUtils';

interface TopicContentItem {
  id: string;
  title: string;
  excerpt?: string;
  description?: string;
  date?: string;
  image?: string;
  author?: {
    id: string;
    name: string;
    image?: string;
  };
  type: string;
  url: string;
  status?: string;
  featured?: boolean;
}

interface TopicContentResponse {
  [entityType: string]: TopicContentItem[];
}

export const topicContentQueryKeys = {
  byTopic: (topicSlug: string) => ['topic-content', topicSlug] as const,
};

async function fetchTopicContent(topicSlug: string): Promise<TopicContentResponse> {
  if (!topicSlug) return {};

  try {
    // Get topic ID first
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', topicSlug)
      .eq('is_active', true)
      .single();

    if (topicError || !topic) {
      console.error('Topic not found:', topicError);
      return {};
    }

    const topicId = topic.id;
    const content: TopicContentResponse = {};

    // Fetch events
    const { data: events } = await supabase
      .from('event_topics')
      .select(`
        events!inner (
          id,
          title,
          description,
          date,
          image,
          status,
          organizer_id,
          members!events_organizer_id_fkey (
            id,
            name,
            image
          )
        )
      `)
      .eq('topic_id', topicId)
      .eq('events.status', 'published');

    if (events) {
      content.events = events.map((item: any) => ({
        id: item.events.id,
        title: item.events.title,
        excerpt: item.events.description,
        date: item.events.date,
        image: item.events.image,
        author: {
          id: item.events.members?.id || '',
          name: item.events.members?.name || 'Unknown',
          image: item.events.members?.image
        },
        type: 'event',
        url: getEventUrl(item.events)
      }));
    }

    // Fetch news
    const { data: news } = await supabase
      .from('news_topics')
      .select(`
        news!inner (
          id,
          slug,
          title,
          excerpt,
          publish_date,
          hero_image,
          status,
          author_id,
          members!news_author_id_fkey (
            id,
            name,
            image
          )
        )
      `)
      .eq('topic_id', topicId)
      .eq('news.status', 'published');

    if (news) {
      content.news = news.map((item: any) => ({
        id: item.news.id,
        title: item.news.title,
        excerpt: item.news.excerpt,
        date: item.news.publish_date,
        image: item.news.hero_image,
        author: {
          id: item.news.members?.id || '',
          name: item.news.members?.name || 'Unknown',
          image: item.news.members?.image
        },
        type: 'news',
        url: getNewsArticleUrl(item.news)
      }));
    }

    // Fetch resources
    const { data: resources } = await supabase
      .from('resource_topics')
      .select(`
        resources!inner (
          id,
          title,
          description,
          url,
          type,
          status,
          contributor_id,
          members!resources_contributor_id_fkey (
            id,
            name,
            image
          )
        )
      `)
      .eq('topic_id', topicId)
      .eq('resources.status', 'published');

    if (resources) {
      content.resources = resources.map((item: any) => ({
        id: item.resources.id,
        title: item.resources.title,
        excerpt: item.resources.description,
        author: {
          id: item.resources.members?.id || '',
          name: item.resources.members?.name || 'Unknown',
          image: item.resources.members?.image
        },
        type: 'resource',
        url: getResourceUrl(item.resources)
      }));
    }

    // Fetch groups
    const { data: groups } = await supabase
      .from('group_topics')
      .select(`
        groups!inner (
          id,
          name,
          description,
          hero_image,
          status,
          visibility
        )
      `)
      .eq('topic_id', topicId)
      .eq('groups.status', 'published')
      .in('groups.visibility', ['open', 'public']);

    if (groups) {
      content.groups = groups.map((item: any) => ({
        id: item.groups.id,
        title: item.groups.name,
        excerpt: item.groups.description,
        image: item.groups.hero_image,
        type: 'group',
        url: getGroupUrl(item.groups)
      }));
    }

    // Fetch marketplace listings
    const { data: marketplace } = await supabase
      .from('marketplace_topics')
      .select(`
        marketplace_listings!inner (
          id,
          title,
          description,
          price,
          status,
          seller_id,
          members!marketplace_listings_seller_id_fkey (
            id,
            name,
            image
          )
        )
      `)
      .eq('topic_id', topicId)
      .eq('marketplace_listings.status', 'published');

    if (marketplace) {
      content.marketplace = marketplace.map((item: any) => ({
        id: item.marketplace_listings.id,
        title: item.marketplace_listings.title,
        excerpt: item.marketplace_listings.description,
        author: {
          id: item.marketplace_listings.members?.id || '',
          name: item.marketplace_listings.members?.name || 'Unknown',
          image: item.marketplace_listings.members?.image
        },
        type: 'marketplace',
        url: getMarketplaceListingUrl(item.marketplace_listings)
      }));
    }

    // Fetch opportunities
    const { data: opportunities } = await supabase
      .from('opportunity_topics')
      .select(`
        opportunities!inner (
          id,
          title,
          description,
          status,
          posted_by,
          members!opportunities_posted_by_fkey (
            id,
            name,
            image
          )
        )
      `)
      .eq('topic_id', topicId)
      .eq('opportunities.status', 'published');

    if (opportunities) {
      content.opportunities = opportunities.map((item: any) => ({
        id: item.opportunities.id,
        title: item.opportunities.title,
        excerpt: item.opportunities.description,
        author: {
          id: item.opportunities.members?.id || '',
          name: item.opportunities.members?.name || 'Unknown',
          image: item.opportunities.members?.image
        },
        type: 'opportunity',
        url: getOpportunityUrl(item.opportunities)
      }));
    }

    // Fetch companies
    const { data: companies } = await supabase
      .from('company_topics')
      .select(`
        companies!inner (
          id,
          name,
          description,
          logo,
          status
        )
      `)
      .eq('topic_id', topicId)
      .eq('companies.status', 'published');

    if (companies) {
      content.companies = companies.map((item: any) => ({
        id: item.companies.id,
        title: item.companies.name,
        excerpt: item.companies.description,
        image: item.companies.logo,
        type: 'company',
        url: getCompanyUrl(item.companies)
      }));
    }

    // Fetch galleries
    const { data: galleries } = await supabase
      .from('gallery_topics')
      .select(`
        user_galleries!inner (
          id,
          slug,
          title,
          description,
          privacy_level,
          user_id,
          members!user_galleries_user_id_fkey (
            id,
            name,
            image
          )
        )
      `)
      .eq('topic_id', topicId)
      .eq('user_galleries.privacy_level', 'public');

    if (galleries) {
      content.galleries = galleries.map((item: any) => ({
        id: item.user_galleries.id,
        title: item.user_galleries.title,
        excerpt: item.user_galleries.description,
        image: undefined,
        author: {
          id: item.user_galleries.members?.id || '',
          name: item.user_galleries.members?.name || 'Unknown',
          image: item.user_galleries.members?.image
        },
        type: 'gallery',
        url: getGalleryUrl(item.user_galleries)
      }));
    }

    return content;
  } catch (error) {
    console.error('Error fetching topic content:', error);
    return {};
  }
}

export function useTopicContent(topicSlug: string) {
  return useQuery({
    queryKey: topicContentQueryKeys.byTopic(topicSlug),
    queryFn: () => fetchTopicContent(topicSlug),
    enabled: !!topicSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}