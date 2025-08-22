/**
 * Content Management API for User Dashboard
 * Specialized endpoints for managing user content across all platforms
 */

import { supabase, handleSupabaseError } from '@/shared/api';
import { withAuth } from '@/shared/api/middleware';
import {
  DashboardContent,
  ContentFilters,
  BulkContentOperation,
  ContentUpdateInput,
  ContentResponse,
  BulkOperationResponse,
  ContentAnalytics,
  ContentPermissions
} from '../types';

// Import existing APIs for integration
import { photoApi } from '@/features/gallery/api/photoApi';
import { eventsApi } from '@/features/events/api/eventsApi';
import { messagingApi } from '@/features/messaging/api/messagingApi.real';

class ContentManagementApi {
  /**
   * Get current user's member ID
   */
  private async getCurrentMemberId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!member) throw new Error('User does not have a member profile');
    return member.id;
  }

  /**
   * Get all user content by type with advanced filtering
   */
  async getAllUserContent(params?: {
    filters?: ContentFilters;
    page?: number;
    limit?: number;
    includeAnalytics?: boolean;
  }): Promise<ContentResponse> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        const { filters = {}, page = 1, limit = 20, includeAnalytics = false } = params || {};

        let allContent: DashboardContent[] = [];

        // Fetch content from different sources based on type filter
        const contentTypes = filters.type || ['photo', 'event', 'marketplace_listing', 'opportunity', 'group_post', 'news_article'];

        if (contentTypes.includes('photo')) {
          const photos = await this.getUserPhotosDetailed(memberId, filters, includeAnalytics);
          allContent.push(...photos);
        }

        if (contentTypes.includes('event')) {
          const events = await this.getUserEventsDetailed(memberId, filters, includeAnalytics);
          allContent.push(...events);
        }

        if (contentTypes.includes('marketplace_listing')) {
          const listings = await this.getUserMarketplaceListingsDetailed(memberId, filters, includeAnalytics);
          allContent.push(...listings);
        }

        if (contentTypes.includes('opportunity')) {
          const opportunities = await this.getUserOpportunitiesDetailed(memberId, filters, includeAnalytics);
          allContent.push(...opportunities);
        }

        if (contentTypes.includes('group_post')) {
          const groupPosts = await this.getUserGroupPostsDetailed(memberId, filters, includeAnalytics);
          allContent.push(...groupPosts);
        }

        if (contentTypes.includes('news_article')) {
          const newsArticles = await this.getUserNewsArticlesDetailed(memberId, filters, includeAnalytics);
          allContent.push(...newsArticles);
        }

        // Apply additional filters
        allContent = this.applyContentFilters(allContent, filters);

        // Apply sorting
        allContent = this.sortContent(allContent, filters);

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedContent = allContent.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allContent.length / limit);

        return {
          data: paginatedContent,
          error: null,
          status: 200,
          pagination: {
            page,
            limit,
            total: allContent.length,
            total_pages: totalPages,
            has_more: page < totalPages
          },
          filters_applied: filters
        };
      } catch (error) {
        console.error('Error fetching all user content:', error);
        throw error;
      }
    });
  }

  /**
   * Get content analytics and statistics
   */
  async getContentStatistics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    content_types?: string[];
    start_date?: string;
    end_date?: string;
  }): Promise<{
    data: ContentAnalytics[];
    summary: {
      total_content: number;
      total_views: number;
      total_engagement: number;
      growth_percentage: number;
    };
  }> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        const { period = 'month', content_types, start_date, end_date } = params || {};

        // Get analytics for each content type
        const analytics: ContentAnalytics[] = [];
        const types = content_types || ['photo', 'event', 'marketplace_listing', 'opportunity', 'group_post', 'news_article'];

        for (const type of types) {
          const stats = await this.getContentTypeStatistics(memberId, type, period, start_date, end_date);
          analytics.push(stats);
        }

        // Calculate summary
        const summary = {
          total_content: analytics.reduce((sum, item) => sum + item.total_count, 0),
          total_views: analytics.reduce((sum, item) => sum + item.view_count, 0),
          total_engagement: analytics.reduce((sum, item) => sum + item.like_count + item.comment_count, 0),
          growth_percentage: analytics.reduce((sum, item) => sum + item.growth_percentage, 0) / analytics.length || 0
        };

        return {
          data: analytics,
          summary
        };
      } catch (error) {
        console.error('Error fetching content statistics:', error);
        throw error;
      }
    });
  }

  /**
   * Perform bulk operations on user content
   */
  async performBulkContentOperation(operation: BulkContentOperation): Promise<BulkOperationResponse> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        
        const results = {
          success_count: 0,
          error_count: 0,
          errors: [] as Array<{ content_id: string; error: string; }>
        };

        // Process each content item
        for (const contentId of operation.content_ids) {
          try {
            // First, determine the content type
            const contentType = await this.getContentType(contentId);
            
            // Verify ownership
            const hasPermission = await this.verifyContentOwnership(contentId, contentType, memberId);
            if (!hasPermission) {
              throw new Error('Permission denied');
            }

            // Perform the operation
            await this.executeContentOperation(contentId, contentType, operation.operation, operation.metadata);
            results.success_count++;
          } catch (error) {
            results.error_count++;
            results.errors.push({
              content_id: contentId,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        return {
          data: results,
          error: null,
          status: 200,
          operation: operation.operation,
          total_processed: operation.content_ids.length
        };
      } catch (error) {
        console.error('Error performing bulk operation:', error);
        throw error;
      }
    });
  }

  /**
   * Update specific content item
   */
  async updateContentItem(
    contentId: string, 
    contentType: string, 
    updates: ContentUpdateInput
  ): Promise<DashboardContent | null> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        
        // Verify ownership
        const hasPermission = await this.verifyContentOwnership(contentId, contentType, memberId);
        if (!hasPermission) {
          throw new Error('Permission denied');
        }

        // Route to appropriate update method
        switch (contentType) {
          case 'photo':
            return await this.updatePhotoContent(contentId, updates, memberId);
          case 'event':
            return await this.updateEventContent(contentId, updates, memberId);
          case 'marketplace_listing':
            return await this.updateMarketplaceContent(contentId, updates, memberId);
          case 'opportunity':
            return await this.updateOpportunityContent(contentId, updates, memberId);
          case 'group_post':
            return await this.updateGroupPostContent(contentId, updates, memberId);
          case 'news_article':
            return await this.updateNewsArticleContent(contentId, updates, memberId);
          default:
            throw new Error(`Unsupported content type: ${contentType}`);
        }
      } catch (error) {
        console.error('Error updating content item:', error);
        throw error;
      }
    });
  }

  /**
   * Delete content item
   */
  async deleteContentItem(contentId: string, contentType: string): Promise<boolean> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        
        // Verify ownership
        const hasPermission = await this.verifyContentOwnership(contentId, contentType, memberId);
        if (!hasPermission) {
          throw new Error('Permission denied');
        }

        // Route to appropriate delete method
        switch (contentType) {
          case 'photo':
            return await photoApi.deletePhoto(contentId);
          case 'event':
            return await eventsApi.delete(contentId);
          case 'marketplace_listing':
            return await this.deleteMarketplaceListing(contentId);
          case 'opportunity':
            return await this.deleteOpportunity(contentId);
          case 'group_post':
            return await this.deleteGroupPost(contentId);
          case 'news_article':
            return await this.deleteNewsArticle(contentId);
          default:
            throw new Error(`Unsupported content type: ${contentType}`);
        }
      } catch (error) {
        console.error('Error deleting content item:', error);
        throw error;
      }
    });
  }

  /**
   * Get content permissions for user
   */
  async getContentPermissions(contentId: string, contentType: string): Promise<ContentPermissions> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        
        const isOwner = await this.verifyContentOwnership(contentId, contentType, memberId);
        
        // Get user role for additional permissions
        const { data: memberData } = await supabase
          .from('members')
          .select('role')
          .eq('id', memberId)
          .single();

        const isAdmin = memberData?.role === 'admin';
        const isModerator = memberData?.role === 'moderator';

        return {
          can_edit: isOwner || isAdmin,
          can_delete: isOwner || isAdmin,
          can_publish: isOwner || isAdmin || isModerator,
          can_feature: isAdmin || isModerator,
          can_view_analytics: isOwner || isAdmin
        };
      } catch (error) {
        console.error('Error fetching content permissions:', error);
        return {
          can_edit: false,
          can_delete: false,
          can_publish: false,
          can_feature: false,
          can_view_analytics: false
        };
      }
    });
  }

  // Private helper methods

  private async getUserPhotosDetailed(
    memberId: string, 
    filters: ContentFilters, 
    includeAnalytics: boolean
  ): Promise<DashboardContent[]> {
    const { data: photos } = await supabase
      .from('photos')
      .select(`
        id, title, description, status, created_at, updated_at,
        views, likes, comments, featured, thumbnail_url, storage_path,
        gallery:galleries!photos_gallery_id_fkey(title, slug)
        ${includeAnalytics ? ', analytics:photo_analytics(*)' : ''}
      `)
      .eq('uploaded_by', memberId)
      .order('created_at', { ascending: false });

    return (photos || []).map((photo: any): DashboardContent => ({
      id: photo.id,
      type: 'photo',
      title: photo.title || 'Untitled Photo',
      description: photo.description,
      status: this.normalizeStatus(photo.status),
      created_at: photo.created_at,
      updated_at: photo.updated_at,
      user_id: memberId,
      view_count: photo.views || 0,
      like_count: photo.likes || 0,
      comment_count: photo.comments || 0,
      featured: photo.featured || false,
      thumbnail_url: photo.thumbnail_url,
      url: `/gallery/${photo.gallery?.slug || 'default'}/${photo.id}`,
      slug: photo.id
    }));
  }

  private async getUserEventsDetailed(
    memberId: string, 
    filters: ContentFilters, 
    includeAnalytics: boolean
  ): Promise<DashboardContent[]> {
    const { data: events } = await supabase
      .from('events')
      .select(`
        id, title, description, status, created_at, updated_at,
        slug, image, featured, organizer_id, date, location
        ${includeAnalytics ? ', analytics:event_analytics(*)' : ''}
      `)
      .eq('organizer_id', memberId)
      .order('created_at', { ascending: false });

    return (events || []).map((event: any): DashboardContent => ({
      id: event.id,
      type: 'event',
      title: event.title,
      description: event.description,
      status: this.normalizeStatus(event.status),
      created_at: event.created_at,
      updated_at: event.updated_at,
      user_id: memberId,
      view_count: 0, // Events don't track views in current schema
      like_count: 0,
      comment_count: 0,
      featured: event.featured || false,
      thumbnail_url: event.image,
      url: `/events/${event.slug || event.id}`,
      slug: event.slug
    }));
  }

  private async getUserMarketplaceListingsDetailed(
    memberId: string, 
    filters: ContentFilters, 
    includeAnalytics: boolean
  ): Promise<DashboardContent[]> {
    const { data: listings } = await supabase
      .from('marketplace_listings')
      .select(`
        id, title, description, status, created_at, updated_at,
        price, featured, seller_id, images, category
        ${includeAnalytics ? ', analytics:marketplace_analytics(*)' : ''}
      `)
      .eq('seller_id', memberId)
      .order('created_at', { ascending: false });

    return (listings || []).map((listing: any): DashboardContent => ({
      id: listing.id,
      type: 'marketplace_listing',
      title: listing.title,
      description: listing.description,
      status: this.normalizeStatus(listing.status),
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: listing.featured || false,
      thumbnail_url: listing.images?.[0],
      url: `/marketplace/${listing.id}`,
      slug: listing.id
    }));
  }

  private async getUserOpportunitiesDetailed(
    memberId: string, 
    filters: ContentFilters, 
    includeAnalytics: boolean
  ): Promise<DashboardContent[]> {
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select(`
        id, title, description, status, created_at, updated_at,
        employer_id, featured, company_id
        ${includeAnalytics ? ', analytics:opportunity_analytics(*)' : ''}
      `)
      .eq('employer_id', memberId)
      .order('created_at', { ascending: false });

    return (opportunities || []).map((opportunity: any): DashboardContent => ({
      id: opportunity.id,
      type: 'opportunity',
      title: opportunity.title,
      description: opportunity.description,
      status: this.normalizeStatus(opportunity.status),
      created_at: opportunity.created_at,
      updated_at: opportunity.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: opportunity.featured || false,
      thumbnail_url: undefined,
      url: `/opportunities/${opportunity.id}`,
      slug: opportunity.id
    }));
  }

  private async getUserGroupPostsDetailed(
    memberId: string, 
    filters: ContentFilters, 
    includeAnalytics: boolean
  ): Promise<DashboardContent[]> {
    const { data: posts } = await supabase
      .from('group_posts')
      .select(`
        id, title, content, status, created_at, updated_at,
        author_id, group_id, featured
        ${includeAnalytics ? ', analytics:group_post_analytics(*)' : ''}
      `)
      .eq('author_id', memberId)
      .order('created_at', { ascending: false });

    return (posts || []).map((post: any): DashboardContent => ({
      id: post.id,
      type: 'group_post',
      title: post.title,
      description: post.content,
      status: this.normalizeStatus(post.status),
      created_at: post.created_at,
      updated_at: post.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: post.featured || false,
      thumbnail_url: undefined,
      url: `/groups/${post.group_id}/posts/${post.id}`,
      slug: post.id
    }));
  }

  private async getUserNewsArticlesDetailed(
    memberId: string, 
    filters: ContentFilters, 
    includeAnalytics: boolean
  ): Promise<DashboardContent[]> {
    const { data: articles } = await supabase
      .from('news')
      .select(`
        id, title, content, status, created_at, updated_at,
        author_id, featured, image, slug
        ${includeAnalytics ? ', analytics:news_analytics(*)' : ''}
      `)
      .eq('author_id', memberId)
      .order('created_at', { ascending: false });

    return (articles || []).map((article: any): DashboardContent => ({
      id: article.id,
      type: 'news_article',
      title: article.title,
      description: article.content?.substring(0, 200) + '...',
      status: this.normalizeStatus(article.status),
      created_at: article.created_at,
      updated_at: article.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: article.featured || false,
      thumbnail_url: article.image,
      url: `/news/${article.slug || article.id}`,
      slug: article.slug
    }));
  }

  private applyContentFilters(content: DashboardContent[], filters: ContentFilters): DashboardContent[] {
    let filteredContent = [...content];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredContent = filteredContent.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filteredContent = filteredContent.filter(item => filters.status!.includes(item.status));
    }

    if (filters.featured !== undefined) {
      filteredContent = filteredContent.filter(item => item.featured === filters.featured);
    }

    if (filters.has_engagement) {
      filteredContent = filteredContent.filter(item => 
        (item.like_count || 0) > 0 || (item.comment_count || 0) > 0
      );
    }

    if (filters.min_views) {
      filteredContent = filteredContent.filter(item => (item.view_count || 0) >= filters.min_views!);
    }

    if (filters.startDate || filters.endDate) {
      filteredContent = filteredContent.filter(item => {
        const itemDate = new Date(item.created_at);
        if (filters.startDate && itemDate < new Date(filters.startDate)) return false;
        if (filters.endDate && itemDate > new Date(filters.endDate)) return false;
        return true;
      });
    }

    return filteredContent;
  }

  private sortContent(content: DashboardContent[], filters: ContentFilters): DashboardContent[] {
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';

    return content.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'views':
          aValue = a.view_count || 0;
          bValue = b.view_count || 0;
          break;
        case 'likes':
          aValue = a.like_count || 0;
          bValue = b.like_count || 0;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
  }

  private normalizeStatus(status: string): 'draft' | 'published' | 'archived' | 'pending' {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'active':
      case 'approved':
        return 'published';
      case 'archived':
      case 'hidden':
      case 'inactive':
        return 'archived';
      case 'pending':
      case 'review':
        return 'pending';
      default:
        return 'draft';
    }
  }

  private async getContentType(contentId: string): Promise<string> {
    // Check each table to determine content type
    const tables = [
      { table: 'photos', type: 'photo' },
      { table: 'events', type: 'event' },
      { table: 'marketplace_listings', type: 'marketplace_listing' },
      { table: 'opportunities', type: 'opportunity' },
      { table: 'group_posts', type: 'group_post' },
      { table: 'news', type: 'news_article' }
    ];

    for (const { table, type } of tables) {
      const { data } = await supabase
        .from(table)
        .select('id')
        .eq('id', contentId)
        .single();
      
      if (data) {
        return type;
      }
    }

    throw new Error(`Content not found: ${contentId}`);
  }

  private async verifyContentOwnership(contentId: string, contentType: string, memberId: string): Promise<boolean> {
    const ownershipFields = {
      photo: 'uploaded_by',
      event: 'organizer_id',
      marketplace_listing: 'seller_id',
      opportunity: 'employer_id',
      group_post: 'author_id',
      news_article: 'author_id'
    };

    const tableNames = {
      photo: 'photos',
      event: 'events',
      marketplace_listing: 'marketplace_listings',
      opportunity: 'opportunities',
      group_post: 'group_posts',
      news_article: 'news'
    };

    const table = tableNames[contentType as keyof typeof tableNames];
    const ownerField = ownershipFields[contentType as keyof typeof ownershipFields];

    if (!table || !ownerField) {
      return false;
    }

    const { data } = await supabase
      .from(table)
      .select(ownerField)
      .eq('id', contentId)
      .single();

    return data?.[ownerField] === memberId;
  }

  private async executeContentOperation(
    contentId: string,
    contentType: string,
    operation: BulkContentOperation['operation'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const tableNames = {
      photo: 'photos',
      event: 'events',
      marketplace_listing: 'marketplace_listings',
      opportunity: 'opportunities',
      group_post: 'group_posts',
      news_article: 'news'
    };

    const table = tableNames[contentType as keyof typeof tableNames];
    if (!table) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    if (operation === 'delete') {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', contentId);
      
      if (error) throw error;
      return;
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    
    switch (operation) {
      case 'publish':
        updateData.status = 'published';
        break;
      case 'unpublish':
        updateData.status = 'draft';
        break;
      case 'archive':
        updateData.status = 'archived';
        break;
      case 'feature':
        updateData.featured = true;
        break;
      case 'unfeature':
        updateData.featured = false;
        break;
    }

    if (metadata) {
      Object.assign(updateData, metadata);
    }

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', contentId);

    if (error) throw error;
  }

  private async getContentTypeStatistics(
    memberId: string,
    contentType: string,
    period: string,
    startDate?: string,
    endDate?: string
  ): Promise<ContentAnalytics> {
    // This would typically use a database function for complex analytics
    // For now, return basic statistics
    
    const tableNames = {
      photo: 'photos',
      event: 'events',
      marketplace_listing: 'marketplace_listings',
      opportunity: 'opportunities',
      group_post: 'group_posts',
      news_article: 'news'
    };

    const ownershipFields = {
      photo: 'uploaded_by',
      event: 'organizer_id',
      marketplace_listing: 'seller_id',
      opportunity: 'employer_id',
      group_post: 'author_id',
      news_article: 'author_id'
    };

    const table = tableNames[contentType as keyof typeof tableNames];
    const ownerField = ownershipFields[contentType as keyof typeof ownershipFields];

    if (!table || !ownerField) {
      return {
        content_type: contentType as any,
        total_count: 0,
        published_count: 0,
        draft_count: 0,
        archived_count: 0,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        growth_percentage: 0
      };
    }

    // Get basic counts
    const { data: allContent } = await supabase
      .from(table)
      .select('status, views, likes, comments')
      .eq(ownerField, memberId);

    const total_count = allContent?.length || 0;
    const published_count = allContent?.filter(item => item.status === 'published').length || 0;
    const draft_count = allContent?.filter(item => item.status === 'draft').length || 0;
    const archived_count = allContent?.filter(item => item.status === 'archived').length || 0;
    const view_count = allContent?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
    const like_count = allContent?.reduce((sum, item) => sum + (item.likes || 0), 0) || 0;
    const comment_count = allContent?.reduce((sum, item) => sum + (item.comments || 0), 0) || 0;

    return {
      content_type: contentType as any,
      total_count,
      published_count,
      draft_count,
      archived_count,
      view_count,
      like_count,
      comment_count,
      growth_percentage: 0 // Would need historical data to calculate
    };
  }

  // Placeholder methods for specific content type updates and deletions
  private async updatePhotoContent(contentId: string, updates: ContentUpdateInput, memberId: string): Promise<DashboardContent | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    const { data, error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', contentId)
      .eq('uploaded_by', memberId)
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      type: 'photo',
      title: data.title || 'Untitled Photo',
      description: data.description,
      status: this.normalizeStatus(data.status),
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: memberId,
      view_count: data.views || 0,
      like_count: data.likes || 0,
      comment_count: data.comments || 0,
      featured: data.featured || false,
      thumbnail_url: data.thumbnail_url,
      url: `/gallery/${data.gallery_id}/${data.id}`,
      slug: data.id
    } : null;
  }

  private async updateEventContent(contentId: string, updates: ContentUpdateInput, memberId: string): Promise<DashboardContent | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', contentId)
      .eq('organizer_id', memberId)
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      type: 'event',
      title: data.title,
      description: data.description,
      status: this.normalizeStatus(data.status),
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: data.featured || false,
      thumbnail_url: data.image,
      url: `/events/${data.slug || data.id}`,
      slug: data.slug
    } : null;
  }

  private async updateMarketplaceContent(contentId: string, updates: ContentUpdateInput, memberId: string): Promise<DashboardContent | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(updateData)
      .eq('id', contentId)
      .eq('seller_id', memberId)
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      type: 'marketplace_listing',
      title: data.title,
      description: data.description,
      status: this.normalizeStatus(data.status),
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: data.featured || false,
      thumbnail_url: data.images?.[0],
      url: `/marketplace/${data.id}`,
      slug: data.id
    } : null;
  }

  private async updateOpportunityContent(contentId: string, updates: ContentUpdateInput, memberId: string): Promise<DashboardContent | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    const { data, error } = await supabase
      .from('opportunities')
      .update(updateData)
      .eq('id', contentId)
      .eq('employer_id', memberId)
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      type: 'opportunity',
      title: data.title,
      description: data.description,
      status: this.normalizeStatus(data.status),
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: data.featured || false,
      thumbnail_url: undefined,
      url: `/opportunities/${data.id}`,
      slug: data.id
    } : null;
  }

  private async updateGroupPostContent(contentId: string, updates: ContentUpdateInput, memberId: string): Promise<DashboardContent | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.content = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    const { data, error } = await supabase
      .from('group_posts')
      .update(updateData)
      .eq('id', contentId)
      .eq('author_id', memberId)
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      type: 'group_post',
      title: data.title,
      description: data.content,
      status: this.normalizeStatus(data.status),
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: data.featured || false,
      thumbnail_url: undefined,
      url: `/groups/${data.group_id}/posts/${data.id}`,
      slug: data.id
    } : null;
  }

  private async updateNewsArticleContent(contentId: string, updates: ContentUpdateInput, memberId: string): Promise<DashboardContent | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.content = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    const { data, error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', contentId)
      .eq('author_id', memberId)
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      type: 'news_article',
      title: data.title,
      description: data.content?.substring(0, 200) + '...',
      status: this.normalizeStatus(data.status),
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: memberId,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      featured: data.featured || false,
      thumbnail_url: data.image,
      url: `/news/${data.slug || data.id}`,
      slug: data.slug
    } : null;
  }

  // Placeholder delete methods
  private async deleteMarketplaceListing(contentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', contentId);
    return !error;
  }

  private async deleteOpportunity(contentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', contentId);
    return !error;
  }

  private async deleteGroupPost(contentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('group_posts')
      .delete()
      .eq('id', contentId);
    return !error;
  }

  private async deleteNewsArticle(contentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', contentId);
    return !error;
  }
}

export const contentManagementApi = new ContentManagementApi();