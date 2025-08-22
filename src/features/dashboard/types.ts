// Dashboard and user content types
import React from 'react';
import type { BaseEntity, ContentStatus, DateRange } from '@/types/common';
import type { Topic } from '@/features/topics/types';

// ========================================
// CORE DASHBOARD INTERFACES
// ========================================

export interface DashboardUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  member_profile?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    bio?: string;
  };
}

export interface DashboardStats {
  totalContent: number;
  totalViews: number;
  totalEngagement: number;
  weeklyGrowth: {
    content: number;
    views: number;
    engagement: number;
  };
  contentByType: {
    events: number;
    news: number;
    resources: number;
    groups: number;
    marketplace: number;
    opportunities: number;
    galleries: number;
    messages: number;
  };
}

export interface ContentAnalytics {
  views: number;
  engagements: number;
  shares: number;
  comments: number;
  likes: number;
  viewsHistory: Array<{
    date: string;
    views: number;
  }>;
  engagementRate: number;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
}

// ========================================
// CONTENT AGGREGATION INTERFACES
// ========================================

export interface UserContentSummary {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  slug?: string;
  description?: string;
  cover_image?: string;
  view_count: number;
  engagement_count: number;
  topics?: Topic[];
  privacy_level?: 'public' | 'members_only' | 'private';
  visibility?: 'visible' | 'hidden';
  featured?: boolean;
}

export type ContentType = 
  | 'event' 
  | 'news' 
  | 'resource' 
  | 'group' 
  | 'marketplace' 
  | 'opportunity' 
  | 'gallery' 
  | 'message' 
  | 'activity'
  | 'analytics'
  | 'company'
  | 'page';

export interface ContentFilter {
  type?: ContentType | 'all';
  status?: ContentStatus | 'all';
  privacy?: 'public' | 'members_only' | 'private' | 'all';
  visibility?: 'visible' | 'hidden' | 'all';
  search?: string;
  dateRange?: DateRange;
  topics?: string[];
  featured?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'views' | 'engagement';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ContentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserContentResponse {
  content: UserContentSummary[];
  pagination: ContentPagination;
  stats: {
    totalByType: Record<ContentType, number>;
    totalByStatus: Record<ContentStatus, number>;
  };
}

// ========================================
// ACTIVITY STREAM INTERFACES
// ========================================

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  content_type: ContentType;
  content_id: string;
  content_title: string;
  content_slug?: string;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export type ActivityType =
  | 'content_published'      // New content in followed topics
  | 'content_updated'        // Content updates
  | 'content_featured'       // Content was featured
  | 'user_joined_group'      // New member in groups user is in
  | 'group_event_created'    // New event in user's groups
  | 'comment_added'          // Comment on user's content
  | 'content_liked'          // Someone liked user's content
  | 'mention'                // User was mentioned
  | 'follow'                 // Someone followed user
  | 'collaboration_invite'   // Invitation to collaborate
  | 'system_announcement'    // System-wide announcements
  | 'topic_trending'         // Topic user follows is trending
  | 'milestone_reached';     // User reached a milestone

export interface ActivityFilter {
  type?: ActivityType | 'all';
  priority?: 'low' | 'medium' | 'high' | 'all';
  read?: boolean;
  dateRange?: DateRange;
  limit?: number;
  offset?: number;
}

export interface ActivityResponse {
  activities: ActivityItem[];
  unreadCount: number;
  hasMore: boolean;
}

// ========================================
// DASHBOARD TABS AND NAVIGATION
// ========================================

export interface DashboardTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  count?: number;
  badge?: 'new' | 'updated' | null;
  disabled?: boolean;
}

export interface MyContentTabs {
  overview: DashboardTab;
  events: DashboardTab;
  news: DashboardTab;
  resources: DashboardTab;
  groups: DashboardTab;
  marketplace: DashboardTab;
  opportunities: DashboardTab;
  galleries: DashboardTab;
  messages: DashboardTab;
  drafts: DashboardTab;
}

// ========================================
// QUICK ACTIONS AND SHORTCUTS
// ========================================

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  permissions?: string[];
  featured?: boolean;
  category: 'create' | 'manage' | 'analyze' | 'engage';
}

// ========================================
// TRENDING AND RECOMMENDATIONS
// ========================================

export interface TrendingContent {
  id: string;
  title: string;
  type: ContentType;
  slug: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  view_count: number;
  engagement_count: number;
  trending_score: number;
  created_at: string;
  topics?: Topic[];
}

export interface ContentRecommendation {
  id: string;
  title: string;
  type: ContentType;
  slug: string;
  description: string;
  cover_image?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  relevance_score: number;
  reason: 'similar_interests' | 'trending_in_topic' | 'popular_with_peers' | 'newly_published';
  topics?: Topic[];
}

// ========================================
// NOTIFICATION PREFERENCES
// ========================================

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  activity_types: {
    [K in ActivityType]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
    };
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

// ========================================
// DASHBOARD LAYOUT AND PREFERENCES
// ========================================

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  columns: number;
  is_default: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    row: number;
    column: number;
    span: number;
  };
  configuration: Record<string, any>;
  visible: boolean;
}

export type WidgetType =
  | 'stats_overview'
  | 'recent_content'
  | 'activity_feed'
  | 'quick_actions'
  | 'analytics_chart'
  | 'trending_content'
  | 'recommendations'
  | 'calendar'
  | 'notifications'
  | 'topics_followed';

// ========================================
// API RESPONSE TYPES
// ========================================

export interface DashboardData {
  user: DashboardUser;
  stats: DashboardStats;
  recentContent: UserContentSummary[];
  recentActivity: ActivityItem[];
  trending: TrendingContent[];
  recommendations: ContentRecommendation[];
  notifications: {
    unread: number;
    recent: ActivityItem[];
  };
}

export interface DashboardApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: ContentPagination;
}

// ========================================
// FORM AND INPUT TYPES
// ========================================

export interface DashboardPreferencesForm {
  layout_id: string;
  notifications: NotificationPreferences;
  default_content_privacy: 'public' | 'members_only' | 'private';
  default_content_visibility: 'visible' | 'hidden';
  dashboard_widgets: string[];
  activity_feed_settings: {
    show_own_activity: boolean;
    show_system_announcements: boolean;
    max_items_per_load: number;
  };
}

// ========================================
// TAB COMPONENT INTERFACES
// ========================================

export interface MessagesTabProps {
  contentType: 'message';
  data: {
    statistics: {
      totalConversations: number;
      unreadMessages: number;
      recentActivity: number;
    };
    conversations: MessageItem[];
    announcements: MessageItem[];
    notifications: MessageItem[];
  };
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreateMessage?: () => void;
  onCreateAnnouncement?: () => void;
  onMarkAsRead?: (messageId: string) => void;
  className?: string;
}

export interface MessageItem {
  id: string;
  title: string;
  description: string;
  type: 'conversation' | 'announcement' | 'notification';
  unread: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  metadata?: Record<string, any>;
}

export interface ActivityTabProps {
  contentType: 'activity';
  data: {
    statistics: {
      totalActivities: number;
      todayActivities: number;
      weekActivities: number;
      monthActivities: number;
    };
    activities: ActivityEntry[];
  };
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onViewDetails?: (activity: ActivityEntry) => void;
  className?: string;
}

export interface ActivityEntry {
  id: string;
  type: 'content' | 'interactions' | 'system';
  title: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
  relatedContent?: {
    id: string;
    type: ContentType;
    title: string;
    slug?: string;
  };
  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Update DashboardLayout interface to include new properties
export interface DashboardLayout {
  sidebar: {
    collapsed: boolean;
    pinned: boolean;
  };
  contentView: 'grid' | 'list';
  activeTab: string;
  filters: Record<string, any>;
}

// ========================================
// EXPORT ALL TYPES
// ========================================

export type {
  // Core
  DashboardUser,
  DashboardStats,
  ContentAnalytics,
  
  // Content
  UserContentSummary,
  ContentFilter,
  ContentPagination,
  UserContentResponse,
  
  // Activity
  ActivityItem,
  ActivityFilter,
  ActivityResponse,
  
  // UI
  DashboardTab,
  MyContentTabs,
  QuickAction,
  
  // Recommendations
  TrendingContent,
  ContentRecommendation,
  
  // Preferences
  NotificationPreferences,
  DashboardWidget,
  
  // API
  DashboardData,
  DashboardApiResponse,
  DashboardPreferencesForm,
  
  // Tab Components
  MessagesTabProps,
  MessageItem,
  ActivityTabProps,
  ActivityEntry
};