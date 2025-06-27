export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  content_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TopicFormData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

export interface TopicAnalytics {
  topic_id: string;
  topic_name: string;
  content_count: number;
  view_count: number;
  engagement_rate: number;
  trending_score: number;
  last_7_days_count: number;
  last_30_days_count: number;
}