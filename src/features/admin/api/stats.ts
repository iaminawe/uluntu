import { supabase } from '@/lib/supabase';

export const adminStatsApi = {
  // Get admin dashboard statistics from live Supabase data
  async getDashboardStats() {
    try {
      // Get counts for all entities in parallel
      const [membersResult, companiesResult, eventsResult, newsResult, groupsResult, resourcesResult, marketplaceResult, opportunitiesResult, recentActivityResult] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }),
        supabase.from('opportunities').select('id', { count: 'exact', head: true }),
        supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      // Check for any errors
      const results = [membersResult, companiesResult, eventsResult, newsResult, groupsResult, resourcesResult, marketplaceResult, opportunitiesResult];
      for (const result of results) {
        if (result.error) {
          console.warn('Database query error:', result.error);
        }
      }

      return {
        totalMembers: membersResult.count || 0,
        totalCompanies: companiesResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalNews: newsResult.count || 0,
        totalGroups: groupsResult.count || 0,
        totalResources: resourcesResult.count || 0,
        totalMarketplaceListings: marketplaceResult.count || 0,
        totalOpportunities: opportunitiesResult.count || 0,
        pendingModeration: 0, // TODO: Implement moderation queue
        recentActivity: recentActivityResult.data || []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data on error
      return {
        totalMembers: 0,
        totalCompanies: 0,
        totalEvents: 0,
        totalNews: 0,
        totalGroups: 0,
        totalResources: 0,
        totalMarketplaceListings: 0,
        totalOpportunities: 0,
        pendingModeration: 0,
        recentActivity: []
      };
    }
  },

  // Get user growth stats from live data
  async getUserGrowthStats(timeRange: string = '30d') {
    try {
      const daysBack = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data, error } = await supabase
        .from('members')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user growth stats:', error);
        return { labels: [], data: [] };
      }

      // Group by day and count
      const dailyCounts: Record<string, number> = {};
      data?.forEach(member => {
        const date = new Date(member.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      const labels = Object.keys(dailyCounts).sort();
      const counts = labels.map(label => dailyCounts[label]);

      return {
        labels,
        data: counts
      };
    } catch (error) {
      console.error('Error in getUserGrowthStats:', error);
      return { labels: [], data: [] };
    }
  },

  // Get content stats from live data
  async getContentStats() {
    try {
      // Count published, draft, and archived content across different tables
      const [newsResult, eventsResult, resourcesResult] = await Promise.all([
        supabase.from('news').select('status', { count: 'exact' }),
        supabase.from('events').select('status', { count: 'exact' }),
        supabase.from('resources').select('status', { count: 'exact' })
      ]);

      // For now, just return total counts (status filtering can be added later)
      const published = (newsResult.count || 0) + (eventsResult.count || 0) + (resourcesResult.count || 0);

      return {
        published,
        draft: 0, // TODO: Implement draft status filtering
        archived: 0 // TODO: Implement archived status filtering
      };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      return { published: 0, draft: 0, archived: 0 };
    }
  },

  // Get user signup analytics with time period filtering
  async getUserSignupAnalytics(
    timeRange: 'week' | 'month' | 'year' | 'custom' = 'month',
    customStartDate?: string,
    customEndDate?: string
  ) {
    try {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();
      let groupBy: string;
      let dateFormat: string;
      
      if (timeRange === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        
        // Determine groupBy based on date range length
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 31) {
          groupBy = 'day';
          dateFormat = 'YYYY-MM-DD';
        } else if (daysDiff <= 365) {
          groupBy = 'week';
          dateFormat = 'YYYY-WW';
        } else {
          groupBy = 'month';
          dateFormat = 'YYYY-MM';
        }
      } else {
        switch (timeRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            endDate = now;
            groupBy = 'day';
            dateFormat = 'YYYY-MM-DD';
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            endDate = now;
            groupBy = 'month';
            dateFormat = 'YYYY-MM';
            break;
          case 'month':
          default:
            startDate.setDate(now.getDate() - 30);
            endDate = now;
            groupBy = 'day';
            dateFormat = 'YYYY-MM-DD';
            break;
        }
      }

      // Get member signup data
      const { data: signups, error } = await supabase
        .from('members')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching signup data:', error);
        return { labels: [], data: [], totalSignups: 0 };
      }

      // Group signups by time period
      const signupCounts: Record<string, number> = {};
      signups?.forEach(signup => {
        const date = new Date(signup.created_at);
        let key: string;
        
        if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        
        signupCounts[key] = (signupCounts[key] || 0) + 1;
      });

      // Fill in missing dates/months with 0
      const labels: string[] = [];
      const data: number[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        let key: string;
        let label: string;
        
        if (groupBy === 'month') {
          key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          // For month view, show month/year format
          label = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (groupBy === 'week') {
          // For week grouping, use week start date
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          key = weekStart.toISOString().split('T')[0];
          label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          key = currentDate.toISOString().split('T')[0];
          // For day view, determine label format based on time range type
          if (timeRange === 'week' || (timeRange === 'custom' && Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) <= 7)) {
            // Week view: show day name and date
            label = currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          } else {
            // Month view: show just day number
            label = currentDate.getDate().toString();
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        labels.push(label);
        data.push(signupCounts[key] || 0);
      }

      return {
        labels,
        data,
        totalSignups: signups?.length || 0,
        timeRange,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dateRangeLabel: this.formatDateRangeLabel(startDate, endDate, timeRange)
      };
    } catch (error) {
      console.error('Error in getUserSignupAnalytics:', error);
      return { 
        labels: [], 
        data: [], 
        totalSignups: 0, 
        timeRange,
        startDate: '',
        endDate: '',
        dateRangeLabel: ''
      };
    }
  },

  // Get page views and engagement metrics
  async getPageViewsAndEngagement(
    timeRange: 'week' | 'month' | 'year' | 'custom' = 'month',
    customStartDate?: string,
    customEndDate?: string
  ) {
    try {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();
      let groupBy: string;
      
      if (timeRange === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        
        // Determine groupBy based on date range length
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 31) {
          groupBy = 'day';
        } else if (daysDiff <= 365) {
          groupBy = 'week';
        } else {
          groupBy = 'month';
        }
      } else {
        switch (timeRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            endDate = now;
            groupBy = 'day';
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            endDate = now;
            groupBy = 'month';
            break;
          case 'month':
          default:
            startDate.setDate(now.getDate() - 30);
            endDate = now;
            groupBy = 'day';
            break;
        }
      }

      // For now, simulate page views based on member activity
      // In a real implementation, you would track actual page views
      const { data: memberActivity, error: activityError } = await supabase
        .from('members')
        .select('updated_at, created_at')
        .or(`updated_at.gte.${startDate.toISOString()},created_at.gte.${startDate.toISOString()}`)
        .lte('updated_at', endDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get content interactions (comments, likes, etc.)
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (activityError || commentsError) {
        console.error('Error fetching engagement data:', activityError || commentsError);
      }

      // Simulate page views (3-5x member activity)
      const pageViewMultiplier = 4;
      const pageViews: Record<string, number> = {};
      const interactions: Record<string, number> = {};
      
      // Process member activity as page views
      memberActivity?.forEach(member => {
        const dates = [member.updated_at, member.created_at].filter(Boolean);
        dates.forEach(dateStr => {
          const date = new Date(dateStr);
          if (date >= startDate) {
            let key: string;
            
            if (groupBy === 'month') {
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
              key = date.toISOString().split('T')[0];
            }
            
            pageViews[key] = (pageViews[key] || 0) + pageViewMultiplier;
          }
        });
      });

      // Process comments as interactions
      comments?.forEach(comment => {
        const date = new Date(comment.created_at);
        let key: string;
        
        if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = date.toISOString().split('T')[0];
        }
        
        interactions[key] = (interactions[key] || 0) + 1;
      });

      // Fill in missing dates with 0 and create labels
      const labels: string[] = [];
      const pageViewData: number[] = [];
      const interactionData: number[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        let key: string;
        let label: string;
        
        if (groupBy === 'month') {
          key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          label = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (groupBy === 'week') {
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          key = weekStart.toISOString().split('T')[0];
          label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          key = currentDate.toISOString().split('T')[0];
          // For day view, determine label format based on time range type
          if (timeRange === 'week' || (timeRange === 'custom' && Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) <= 7)) {
            // Week view: show day name and date
            label = currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          } else {
            // Month view: show just day number
            label = currentDate.getDate().toString();
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        labels.push(label);
        pageViewData.push(pageViews[key] || 0);
        interactionData.push(interactions[key] || 0);
      }

      const totalPageViews = pageViewData.reduce((sum, count) => sum + count, 0);
      const totalInteractions = interactionData.reduce((sum, count) => sum + count, 0);
      const avgDailyPageViews = Math.round(totalPageViews / pageViewData.length);
      
      return {
        labels,
        pageViews: pageViewData,
        interactions: interactionData,
        totalPageViews,
        totalInteractions,
        avgDailyPageViews,
        timeRange,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dateRangeLabel: this.formatDateRangeLabel(startDate, endDate, timeRange)
      };
    } catch (error) {
      console.error('Error in getPageViewsAndEngagement:', error);
      return {
        labels: [],
        pageViews: [],
        interactions: [],
        totalPageViews: 0,
        totalInteractions: 0,
        avgDailyPageViews: 0,
        timeRange,
        startDate: '',
        endDate: '',
        dateRangeLabel: ''
      };
    }
  },

  // Get engagement stats from live data
  async getEngagementStats() {
    try {
      // Get active users from recent member activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsers, error: activeUsersError } = await supabase
        .from('members')
        .select('id')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (activeUsersError) {
        console.error('Error fetching active users:', activeUsersError);
      }

      // Get interaction counts (comments, likes, etc.)
      const { count: commentsCount, error: commentsError } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (commentsError) {
        console.error('Error fetching comments count:', commentsError);
      }

      return {
        activeUsers: activeUsers?.length || 0,
        pageViews: 0, // Will be populated by getPageViewsAndEngagement
        interactions: commentsCount || 0
      };
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
      return { activeUsers: 0, pageViews: 0, interactions: 0 };
    }
  },

  // Helper function to format date range labels
  formatDateRangeLabel(startDate: Date, endDate: Date, timeRange: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (timeRange === 'week') {
      return `Past Week (${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    } else if (timeRange === 'month') {
      return `Past Month (${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    } else if (timeRange === 'year') {
      return `Past Year (${start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })})`;
    } else {
      // Custom range
      if (start.getFullYear() !== end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
      } else {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    }
  }
};