import { supabase } from '@/lib/supabase';

export const adminStatsApi = {
  // Get admin dashboard statistics - temporarily return stub data until DB is set up
  async getDashboardStats() {
    console.warn('Admin stats temporarily disabled - returning stub data');
    
    return {
      totalMembers: 0,
      totalCompanies: 0,
      totalEvents: 0,
      totalNews: 0,
      totalGroups: 0,
      totalResources: 0,
      totalMarketplace: 0,
      totalOpportunities: 0,
      pendingModeration: 0,
      recentActivity: []
    };
  },

  // Get user growth stats - temporarily stub
  async getUserGrowthStats(_timeRange: string = '30d') {
    console.warn('Admin user growth stats temporarily disabled');
    return {
      labels: [],
      data: []
    };
  },

  // Get content stats - temporarily stub
  async getContentStats() {
    console.warn('Admin content stats temporarily disabled');
    return {
      published: 0,
      draft: 0,
      archived: 0
    };
  },

  // Get engagement stats - temporarily stub
  async getEngagementStats() {
    console.warn('Admin engagement stats temporarily disabled');
    return {
      activeUsers: 0,
      pageViews: 0,
      interactions: 0
    };
  }
};