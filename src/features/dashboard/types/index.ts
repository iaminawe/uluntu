export interface DashboardOverview {
  totalContent: number;
  totalViews: number;
  totalEngagement: number;
  recentActivity: ActivityItem[];
  contentSummary: ContentTypeSummary[];
  analytics: DashboardAnalytics;
}

export interface ContentTypeSummary {
  type: ContentType;
  count: number;
  lastUpdated?: string;
  featured: number;
  draft: number;
  published: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}

export interface DashboardAnalytics {
  contentViews: AnalyticsData[];
  engagement: EngagementMetrics;
  growth: GrowthMetrics;
  topContent: TopContentItem[];
}

export interface AnalyticsData {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface EngagementMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  avgTimeOnContent: number;
}

export interface GrowthMetrics {
  contentGrowth: number;
  viewsGrowth: number;
  engagementGrowth: number;
  period: 'week' | 'month' | 'quarter';
}

export interface TopContentItem {
  id: string;
  title: string;
  type: ContentType;
  views: number;
  engagement: number;
  url: string;
}

export interface UserContent {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  url: string;
  thumbnail?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ContentFilters {
  type?: ContentType[];
  status?: ContentStatus[];
  featured?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  sortBy?: 'date' | 'views' | 'likes' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export type ContentType = 
  | 'photo' 
  | 'event' 
  | 'news' 
  | 'resource' 
  | 'group' 
  | 'marketplace' 
  | 'opportunity' 
  | 'message'
  | 'gallery';

export type ContentStatus = 
  | 'draft' 
  | 'published' 
  | 'archived' 
  | 'pending' 
  | 'rejected';

export type ActivityType = 
  | 'content_created'
  | 'content_updated' 
  | 'content_published'
  | 'content_liked'
  | 'content_commented'
  | 'content_shared'
  | 'profile_updated'
  | 'achievement_unlocked'
  | 'message_received'
  | 'event_rsvp'
  | 'group_joined';

export interface DashboardTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: ContentType;
  count?: number;
  badge?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: 'content' | 'social' | 'management';
  description?: string;
  badge?: string;
}

export interface AnalyticsWidget {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  format: 'number' | 'percentage' | 'currency' | 'duration';
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface BulkOperationRequest {
  content_ids: string[];
  operation: 'publish' | 'unpublish' | 'archive' | 'delete' | 'feature' | 'unfeature';
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

export interface ContentRecommendation {
  id: string;
  title: string;
  type: ContentType;
  reason: string;
  score: number;
  url: string;
  thumbnail?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// Dashboard Layout Types
export interface DashboardLayout {
  sidebar: {
    collapsed: boolean;
    pinned: boolean;
  };
  contentView: 'grid' | 'list';
  activeTab: string;
  filters: ContentFilters;
}

// User Preferences
export interface UserDashboardPreferences {
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  defaultTab: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
}