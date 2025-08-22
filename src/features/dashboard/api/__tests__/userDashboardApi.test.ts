/**
 * User Dashboard API Tests
 * Tests for user content retrieval, analytics, and activity endpoints
 */

import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { userDashboardApi } from '../userDashboardApi';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    storage: {
      from: jest.fn()
    }
  }
}));

// Mock fetch for external analytics APIs
global.fetch = jest.fn();

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User'
};

const mockPosts = [
  {
    id: 'post-1',
    title: 'My First Post',
    content: 'This is my first post content',
    status: 'published',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user_id: 'user-123',
    views: 42,
    likes: 8
  },
  {
    id: 'post-2',
    title: 'Draft Post',
    content: 'This is a draft post',
    status: 'draft',
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
    user_id: 'user-123',
    views: 0,
    likes: 0
  }
];

const mockPhotos = [
  {
    id: 'photo-1',
    title: 'Beautiful Sunset',
    url: '/storage/photos/sunset.jpg',
    thumbnail: '/storage/photos/sunset-thumb.jpg',
    created_at: '2024-01-14T18:00:00Z',
    user_id: 'user-123',
    views: 156,
    likes: 24
  }
];

const mockEvents = [
  {
    id: 'event-1',
    title: 'Tech Meetup',
    description: 'Monthly tech meetup',
    date: '2024-02-15T19:00:00Z',
    created_at: '2024-01-10T12:00:00Z',
    user_id: 'user-123',
    attendees_count: 15
  }
];

const mockActivity = [
  {
    id: 'activity-1',
    type: 'like',
    actor_id: 'user-456',
    actor_name: 'John Doe',
    target_type: 'post',
    target_id: 'post-1',
    target_title: 'My First Post',
    created_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 'activity-2',
    type: 'comment',
    actor_id: 'user-789',
    actor_name: 'Jane Smith',
    target_type: 'photo',
    target_id: 'photo-1',
    target_title: 'Beautiful Sunset',
    content: 'Amazing photo!',
    created_at: '2024-01-16T13:15:00Z'
  }
];

const mockAnalytics = {
  overview: {
    total_views: 198,
    total_likes: 32,
    total_comments: 3,
    total_followers: 45,
    growth_rate: 12.5
  },
  chart_data: {
    views: [20, 35, 42, 38, 50, 28, 33],
    engagement: [5, 8, 12, 9, 15, 7, 10],
    labels: ['2024-01-10', '2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16']
  }
};

describe('User Dashboard API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default Supabase mocks
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserContent', () => {
    test('fetches user content successfully', async () => {
      // Mock posts query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPosts,
          error: null
        })
      } as any));

      // Mock photos query  
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPhotos,
          error: null
        })
      } as any));

      // Mock events query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockEvents,
          error: null
        })
      } as any));

      const result = await userDashboardApi.getUserContent('user-123');

      expect(result).toEqual({
        posts: mockPosts,
        photos: mockPhotos,
        events: mockEvents
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('posts');
      expect(mockSupabase.from).toHaveBeenCalledWith('photos');
      expect(mockSupabase.from).toHaveBeenCalledWith('events');
    });

    test('handles database errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: errorMessage }
        })
      } as any));

      await expect(userDashboardApi.getUserContent('user-123'))
        .rejects.toThrow('Failed to fetch user content');
    });

    test('filters content by status', async () => {
      const publishedPosts = mockPosts.filter(post => post.status === 'published');
      
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: publishedPosts,
          error: null
        })
      } as any));

      const result = await userDashboardApi.getUserContent('user-123', { status: 'published' });

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].status).toBe('published');
    });

    test('sorts content by different criteria', async () => {
      const sortedByViews = [...mockPosts].sort((a, b) => b.views - a.views);
      
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: sortedByViews,
          error: null
        })
      } as any));

      const result = await userDashboardApi.getUserContent('user-123', { sortBy: 'views' });

      expect(result.posts[0].views).toBeGreaterThan(result.posts[1].views);
    });

    test('limits results with pagination', async () => {
      const limitedPosts = mockPosts.slice(0, 1);
      
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: limitedPosts,
          error: null
        })
      } as any));

      const result = await userDashboardApi.getUserContent('user-123', { limit: 1 });

      expect(result.posts).toHaveLength(1);
    });
  });

  describe('getUserAnalytics', () => {
    test('fetches analytics data successfully', async () => {
      // Mock RPC call for analytics
      mockSupabase.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null
      });

      const result = await userDashboardApi.getUserAnalytics('user-123', '7d');

      expect(result).toEqual({
        overview: mockAnalytics.overview,
        chartData: {
          labels: ['Jan 10', 'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14', 'Jan 15', 'Jan 16'],
          views: mockAnalytics.chart_data.views,
          engagement: mockAnalytics.chart_data.engagement
        },
        topContent: expect.any(Array)
      });
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_analytics', {
        p_user_id: 'user-123',
        p_time_range: '7d'
      });
    });

    test('handles different time ranges', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null
      });

      await userDashboardApi.getUserAnalytics('user-123', '30d');
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_analytics', {
        p_user_id: 'user-123',
        p_time_range: '30d'
      });
    });

    test('handles analytics RPC errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC function failed' }
      });

      await expect(userDashboardApi.getUserAnalytics('user-123', '7d'))
        .rejects.toThrow('Failed to fetch user analytics');
    });

    test('formats chart labels correctly', async () => {
      const analyticsWithDates = {
        ...mockAnalytics,
        chart_data: {
          ...mockAnalytics.chart_data,
          labels: ['2024-01-01', '2024-01-02', '2024-01-03']
        }
      };
      
      mockSupabase.rpc.mockResolvedValue({
        data: analyticsWithDates,
        error: null
      });

      const result = await userDashboardApi.getUserAnalytics('user-123', '7d');

      expect(result.chartData.labels).toEqual(['Jan 1', 'Jan 2', 'Jan 3']);
    });
  });

  describe('getUserActivity', () => {
    test('fetches user activity successfully', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockActivity,
          error: null
        })
      } as any));

      // Mock notifications query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'notif-1',
              type: 'milestone',
              message: 'Your post reached 100 views!',
              read: false,
              created_at: '2024-01-16T12:00:00Z'
            }
          ],
          error: null
        })
      } as any));

      const result = await userDashboardApi.getUserActivity('user-123');

      expect(result.recent).toHaveLength(2);
      expect(result.notifications).toHaveLength(1);
      expect(result.recent[0]).toMatchObject({
        type: 'like',
        user: 'John Doe',
        target: 'My First Post'
      });
    });

    test('filters activity by type', async () => {
      const likeActivity = mockActivity.filter(a => a.type === 'like');
      
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: likeActivity,
          error: null
        })
      } as any));

      const result = await userDashboardApi.getUserActivity('user-123', { type: 'like' });

      expect(result.recent).toHaveLength(1);
      expect(result.recent[0].type).toBe('like');
    });

    test('handles activity fetch errors', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' }
        })
      } as any));

      await expect(userDashboardApi.getUserActivity('user-123'))
        .rejects.toThrow('Failed to fetch user activity');
    });
  });

  describe('updateUserContent', () => {
    test('updates content successfully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ ...mockPosts[0], title: 'Updated Title' }],
          error: null
        })
      } as any));

      const result = await userDashboardApi.updateUserContent('post-1', {
        title: 'Updated Title'
      });

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Title');
    });

    test('handles update errors', async () => {
      mockSupabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' }
        })
      } as any));

      const result = await userDashboardApi.updateUserContent('post-1', {
        title: 'Updated Title'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });

    test('validates update data', async () => {
      const result = await userDashboardApi.updateUserContent('post-1', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('No update data provided');
    });
  });

  describe('deleteUserContent', () => {
    test('deletes content successfully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      } as any));

      const result = await userDashboardApi.deleteUserContent('post-1');

      expect(result.success).toBe(true);
    });

    test('handles delete errors', async () => {
      mockSupabase.from.mockImplementation(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Delete failed' }
        })
      } as any));

      const result = await userDashboardApi.deleteUserContent('post-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });

    test('requires content ID', async () => {
      const result = await userDashboardApi.deleteUserContent('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content ID is required');
    });
  });

  describe('External Analytics Integration', () => {
    test('integrates with Google Analytics API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reports: [{
            data: {
              rows: [
                { metrics: [{ values: ['150'] }] },
                { metrics: [{ values: ['89'] }] }
              ]
            }
          }]
        })
      } as Response);

      const result = await userDashboardApi.getExternalAnalytics('user-123', 'google');

      expect(result.pageViews).toBe(239); // 150 + 89
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://analyticsreporting.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      );
    });

    test('handles external API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await userDashboardApi.getExternalAnalytics('user-123', 'google');

      expect(result.error).toBe('Failed to fetch external analytics');
      expect(result.pageViews).toBe(0);
    });
  });

  describe('Performance and Caching', () => {
    test('caches analytics data for performance', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null
      });

      // First call
      await userDashboardApi.getUserAnalytics('user-123', '7d');
      
      // Second call (should use cache)
      await userDashboardApi.getUserAnalytics('user-123', '7d');

      // Should only make one actual API call due to caching
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
    });

    test('invalidates cache after content updates', async () => {
      // Setup caching
      mockSupabase.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null
      });
      
      await userDashboardApi.getUserAnalytics('user-123', '7d');
      
      // Update content (should invalidate cache)
      mockSupabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockPosts[0]],
          error: null
        })
      } as any));
      
      await userDashboardApi.updateUserContent('post-1', { title: 'New Title' });
      
      // Next analytics call should hit API again
      await userDashboardApi.getUserAnalytics('user-123', '7d');
      
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Updates', () => {
    test('subscribes to real-time content changes', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn()
      };
      
      mockSupabase.channel = jest.fn().mockReturnValue(mockChannel);
      
      const callback = jest.fn();
      userDashboardApi.subscribeToContentChanges('user-123', callback);
      
      expect(mockSupabase.channel).toHaveBeenCalledWith('user-content:user-123');
      expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', 
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'posts'
        }), 
        expect.any(Function)
      );
    });

    test('handles real-time subscription errors', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation(() => {
          throw new Error('Subscription failed');
        })
      };
      
      mockSupabase.channel = jest.fn().mockReturnValue(mockChannel);
      
      const callback = jest.fn();
      
      expect(() => {
        userDashboardApi.subscribeToContentChanges('user-123', callback);
      }).not.toThrow();
    });
  });
});