import { supabase } from '@/lib/supabase';
import { 
  DashboardOverview, 
  UserContent, 
  ActivityItem, 
  ContentFilters, 
  PaginatedResponse,
  NotificationItem,
  ContentRecommendation,
  BulkOperationRequest,
  BulkOperationResponse,
  AnalyticsData
} from '../types';

class DashboardApi {
  async getOverview(): Promise<DashboardOverview> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          totalContent: 0,
          totalViews: 0,
          totalEngagement: 0,
          recentActivity: [],
          contentSummary: [],
          analytics: {
            engagement: {
              totalViews: 0,
              totalLikes: 0,
              totalComments: 0,
              totalShares: 0
            },
            contentViews: [],
            topContent: []
          }
        };
      }

      // Content summary, recent activity and analytics are independent.
      const [contentSummary, recentActivity, analytics] = await Promise.all([
        this.getContentSummary(user.id),
        this.getRecentActivity(user.id, 10),
        this.getUserAnalytics(user.id),
      ]);

      // Calculate totals
      const totalContent = contentSummary.reduce((sum, item) => sum + item.count, 0);
      const totalViews = analytics.engagement.totalViews;
      const totalEngagement = analytics.engagement.totalLikes + analytics.engagement.totalComments;

      return {
        totalContent,
        totalViews,
        totalEngagement,
        recentActivity,
        contentSummary,
        analytics
      };
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      // Return empty data instead of throwing
      return {
        totalContent: 0,
        totalViews: 0,
        totalEngagement: 0,
        recentActivity: [],
        contentSummary: [],
        analytics: {
          engagement: {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            engagementRate: 0,
            avgTimeOnContent: 0
          },
          growth: {
            contentGrowth: 0,
            viewsGrowth: 0,
            engagementGrowth: 0,
            period: 'month' as const
          },
          contentViews: [],
          topContent: []
        }
      };
    }
  }

  async getUserContent(
    filters: ContentFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<UserContent>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const offset = (page - 1) * limit;
      let allContent: UserContent[] = [];

      // Define content type queries
      const contentQueries = [
        this.getPhotoGalleries(user.id, filters),
        this.getEvents(user.id, filters),
        this.getNews(user.id, filters),
        this.getResources(user.id, filters),
        this.getGroups(user.id, filters),
        this.getMarketplaceItems(user.id, filters),
        this.getOpportunities(user.id, filters),
        this.getMessages(user.id, filters)
      ];

      // Filter queries based on content type filter
      const activeQueries = filters.type?.length 
        ? contentQueries.filter((_, index) => {
            const types = ['gallery', 'event', 'news', 'resource', 'group', 'marketplace', 'opportunity', 'message'];
            return filters.type!.includes(types[index] as any);
          })
        : contentQueries;

      // Execute queries in parallel
      const results = await Promise.all(activeQueries);
      
      // Combine and sort results
      allContent = results.flat().sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // Apply additional filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        allContent = allContent.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.excerpt?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.status?.length) {
        allContent = allContent.filter(item => 
          filters.status!.includes(item.status)
        );
      }

      if (filters.featured !== undefined) {
        allContent = allContent.filter(item => item.featured === filters.featured);
      }

      // Apply sorting
      if (filters.sortBy) {
        allContent.sort((a, b) => {
          let aVal: any, bVal: any;
          
          switch (filters.sortBy) {
            case 'title':
              aVal = a.title.toLowerCase();
              bVal = b.title.toLowerCase();
              break;
            case 'date':
              aVal = new Date(a.updatedAt).getTime();
              bVal = new Date(b.updatedAt).getTime();
              break;
            case 'views':
              aVal = a.views;
              bVal = b.views;
              break;
            case 'likes':
              aVal = a.likes;
              bVal = b.likes;
              break;
            default:
              return 0;
          }

          if (filters.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      // Paginate results
      const total = allContent.length;
      const paginatedContent = allContent.slice(offset, offset + limit);

      return {
        data: paginatedContent,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      console.error('Error fetching user content:', error);
      throw error;
    }
  }

  async getActivityFeed(limit: number = 10): Promise<ActivityItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      return this.getRecentActivity(user.id, limit);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }
  }

  async getContentAnalytics(contentId: string): Promise<AnalyticsData[]> {
    try {
      // This would typically fetch analytics data from your analytics service
      // For now, returning mock data
      const mockData: AnalyticsData[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 100) + 10,
          likes: Math.floor(Math.random() * 20) + 1,
          comments: Math.floor(Math.random() * 10),
          shares: Math.floor(Math.random() * 5)
        });
      }

      return mockData;
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw error;
    }
  }

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mock notifications - replace with actual implementation
      return [
        {
          id: '1',
          type: 'info',
          title: 'New comment on your event',
          message: 'Someone commented on "Community Meetup"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          actionUrl: '/events/community-meetup',
          actionLabel: 'View Comment'
        },
        {
          id: '2',
          type: 'success',
          title: 'Photo gallery published',
          message: 'Your gallery "Summer Events" is now live',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          actionUrl: '/galleries/summer-events'
        }
      ];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getRecommendations(contentTypes: string[], limit: number = 5): Promise<ContentRecommendation[]> {
    try {
      // Mock recommendations - replace with actual implementation
      return [
        {
          id: '1',
          title: 'Create a summer photo gallery',
          type: 'gallery',
          reason: 'Based on your recent event photos',
          score: 0.9,
          url: '/galleries/create',
          thumbnail: '/images/gallery-suggestion.jpg'
        },
        {
          id: '2',
          title: 'Share your expertise as a resource',
          type: 'resource',
          reason: 'You have knowledge in tech leadership',
          score: 0.8,
          url: '/resources/create'
        }
      ] as ContentRecommendation[];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  async bulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Implementation would depend on the operation and content types
      // This is a simplified version
      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const contentId of request.content_ids) {
        try {
          // Perform operation based on request.operation
          // This would need to be implemented for each content type
          processed++;
        } catch (error: any) {
          failed++;
          errors.push(`Failed to process ${contentId}: ${error.message}`);
        }
      }

      return {
        success: failed === 0,
        processed,
        failed,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getContentSummary(userId: string) {
    try {
      const [
        galleriesCount,
        eventsCount,
        newsCount,
        resourcesCount,
        groupsCount,
        marketplaceCount,
        opportunitiesCount,
        messagesCount
      ] = await Promise.all([
        this.getContentCount('photo_galleries', userId),
        this.getContentCount('events', userId),
        this.getContentCount('news', userId),
        this.getContentCount('resources', userId),
        this.getContentCount('groups', userId),
        this.getContentCount('marketplace_listings', userId),
        this.getContentCount('opportunities', userId),
        this.getContentCount('conversations', userId)
      ]);

      return [
        { type: 'gallery' as const, ...galleriesCount },
        { type: 'event' as const, ...eventsCount },
        { type: 'news' as const, ...newsCount },
        { type: 'resource' as const, ...resourcesCount },
        { type: 'group' as const, ...groupsCount },
        { type: 'marketplace' as const, ...marketplaceCount },
        { type: 'opportunity' as const, ...opportunitiesCount },
        { type: 'message' as const, ...messagesCount }
      ];
    } catch (error) {
      console.error('Error getting content summary:', error);
      // Return empty summary if there's an error
      return [
        { type: 'gallery' as const, count: 0, featured: 0, draft: 0, published: 0 },
        { type: 'event' as const, count: 0, featured: 0, draft: 0, published: 0 },
        { type: 'news' as const, count: 0, featured: 0, draft: 0, published: 0 },
        { type: 'resource' as const, count: 0, featured: 0, draft: 0, published: 0 },
        { type: 'group' as const, count: 0, featured: 0, draft: 0, published: 0 },
        { type: 'marketplace' as const, count: 0, featured: 0, draft: 0, published: 0 },
        { type: 'opportunity' as const, count: 0, featured: 0, draft: 0, published: 0 },
        { type: 'message' as const, count: 0, featured: 0, draft: 0, published: 0 }
      ];
    }
  }

  private async getContentCount(table: string, userId: string) {
    try {
      let query = supabase.from(table).select('id', { count: 'exact', head: true });
      
      // Handle different user column names and table names that might not exist
      if (table === 'conversations') {
        // Check if conversations table exists, if not return 0
        query = query.or(`creator_id.eq.${userId},members.cs.["${userId}"]`);
      } else if (table === 'groups') {
        query = query.eq('creator_id', userId);
      } else if (table === 'photo_galleries') {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('user_id', userId);
      }

      const { count, error } = await query;
      
      if (error) {
        console.error(`Error counting ${table}:`, error);
        return { count: 0, featured: 0, draft: 0, published: 0 };
      }

      // Get status counts (simplified)
      return {
        count: count || 0,
        featured: 0, // Would need separate queries
        draft: 0,
        published: count || 0
      };
    } catch (error) {
      console.error(`Error in getContentCount for ${table}:`, error);
      return { count: 0, featured: 0, draft: 0, published: 0 };
    }
  }

  private async getRecentActivity(userId: string, limit: number): Promise<ActivityItem[]> {
    // Mock activity data - replace with actual implementation
    return [
      {
        id: '1',
        type: 'content_created',
        title: 'Created new photo gallery',
        description: 'Summer Events Gallery',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        contentType: 'gallery',
        priority: 'medium'
      },
      {
        id: '2',
        type: 'content_liked',
        title: 'Your event received a like',
        description: 'Community Meetup',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        contentType: 'event',
        priority: 'low'
      }
    ];
  }

  private async getUserAnalytics(userId: string) {
    // Mock analytics - replace with actual implementation
    return {
      contentViews: [],
      engagement: {
        totalViews: 1250,
        totalLikes: 89,
        totalComments: 34,
        totalShares: 12,
        engagementRate: 10.8,
        avgTimeOnContent: 180
      },
      growth: {
        contentGrowth: 15.2,
        viewsGrowth: 8.7,
        engagementGrowth: 12.3,
        period: 'month' as const
      },
      topContent: []
    };
  }

  // Content type specific methods
  private async getPhotoGalleries(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      // Note: photo_galleries table doesn't exist yet
      // Return empty array for now
      return [];
      
      /* Will use this when table exists:
      const { data, error } = await supabase
        .from('photo_galleries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photo galleries:', error);
        return [];
      }

      return (data || []).map(gallery => ({
        id: gallery.id,
        title: gallery.title,
        type: 'gallery' as const,
        status: gallery.published ? 'published' : 'draft',
        createdAt: gallery.created_at,
        updatedAt: gallery.updated_at || gallery.created_at || new Date().toISOString(),
        publishedAt: gallery.published_at,
        views: gallery.view_count || 0,
        likes: 0, // Would need separate likes table
        comments: 0,
        featured: gallery.featured || false,
        url: `/galleries/${gallery.slug}`,
        thumbnail: gallery.cover_image,
        excerpt: gallery.description,
        author: {
          id: userId,
          name: 'User', // Would need to join with profiles
          avatar: undefined
        }
      }));
      */
    } catch (error) {
      console.error('Error in getPhotoGalleries:', error);
      return [];
    }
  }

  private async getEvents(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      // Events table uses organizer_id instead of user_id
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return (data || []).map(event => ({
        id: event.id,
        title: event.title,
        type: 'event' as const,
        status: event.published ? 'published' : 'draft',
        createdAt: event.created_at,
        updatedAt: event.updated_at || event.created_at || new Date().toISOString(),
        publishedAt: event.published_at,
        views: event.view_count || 0,
        likes: 0,
        comments: 0,
        featured: event.featured || false,
        url: `/events/${event.slug}`,
        thumbnail: event.image,
        excerpt: event.description,
        author: {
          id: userId,
          name: 'User',
          avatar: undefined
        }
      }));
    } catch (error) {
      console.error('Error in getEvents:', error);
      return [];
    }
  }

  private async getNews(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      // News table uses author_id instead of user_id
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('author_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching news:', error);
        return [];
      }

      return (data || []).map(news => ({
        id: news.id,
        title: news.title,
        type: 'news' as const,
        status: news.published ? 'published' : 'draft',
        createdAt: news.created_at,
        updatedAt: news.updated_at || news.created_at || new Date().toISOString(),
        publishedAt: news.published_at,
        views: news.view_count || 0,
        likes: 0,
        comments: 0,
        featured: news.featured || false,
        url: `/news/${news.slug}`,
        thumbnail: news.image,
        excerpt: news.excerpt,
        author: {
          id: userId,
          name: 'User',
          avatar: undefined
        }
      }));
    } catch (error) {
      console.error('Error in getNews:', error);
      return [];
    }
  }

  private async getResources(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching resources:', error);
        return [];
      }

      return (data || []).map(resource => ({
        id: resource.id,
        title: resource.title,
        type: 'resource' as const,
        status: resource.published ? 'published' : 'draft',
        createdAt: resource.created_at,
        updatedAt: resource.updated_at || resource.created_at || new Date().toISOString(),
        publishedAt: resource.published_at,
        views: resource.view_count || 0,
        likes: 0,
        comments: 0,
        featured: resource.featured || false,
        url: `/resources/${resource.slug}`,
        thumbnail: resource.image,
        excerpt: resource.description,
        author: {
          id: userId,
          name: 'User',
          avatar: undefined
        }
      }));
    } catch (error) {
      console.error('Error in getResources:', error);
      return [];
    }
  }

  private async getGroups(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      // Groups table uses owner_id instead of creator_id
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching groups:', error);
        return [];
      }

      return (data || []).map(group => ({
        id: group.id,
        title: group.name,
        type: 'group' as const,
        status: 'published', // Groups are typically always published
        createdAt: group.created_at,
        updatedAt: group.created_at || new Date().toISOString(),
        publishedAt: group.created_at,
        views: 0,
        likes: 0,
        comments: 0,
        featured: false,
        url: `/groups/${group.slug}`,
        thumbnail: group.image,
        excerpt: group.description,
        author: {
          id: userId,
          name: 'User',
          avatar: undefined
        }
      }));
    } catch (error) {
      console.error('Error in getGroups:', error);
      return [];
    }
  }

  private async getMarketplaceItems(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching marketplace items:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        type: 'marketplace' as const,
        status: item.active ? 'published' : 'draft',
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
        publishedAt: item.created_at,
        views: item.view_count || 0,
        likes: 0,
        comments: 0,
        featured: false,
        url: `/marketplace/${item.slug}`,
        thumbnail: item.images?.[0],
        excerpt: item.description,
        author: {
          id: userId,
          name: 'User',
          avatar: undefined
        }
      }));
    } catch (error) {
      console.error('Error in getMarketplaceItems:', error);
      return [];
    }
  }

  private async getOpportunities(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching opportunities:', error);
        return [];
      }

      return (data || []).map(opp => ({
        id: opp.id,
        title: opp.title,
        type: 'opportunity' as const,
        status: opp.active ? 'published' : 'draft',
        createdAt: opp.created_at,
        updatedAt: opp.updated_at || opp.created_at || new Date().toISOString(),
        publishedAt: opp.created_at,
        views: opp.view_count || 0,
        likes: 0,
        comments: 0,
        featured: false,
        url: `/opportunities/${opp.slug}`,
        thumbnail: undefined,
        excerpt: opp.description,
        author: {
          id: userId,
          name: 'User',
          avatar: undefined
        }
      }));
    } catch (error) {
      console.error('Error in getOpportunities:', error);
      return [];
    }
  }

  private async getMessages(userId: string, filters: ContentFilters): Promise<UserContent[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`creator_id.eq.${userId},members.cs.["${userId}"]`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return (data || []).map(conv => ({
        id: conv.id,
        title: conv.title || 'Untitled Conversation',
        type: 'message' as const,
        status: 'published',
        createdAt: conv.created_at,
        updatedAt: conv.updated_at || conv.created_at || new Date().toISOString(),
        publishedAt: conv.created_at,
        views: 0,
        likes: 0,
        comments: 0,
        featured: false,
        url: `/messages?conversation=${conv.id}`,
        thumbnail: undefined,
        excerpt: conv.description,
        author: {
          id: userId,
          name: 'User',
          avatar: undefined
        }
      }));
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }
}

export const dashboardApi = new DashboardApi();