/**
 * Group Posts API
 * Handles group discussions, announcements, and activity feeds
 */

import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type GroupPost = Database['public']['Tables']['group_posts']['Row'];
type GroupActivity = Database['public']['Tables']['group_activities']['Row'];

export interface GroupPostCreate {
  group_id: string;
  title?: string;
  content: string;
  content_html?: string;
  type?: 'post' | 'announcement' | 'discussion' | 'poll' | 'event';
  parent_id?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface GroupPostUpdate {
  title?: string;
  content?: string;
  content_html?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface GroupPostsFilter {
  type?: string;
  status?: string;
  author_id?: string;
  parent_id?: string | null;
  is_pinned?: boolean;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'updated_at' | 'vote_count' | 'reply_count';
  order?: 'asc' | 'desc';
}

export interface GroupActivityFilter {
  action?: string;
  actor_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

/**
 * Group Posts API
 */
export const groupPostsApi = {
  /**
   * Create a new group post
   */
  async createPost(post: GroupPostCreate): Promise<GroupPost | null> {
    
    try {
      // Get current user's member ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!member) throw new Error('Member not found');
      
      // Create the post
      const { data, error } = await supabase
        .from('group_posts')
        .insert({
          group_id: post.group_id,
          author_id: member.id,
          title: post.title,
          content: post.content,
          content_html: post.content_html,
          type: post.type || 'post',
          parent_id: post.parent_id,
          tags: post.tags || [],
          metadata: post.metadata || {},
          status: 'published',
          published_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await this.logActivity(post.group_id, member.id, 'post_created', 'group_posts', data.id);
      
      // Update reply count if this is a reply
      if (post.parent_id) {
        await supabase
          .from('group_posts')
          .update({ reply_count: supabase.raw('reply_count + 1') })
          .eq('id', post.parent_id);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },

  /**
   * Update a group post
   */
  async updatePost(postId: string, updates: GroupPostUpdate): Promise<boolean> {
    
    try {
      const { error } = await supabase
        .from('group_posts')
        .update({
          ...updates,
          edited_at: new Date().toISOString()
        })
        .eq('id', postId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  },

  /**
   * Delete a group post
   */
  async deletePost(postId: string): Promise<boolean> {
    
    try {
      // Soft delete by updating status
      const { error } = await supabase
        .from('group_posts')
        .update({ status: 'deleted' })
        .eq('id', postId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  /**
   * Get group posts with filtering and pagination
   */
  async getGroupPosts(
    groupId: string,
    filter?: GroupPostsFilter
  ): Promise<{ posts: GroupPost[]; total: number }> {
    const page = filter?.page || 1;
    const limit = filter?.limit || 20;
    const offset = (page - 1) * limit;
    
    try {
      let query = supabase
        .from('group_posts')
        .select(`
          *,
          author:members!author_id(id, name, title),
          replies:group_posts!parent_id(id)
        `, { count: 'exact' })
        .eq('group_id', groupId);
      
      // Apply filters
      if (filter?.type) {
        query = query.eq('type', filter.type);
      }
      
      if (filter?.status) {
        query = query.eq('status', filter.status);
      } else {
        query = query.eq('status', 'published');
      }
      
      if (filter?.author_id) {
        query = query.eq('author_id', filter.author_id);
      }
      
      if (filter?.parent_id !== undefined) {
        if (filter.parent_id === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filter.parent_id);
        }
      } else {
        // By default, only show top-level posts
        query = query.is('parent_id', null);
      }
      
      if (filter?.is_pinned !== undefined) {
        query = query.eq('is_pinned', filter.is_pinned);
      }
      
      if (filter?.search) {
        query = query.or(`title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`);
      }
      
      if (filter?.tags && filter.tags.length > 0) {
        query = query.contains('tags', filter.tags);
      }
      
      // Apply sorting
      const sortColumn = filter?.sort || 'created_at';
      const sortOrder = filter?.order || 'desc';
      
      // Pinned posts first, then apply regular sorting
      if (filter?.is_pinned === undefined) {
        query = query.order('is_pinned', { ascending: false });
      }
      
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        posts: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting group posts:', error);
      return { posts: [], total: 0 };
    }
  },

  /**
   * Get a single post with its replies
   */
  async getPost(postId: string): Promise<GroupPost | null> {
    
    try {
      const { data, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          author:members!author_id(id, name, title),
          replies:group_posts!parent_id(
            *,
            author:members!author_id(id, name, title)
          )
        `)
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase
        .from('group_posts')
        .update({ view_count: supabase.raw('view_count + 1') })
        .eq('id', postId);
      
      return data;
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  },

  /**
   * Pin/unpin a post
   */
  async togglePinPost(postId: string, isPinned: boolean): Promise<boolean> {
    
    try {
      const { error } = await supabase
        .from('group_posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error toggling pin:', error);
      return false;
    }
  },

  /**
   * Lock/unlock a post for replies
   */
  async toggleLockPost(postId: string, isLocked: boolean): Promise<boolean> {
    
    try {
      const { error } = await supabase
        .from('group_posts')
        .update({ is_locked: isLocked })
        .eq('id', postId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error toggling lock:', error);
      return false;
    }
  },

  /**
   * Create an announcement (admin only)
   */
  async createAnnouncement(
    groupId: string,
    title: string,
    content: string,
    isPinned: boolean = true
  ): Promise<GroupPost | null> {
    return this.createPost({
      group_id: groupId,
      title,
      content,
      type: 'announcement',
      metadata: { is_pinned: isPinned }
    });
  },

  /**
   * Get group activities/feed
   */
  async getGroupActivities(
    groupId: string,
    filter?: GroupActivityFilter
  ): Promise<{ activities: GroupActivity[]; total: number }> {
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;
    const offset = (page - 1) * limit;
    
    try {
      let query = supabase
        .from('group_activities')
        .select(`
          *,
          actor:members!actor_id(id, name, title)
        `, { count: 'exact' })
        .eq('group_id', groupId);
      
      // Apply filters
      if (filter?.action) {
        query = query.eq('action', filter.action);
      }
      
      if (filter?.actor_id) {
        query = query.eq('actor_id', filter.actor_id);
      }
      
      if (filter?.from_date) {
        query = query.gte('created_at', filter.from_date);
      }
      
      if (filter?.to_date) {
        query = query.lte('created_at', filter.to_date);
      }
      
      // Apply sorting and pagination
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        activities: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting activities:', error);
      return { activities: [], total: 0 };
    }
  },

  /**
   * Log an activity
   */
  async logActivity(
    groupId: string,
    actorId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    
    try {
      const { error } = await supabase
        .from('group_activities')
        .insert({
          group_id: groupId,
          actor_id: actorId,
          action,
          target_type: targetType,
          target_id: targetId,
          metadata: metadata || {}
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  },

  /**
   * Vote on a post
   */
  async votePost(postId: string, voteType: 'up' | 'down'): Promise<boolean> {
    
    try {
      const increment = voteType === 'up' ? 1 : -1;
      
      const { error } = await supabase
        .from('group_posts')
        .update({ vote_count: supabase.raw(`vote_count + ${increment}`) })
        .eq('id', postId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error voting on post:', error);
      return false;
    }
  },

  /**
   * Search posts across all groups
   */
  async searchPosts(
    query: string,
    options?: {
      group_ids?: string[];
      type?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ posts: GroupPost[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;
    
    try {
      let searchQuery = supabase
        .from('group_posts')
        .select(`
          *,
          group:groups!group_id(id, name, slug),
          author:members!author_id(id, name, slug)
        `, { count: 'exact' })
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      
      if (options?.group_ids && options.group_ids.length > 0) {
        searchQuery = searchQuery.in('group_id', options.group_ids);
      }
      
      if (options?.type) {
        searchQuery = searchQuery.eq('type', options.type);
      }
      
      searchQuery = searchQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      const { data, error, count } = await searchQuery;
      
      if (error) throw error;
      
      return {
        posts: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      return { posts: [], total: 0 };
    }
  }
};

export default groupPostsApi;