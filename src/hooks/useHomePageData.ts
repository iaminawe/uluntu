import { useQuery } from '@tanstack/react-query';

interface HomePageStats {
  members: number;
  companies: number;
  events: number;
  groups: number;
}

interface HomePageHighlights {
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
  featuredGroups: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
  latestNews: Array<{
    id: string;
    title: string;
    excerpt: string;
    date: string;
  }>;
}

/**
 * Optimized hook for home page that returns data immediately
 * No API calls - just static data for instant rendering
 */
export function useHomePageData() {
  // Return static data immediately - no queries
  return {
    stats: {
      members: 150,
      companies: 25,
      events: 20,
      groups: 15
    },
    highlights: {
      upcomingEvents: [],
      featuredGroups: [],
      latestNews: []
    },
    isLoading: false,
    isLoadingHighlights: false,
    error: null,
  };
}