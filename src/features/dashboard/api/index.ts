/**
 * Dashboard API - Main Export
 * Comprehensive user dashboard API system for managing content, analytics, and user engagement
 */

// Main API Classes
export { dashboardApi } from './dashboardApi';
export { contentManagementApi } from './contentManagementApi';
export { integrationApi } from './integrationApi';
export { dashboardSecurity } from './security';

// Security Middleware
export {
  requirePermissions,
  requireContentOwnership,
  withRateLimit,
  withQuotaCheck,
  type UserRole,
  type UserContext,
  type ContentOwnership
} from './security';

// Type Exports
export type {
  // Core Dashboard Types
  DashboardContent,
  DashboardOverview,
  ContentAnalytics,
  ActivityItem,
  ContentRecommendation,
  EngagementMetrics,
  
  // Filter Types
  ContentFilters,
  ActivityFilters,
  RecommendationFilters,
  
  // Input Types
  BulkContentOperation,
  ContentUpdateInput,
  
  // Response Types
  ContentResponse,
  ActivityResponse,
  RecommendationsResponse,
  AnalyticsResponse,
  OverviewResponse,
  BulkOperationResponse,
  
  // Integration Types
  PhotoDashboardData,
  EventDashboardData,
  MarketplaceDashboardData,
  
  // Permission Types
  ContentPermissions,
  DashboardPermissions,
  DashboardError,
  
  // Utility Types
  DashboardContentType,
  DashboardContentStatus,
  ActivityType,
  RecommendationType,
  BulkOperation
} from '../types';

// Convenience API Instance
class DashboardAPIManager {
  /**
   * Get comprehensive dashboard overview
   */
  async getOverview() {
    return dashboardApi.getDashboardOverview();
  }

  /**
   * Get all user content with filtering
   */
  async getContent(filters?: any, page?: number, limit?: number) {
    return contentManagementApi.getAllUserContent({
      filters,
      page,
      limit,
      includeAnalytics: true
    });
  }

  /**
   * Get user activity feed
   */
  async getActivity(filters?: any, page?: number, limit?: number) {
    return dashboardApi.getUserActivity({ filters, page, limit });
  }

  /**
   * Get content recommendations
   */
  async getRecommendations(types?: string[], limit?: number) {
    return dashboardApi.getRecommendations({ 
      filters: { type: types },
      limit 
    });
  }

  /**
   * Get analytics data
   */
  async getAnalytics(period?: string, contentTypes?: string[]) {
    return contentManagementApi.getContentStatistics({
      period: period as any,
      content_types: contentTypes
    });
  }

  /**
   * Get engagement metrics
   */
  async getEngagement(period?: 'day' | 'week' | 'month' | 'year') {
    return integrationApi.getCrossPlatformEngagement(period);
  }

  /**
   * Perform bulk operations
   */
  async bulkOperation(operation: any) {
    return contentManagementApi.performBulkContentOperation(operation);
  }

  /**
   * Update content item
   */
  async updateContent(contentId: string, contentType: string, updates: any) {
    return contentManagementApi.updateContentItem(contentId, contentType, updates);
  }

  /**
   * Delete content item
   */
  async deleteContent(contentId: string, contentType: string) {
    return contentManagementApi.deleteContentItem(contentId, contentType);
  }

  /**
   * Get integration data
   */
  async getIntegrationData() {
    return {
      photos: await integrationApi.getPhotoDashboardData({ limit: 10 }),
      events: await integrationApi.getEventDashboardData({ limit: 10 }),
      marketplace: await integrationApi.getMarketplaceDashboardData({ limit: 10 }),
      messages: await integrationApi.getRecentMessages({ limit: 5 }),
      profile: await integrationApi.getProfileInsights()
    };
  }

  /**
   * Get permissions for content
   */
  async getPermissions(contentId?: string, contentType?: string) {
    if (contentId && contentType) {
      return dashboardSecurity.getContentPermissions(contentId, contentType);
    }
    return dashboardSecurity.getDashboardPermissions();
  }

  /**
   * Get user context
   */
  async getUserContext() {
    return dashboardSecurity.getUserContext();
  }
}

// Export convenience instance
export const dashboardManager = new DashboardAPIManager();

// API Configuration
export const DASHBOARD_CONFIG = {
  // Default pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Rate limiting
  RATE_LIMITS: {
    OVERVIEW: { limit: 50, window: 3600000 }, // 50 per hour
    CONTENT: { limit: 200, window: 3600000 }, // 200 per hour  
    BULK_OPERATIONS: { limit: 10, window: 3600000 }, // 10 per hour
    ANALYTICS: { limit: 100, window: 3600000 } // 100 per hour
  },
  
  // Content quotas by role
  CONTENT_QUOTAS: {
    user: {
      photo: 100,
      event: 10,
      marketplace_listing: 20,
      opportunity: 5,
      group_post: 50,
      news_article: 5
    },
    moderator: {
      photo: 500,
      event: 50,
      marketplace_listing: 100,
      opportunity: 25,
      group_post: 200,
      news_article: 50
    },
    admin: 'unlimited',
    super_admin: 'unlimited'
  },
  
  // Cache settings
  CACHE_TTL: {
    OVERVIEW: 300, // 5 minutes
    ANALYTICS: 600, // 10 minutes
    RECOMMENDATIONS: 1800, // 30 minutes
    PROFILE_INSIGHTS: 3600 // 1 hour
  }
};

// Utility functions
export const dashboardUtils = {
  /**
   * Format content for display
   */
  formatContentForDisplay(content: any) {
    return {
      ...content,
      created_at_formatted: new Date(content.created_at).toLocaleDateString(),
      status_display: content.status.charAt(0).toUpperCase() + content.status.slice(1),
      engagement_score: (content.like_count || 0) + (content.comment_count || 0) + (content.view_count || 0) * 0.1
    };
  },

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(metrics: any) {
    const totalEngagement = metrics.likes_received + metrics.comments_received;
    const totalViews = metrics.content_views + metrics.profile_views;
    return totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
  },

  /**
   * Generate content insights
   */
  generateContentInsights(analytics: any[]) {
    const insights = [];
    
    // Best performing content type
    const bestType = analytics.reduce((best, current) => 
      current.view_count > (best?.view_count || 0) ? current : best
    );
    
    if (bestType) {
      insights.push(`Your ${bestType.content_type} content performs best with ${bestType.view_count} total views`);
    }

    // Growth trends
    const growingTypes = analytics.filter(a => a.growth_percentage > 0);
    if (growingTypes.length > 0) {
      insights.push(`${growingTypes.length} content types are showing growth this period`);
    }

    // Engagement recommendations
    const lowEngagement = analytics.filter(a => a.like_count + a.comment_count < a.view_count * 0.05);
    if (lowEngagement.length > 0) {
      insights.push(`Consider improving engagement for ${lowEngagement.map(a => a.content_type).join(', ')}`);
    }

    return insights;
  },

  /**
   * Validate bulk operation
   */
  validateBulkOperation(operation: any) {
    const errors = [];
    
    if (!operation.content_ids || !Array.isArray(operation.content_ids)) {
      errors.push('content_ids must be an array');
    }
    
    if (operation.content_ids?.length > 50) {
      errors.push('Maximum 50 items allowed per bulk operation');
    }
    
    const validOperations = ['publish', 'unpublish', 'archive', 'delete', 'feature', 'unfeature'];
    if (!validOperations.includes(operation.operation)) {
      errors.push(`Invalid operation. Must be one of: ${validOperations.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Sanitize filters
   */
  sanitizeFilters(filters: any) {
    const sanitized: any = {};
    
    // String filters
    if (filters.search && typeof filters.search === 'string') {
      sanitized.search = filters.search.trim().substring(0, 100);
    }
    
    // Array filters
    if (filters.type && Array.isArray(filters.type)) {
      sanitized.type = filters.type.slice(0, 10); // Max 10 types
    }
    
    if (filters.status && Array.isArray(filters.status)) {
      sanitized.status = filters.status.slice(0, 5); // Max 5 statuses
    }
    
    // Boolean filters
    if (typeof filters.featured === 'boolean') {
      sanitized.featured = filters.featured;
    }
    
    if (typeof filters.has_engagement === 'boolean') {
      sanitized.has_engagement = filters.has_engagement;
    }
    
    // Numeric filters
    if (typeof filters.min_views === 'number' && filters.min_views >= 0) {
      sanitized.min_views = Math.min(filters.min_views, 1000000);
    }
    
    // Date filters
    if (filters.startDate && typeof filters.startDate === 'string') {
      try {
        new Date(filters.startDate); // Validate date
        sanitized.startDate = filters.startDate;
      } catch (e) {
        // Invalid date, skip
      }
    }
    
    if (filters.endDate && typeof filters.endDate === 'string') {
      try {
        new Date(filters.endDate); // Validate date
        sanitized.endDate = filters.endDate;
      } catch (e) {
        // Invalid date, skip
      }
    }
    
    // Sort filters
    const validSortFields = ['created_at', 'title', 'views', 'likes', 'comments'];
    if (validSortFields.includes(filters.sortBy)) {
      sanitized.sortBy = filters.sortBy;
    }
    
    if (['asc', 'desc'].includes(filters.sortOrder)) {
      sanitized.sortOrder = filters.sortOrder;
    }
    
    return sanitized;
  }
};