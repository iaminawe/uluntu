// Topic types and interfaces

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicWithAnalytics extends Topic {
  totalContentCount: number;
  eventCount: number;
  newsCount: number;
  resourceCount: number;
  marketplaceCount: number;
  opportunityCount: number;
  groupCount: number;
  companyCount: number;
  memberCount: number;
  popularityPercentage: number;
}

export type TopicEntityType = 
  | 'event'
  | 'news'
  | 'resource'
  | 'group'
  | 'marketplace'
  | 'opportunity'
  | 'company'
  | 'member'
  | 'page';

export interface TopicFormData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface TopicFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'popularity' | 'recent';
}

// Database table types
export interface TopicRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TopicAnalyticsRow extends TopicRow {
  total_content_count: number;
  event_count: number;
  news_count: number;
  resource_count: number;
  marketplace_count: number;
  opportunity_count: number;
  group_count: number;
  company_count: number;
  member_count: number;
  popularity_percentage: number;
}

// Junction table types
export interface EventTopic {
  id: string;
  event_id: string;
  topic_id: string;
  created_at: string;
}

export interface NewsTopic {
  id: string;
  news_id: string;
  topic_id: string;
  created_at: string;
}

export interface ResourceTopic {
  id: string;
  resource_id: string;
  topic_id: string;
  created_at: string;
}

export interface GroupTopic {
  id: string;
  group_id: string;
  topic_id: string;
  created_at: string;
}

export interface MarketplaceTopic {
  id: string;
  marketplace_id: string;
  topic_id: string;
  created_at: string;
}

export interface OpportunityTopic {
  id: string;
  opportunity_id: string;
  topic_id: string;
  created_at: string;
}

export interface CompanyTopic {
  id: string;
  company_id: string;
  topic_id: string;
  created_at: string;
}

export interface MemberTopic {
  id: string;
  member_id: string;
  topic_id: string;
  created_at: string;
}