/**
 * Integration API for User Dashboard
 * Provides seamless integration with existing feature APIs and external services
 */

import { supabase, handleSupabaseError } from '@/shared/api';
import { withAuth } from '@/shared/api/middleware';

// Import existing feature APIs
import { photoApi } from '@/features/gallery/api/photoApi';
import { eventsApi } from '@/features/events/api/eventsApi';
import { messagingApi } from '@/features/messaging/api/messagingApi.real';
import { membersApi } from '@/features/directory/api/membersApi';

import {
  PhotoDashboardData,
  EventDashboardData,
  MarketplaceDashboardData,
  DashboardContent,
  ActivityItem,
  ContentRecommendation,
  EngagementMetrics
} from '../types';

class IntegrationApi {
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
   * Get photo gallery data optimized for dashboard
   */
  async getPhotoDashboardData(params?: {
    limit?: number;
    gallery_id?: string;
    include_analytics?: boolean;
  }): Promise<PhotoDashboardData[]> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        const { limit = 10, gallery_id, include_analytics = true } = params || {};

        // Use existing photo API with dashboard-specific filtering
        const photos = await photoApi.getPhotos({
          filters: {
            uploadedBy: memberId,
            ...(gallery_id && { galleryId: gallery_id })
          },
          limit,
          page: 1
        });

        return photos.data.map(photo => ({
          id: photo.id,
          title: photo.title || 'Untitled Photo',
          description: photo.description || '',
          gallery_id: photo.gallery_id,
          gallery_title: photo.gallery?.title || 'Default Gallery',
          status: this.normalizePhotoStatus(photo.status || 'draft'),
          view_count: photo.views || 0,
          download_count: photo.downloads || 0,
          created_at: photo.created_at || new Date().toISOString(),
          thumbnail_url: photo.thumbnail_url,
          url: photo.url || ''
        }));
      } catch (error) {
        console.error('Error fetching photo dashboard data:', error);
        return [];
      }
    });
  }

  /**
   * Get events data optimized for dashboard
   */
  async getEventDashboardData(params?: {
    limit?: number;
    status_filter?: string[];
    include_past?: boolean;
  }): Promise<EventDashboardData[]> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        const { limit = 10, status_filter, include_past = false } = params || {};

        // Get events using existing events API
        const events = await eventsApi.getAll({
          // Add filters for user's events only
        });

        // Filter events organized by current user
        const userEvents = events.filter(event => 
          event.organizer?.id === memberId
        );

        // Apply additional filtering
        let filteredEvents = userEvents;

        if (status_filter && status_filter.length > 0) {
          filteredEvents = filteredEvents.filter(event => 
            status_filter.includes(event.status)
          );
        }

        if (!include_past) {
          const now = new Date();
          filteredEvents = filteredEvents.filter(event => 
            new Date(event.date) >= now
          );
        }

        // Limit results
        filteredEvents = filteredEvents.slice(0, limit);

        return filteredEvents.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          status: this.normalizeEventStatus(event.status),
          attendee_count: event.currentAttendees || 0,
          max_attendees: event.maxAttendees,
          created_at: event.organizer?.joinDate || new Date().toISOString(),
          image: event.image,
          url: `/events/${event.id}`
        }));
      } catch (error) {
        console.error('Error fetching event dashboard data:', error);
        return [];
      }
    });
  }

  /**
   * Get marketplace listings data optimized for dashboard
   */
  async getMarketplaceDashboardData(params?: {
    limit?: number;
    status_filter?: string[];
    category?: string;
  }): Promise<MarketplaceDashboardData[]> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        const { limit = 10, status_filter, category } = params || {};

        // Query marketplace listings directly since we don't have a specific API imported
        let query = supabase
          .from('marketplace_listings')
          .select(`
            id, title, description, price, status, created_at,
            images, category, seller_id, view_count, inquiry_count
          `)
          .eq('seller_id', memberId)
          .order('created_at', { ascending: false });

        if (status_filter && status_filter.length > 0) {
          query = query.in('status', status_filter);
        }

        if (category) {
          query = query.eq('category', category);
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data: listings, error } = await query;

        if (error) {
          throw handleSupabaseError(error);
        }

        return (listings || []).map(listing => ({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          status: this.normalizeMarketplaceStatus(listing.status),
          view_count: listing.view_count || 0,
          inquiry_count: listing.inquiry_count || 0,
          created_at: listing.created_at,
          thumbnail_url: listing.images?.[0],
          url: `/marketplace/${listing.id}`
        }));
      } catch (error) {
        console.error('Error fetching marketplace dashboard data:', error);
        return [];
      }
    });
  }

  /**
   * Get recent messages and conversations
   */
  async getRecentMessages(params?: {
    limit?: number;
    conversation_types?: string[];
  }): Promise<{
    conversations: any[];
    unread_count: number;
    recent_messages: any[];
  }> {
    return withAuth(async () => {
      try {
        const { limit = 5, conversation_types } = params || {};

        // Use existing messaging API
        const [conversations, unreadCount] = await Promise.all([
          messagingApi.getConversations({
            limit,
            ...(conversation_types && { type: conversation_types[0] as any })
          }),
          messagingApi.getUnreadCount()
        ]);

        // Get recent messages from the first few conversations
        let recentMessages: any[] = [];
        if (conversations.length > 0) {
          const messagePromises = conversations.slice(0, 3).map(conv => 
            messagingApi.getMessages(conv.id, { limit: 3 })
          );
          
          const messageResults = await Promise.all(messagePromises);
          recentMessages = messageResults.flat().slice(0, 10);
        }

        return {
          conversations,
          unread_count: unreadCount,
          recent_messages: recentMessages
        };
      } catch (error) {
        console.error('Error fetching recent messages:', error);
        return {
          conversations: [],
          unread_count: 0,
          recent_messages: []
        };
      }
    });
  }

  /**
   * Get user profile completion and suggestions
   */
  async getProfileInsights(): Promise<{
    completion_percentage: number;
    missing_fields: string[];
    suggestions: string[];
    profile_views: number;
  }> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();

        // Get member profile data
        const member = await membersApi.getById(memberId);
        
        if (!member) {
          return {
            completion_percentage: 0,
            missing_fields: ['name', 'title', 'bio', 'location', 'image'],
            suggestions: ['Complete your profile to increase visibility'],
            profile_views: 0
          };
        }

        // Calculate completion
        const requiredFields = ['name', 'title', 'bio', 'location', 'image'];
        const optionalFields = ['social', 'intro'];
        
        const completedRequired = requiredFields.filter(field => {
          const value = member[field as keyof typeof member];
          return value && value.toString().trim().length > 0;
        });

        const completedOptional = optionalFields.filter(field => {
          const value = member[field as keyof typeof member];
          return value && (
            typeof value === 'string' ? value.trim().length > 0 :
            typeof value === 'object' ? Object.keys(value).length > 0 : false
          );
        });

        const completionPercentage = Math.round(
          ((completedRequired.length / requiredFields.length) * 80) +
          ((completedOptional.length / optionalFields.length) * 20)
        );

        const missingFields = requiredFields.filter(field => {
          const value = member[field as keyof typeof member];
          return !value || value.toString().trim().length === 0;
        });

        // Generate suggestions
        const suggestions = [];
        if (missingFields.includes('image')) {
          suggestions.push('Add a profile photo to increase engagement');
        }
        if (missingFields.includes('bio')) {
          suggestions.push('Write a compelling bio to tell your story');
        }
        if (!member.social || Object.keys(member.social).length === 0) {
          suggestions.push('Add social media links to expand your network');
        }
        if (completionPercentage === 100) {
          suggestions.push('Your profile is complete! Keep it updated with fresh content');
        }

        return {
          completion_percentage: completionPercentage,
          missing_fields: missingFields,
          suggestions,
          profile_views: 0 // Would need to be tracked separately
        };
      } catch (error) {
        console.error('Error fetching profile insights:', error);
        return {
          completion_percentage: 0,
          missing_fields: [],
          suggestions: ['Error loading profile insights'],
          profile_views: 0
        };
      }
    });
  }

  /**
   * Get content recommendations based on user activity and interests
   */
  async getContentRecommendations(params?: {
    types?: string[];
    limit?: number;
    min_relevance?: number;
  }): Promise<ContentRecommendation[]> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        const { types = ['event', 'group', 'opportunity', 'marketplace_listing'], limit = 10, min_relevance = 0.3 } = params || {};

        const recommendations: ContentRecommendation[] = [];

        // Get location-based recommendations
        const member = await membersApi.getById(memberId);
        const userLocation = member?.location;

        // Event recommendations
        if (types.includes('event')) {
          const events = await eventsApi.getAll({
            search: userLocation ? userLocation.split(',')[0] : undefined
          });
          
          events.slice(0, 3).forEach(event => {
            recommendations.push({
              id: event.id,
              type: 'event',
              title: event.title,
              description: event.description,
              image_url: event.image,
              url: `/events/${event.id}`,
              reason: userLocation && event.location.includes(userLocation.split(',')[0]) 
                ? 'Event in your area' 
                : 'Popular upcoming event',
              relevance_score: userLocation && event.location.includes(userLocation.split(',')[0]) ? 0.8 : 0.5,
              created_at: event.organizer?.joinDate || new Date().toISOString()
            });
          });
        }

        // Group recommendations (simplified - would need groups API)
        if (types.includes('group')) {
          const { data: groups } = await supabase
            .from('groups')
            .select('id, name, description, image, member_count')
            .eq('status', 'active')
            .order('member_count', { ascending: false })
            .limit(3);

          (groups || []).forEach(group => {
            recommendations.push({
              id: group.id,
              type: 'group',
              title: group.name,
              description: group.description,
              image_url: group.image,
              url: `/groups/${group.id}`,
              reason: 'Popular group in the community',
              relevance_score: 0.6,
              created_at: new Date().toISOString()
            });
          });
        }

        // Marketplace recommendations
        if (types.includes('marketplace_listing')) {
          const { data: listings } = await supabase
            .from('marketplace_listings')
            .select('id, title, description, price, images')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(3);

          (listings || []).forEach(listing => {
            recommendations.push({
              id: listing.id,
              type: 'marketplace_listing',
              title: listing.title,
              description: listing.description,
              image_url: listing.images?.[0],
              url: `/marketplace/${listing.id}`,
              reason: 'Recent marketplace listing',
              relevance_score: 0.4,
              created_at: new Date().toISOString()
            });
          });
        }

        // Filter by minimum relevance and limit
        return recommendations
          .filter(rec => rec.relevance_score >= min_relevance)
          .sort((a, b) => b.relevance_score - a.relevance_score)
          .slice(0, limit);

      } catch (error) {
        console.error('Error fetching content recommendations:', error);
        return [];
      }
    });
  }

  /**
   * Get engagement metrics across all platforms
   */
  async getCrossPlatformEngagement(period: 'week' | 'month' | 'year' = 'month'): Promise<EngagementMetrics> {
    return withAuth(async () => {
      try {
        const memberId = await this.getCurrentMemberId();
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        
        switch (period) {
          case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }

        // Get metrics from different sources
        const [photoMetrics, eventMetrics, marketplaceMetrics, messageMetrics] = await Promise.all([
          this.getPhotoEngagementMetrics(memberId, startDate, endDate),
          this.getEventEngagementMetrics(memberId, startDate, endDate),
          this.getMarketplaceEngagementMetrics(memberId, startDate, endDate),
          this.getMessageEngagementMetrics(memberId, startDate, endDate)
        ]);

        return {
          period,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          profile_views: photoMetrics.profile_views + eventMetrics.profile_views,
          content_views: photoMetrics.content_views + eventMetrics.content_views + marketplaceMetrics.content_views,
          likes_received: photoMetrics.likes_received + eventMetrics.likes_received,
          comments_received: photoMetrics.comments_received + eventMetrics.comments_received,
          messages_sent: messageMetrics.messages_sent,
          messages_received: messageMetrics.messages_received,
          groups_joined: 0, // Would need to track group membership changes
          events_attended: eventMetrics.events_attended,
          marketplace_interactions: marketplaceMetrics.marketplace_interactions,
          growth_metrics: {
            profile_views_growth: 0, // Would need historical comparison
            content_views_growth: 0, // Would need historical comparison
            engagement_growth: 0 // Would need historical comparison
          }
        };

      } catch (error) {
        console.error('Error fetching cross-platform engagement:', error);
        
        // Return default metrics
        const now = new Date();
        const start = new Date();
        if (period === 'week') start.setDate(now.getDate() - 7);
        else if (period === 'month') start.setMonth(now.getMonth() - 1);
        else start.setFullYear(now.getFullYear() - 1);

        return {
          period,
          start_date: start.toISOString(),
          end_date: now.toISOString(),
          profile_views: 0,
          content_views: 0,
          likes_received: 0,
          comments_received: 0,
          messages_sent: 0,
          messages_received: 0,
          groups_joined: 0,
          events_attended: 0,
          marketplace_interactions: 0,
          growth_metrics: {
            profile_views_growth: 0,
            content_views_growth: 0,
            engagement_growth: 0
          }
        };
      }
    });
  }

  /**
   * Sync external data sources
   */
  async syncExternalData(sources: string[]): Promise<{
    success: boolean;
    synced_sources: string[];
    errors: string[];
  }> {
    return withAuth(async () => {
      try {
        const syncedSources: string[] = [];
        const errors: string[] = [];

        for (const source of sources) {
          try {
            switch (source) {
              case 'social_media':
                await this.syncSocialMediaData();
                syncedSources.push(source);
                break;
              case 'calendar':
                await this.syncCalendarData();
                syncedSources.push(source);
                break;
              case 'analytics':
                await this.syncAnalyticsData();
                syncedSources.push(source);
                break;
              default:
                errors.push(`Unsupported sync source: ${source}`);
            }
          } catch (error) {
            errors.push(`Failed to sync ${source}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        return {
          success: errors.length === 0,
          synced_sources: syncedSources,
          errors
        };
      } catch (error) {
        console.error('Error syncing external data:', error);
        return {
          success: false,
          synced_sources: [],
          errors: ['Failed to sync external data']
        };
      }
    });
  }

  // Private helper methods

  private normalizePhotoStatus(status: string): 'draft' | 'published' | 'hidden' {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'visible':
        return 'published';
      case 'hidden':
      case 'archived':
        return 'hidden';
      default:
        return 'draft';
    }
  }

  private normalizeEventStatus(status: string): 'draft' | 'published' | 'cancelled' {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'active':
        return 'published';
      case 'cancelled':
      case 'canceled':
        return 'cancelled';
      default:
        return 'draft';
    }
  }

  private normalizeMarketplaceStatus(status: string): 'draft' | 'published' | 'sold' | 'archived' {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'active':
        return 'published';
      case 'sold':
        return 'sold';
      case 'archived':
      case 'hidden':
        return 'archived';
      default:
        return 'draft';
    }
  }

  private async getPhotoEngagementMetrics(memberId: string, startDate: Date, endDate: Date) {
    // Get photo engagement data
    const { data } = await supabase
      .from('photos')
      .select('views, likes, comments')
      .eq('uploaded_by', memberId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const photos = data || [];
    return {
      profile_views: 0, // Photos don't contribute to profile views directly
      content_views: photos.reduce((sum, photo) => sum + (photo.views || 0), 0),
      likes_received: photos.reduce((sum, photo) => sum + (photo.likes || 0), 0),
      comments_received: photos.reduce((sum, photo) => sum + (photo.comments || 0), 0)
    };
  }

  private async getEventEngagementMetrics(memberId: string, startDate: Date, endDate: Date) {
    // Get event engagement data
    const { data } = await supabase
      .from('events')
      .select('id, title')
      .eq('organizer_id', memberId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const events = data || [];
    return {
      profile_views: events.length * 5, // Estimate: each event brings some profile views
      content_views: 0, // Events don't track views currently
      likes_received: 0, // Events don't track likes currently
      comments_received: 0, // Events don't track comments currently
      events_attended: 0 // Would need to track event attendance
    };
  }

  private async getMarketplaceEngagementMetrics(memberId: string, startDate: Date, endDate: Date) {
    // Get marketplace engagement data
    const { data } = await supabase
      .from('marketplace_listings')
      .select('view_count, inquiry_count')
      .eq('seller_id', memberId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const listings = data || [];
    return {
      content_views: listings.reduce((sum, listing) => sum + (listing.view_count || 0), 0),
      marketplace_interactions: listings.reduce((sum, listing) => sum + (listing.inquiry_count || 0), 0)
    };
  }

  private async getMessageEngagementMetrics(memberId: string, startDate: Date, endDate: Date) {
    // Get messaging engagement data
    try {
      const conversations = await messagingApi.getConversations();
      
      // Estimate message counts based on conversation activity
      return {
        messages_sent: conversations.length * 2, // Estimate
        messages_received: conversations.length * 2 // Estimate
      };
    } catch (error) {
      return {
        messages_sent: 0,
        messages_received: 0
      };
    }
  }

  private async syncSocialMediaData(): Promise<void> {
    // Placeholder for social media sync
    // Would integrate with platforms like Facebook, Instagram, LinkedIn
    console.log('Syncing social media data...');
  }

  private async syncCalendarData(): Promise<void> {
    // Placeholder for calendar sync
    // Would integrate with Google Calendar, Outlook, etc.
    console.log('Syncing calendar data...');
  }

  private async syncAnalyticsData(): Promise<void> {
    // Placeholder for analytics sync
    // Would integrate with Google Analytics, custom tracking, etc.
    console.log('Syncing analytics data...');
  }
}

export const integrationApi = new IntegrationApi();