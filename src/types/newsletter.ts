// Newsletter System Types

export interface NewsletterSubscription {
  id: string;
  email: string;
  member_id?: string;
  status: 'pending' | 'active' | 'unsubscribed' | 'bounced';
  preferences: SubscriptionPreferences;
  subscription_token: string;
  confirmation_token?: string;
  confirmed_at?: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  last_sent_at?: string;
  bounce_count: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPreferences {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  content_types: ContentType[];
  format: 'digest' | 'detailed';
  location_filter: boolean;
  language: string;
}

export type ContentType = 'events' | 'news' | 'opportunities' | 'marketplace' | 'members' | 'companies';

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  template_id: string;
  template_data: Record<string, any>;
  content: CuratedContent;
  custom_message?: string;
  branding: BrandingConfig;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  send_type: 'manual' | 'scheduled' | 'automated';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  delivery_stats: DeliveryStats;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BrandingConfig {
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  header_image?: string;
  footer_text: string;
  social_links: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface DeliveryStats {
  sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
}

export interface CuratedContent {
  events: EventContent[];
  news: NewsContent[];
  opportunities: OpportunityContent[];
  marketplace: MarketplaceContent[];
  members: MemberContent[];
  companies: CompanyContent[];
  custom_sections: CustomSection[];
}

export interface EventContent {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  location: string;
  type: 'in-person' | 'online' | 'hybrid';
  url?: string;
  image?: string;
  registration_url?: string;
  attendee_count?: number;
  max_attendees?: number;
  featured: boolean;
}

export interface NewsContent {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  hero_image?: string;
  author: string;
  published_at: string;
  read_more_url: string;
  tags: string[];
  featured: boolean;
}

export interface OpportunityContent {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  type: 'job' | 'volunteer';
  location?: string;
  remote: boolean;
  description: string;
  requirements: string[];
  application_url: string;
  deadline?: string;
  featured: boolean;
}

export interface MarketplaceContent {
  id: string;
  title: string;
  description: string;
  price?: number;
  condition?: string;
  images: string[];
  seller: string;
  contact_url: string;
  location?: string;
  featured: boolean;
}

export interface MemberContent {
  id: string;
  name: string;
  title?: string;
  bio: string;
  image?: string;
  location?: string;
  skills: string[];
  profile_url: string;
  featured: boolean;
}

export interface CompanyContent {
  id: string;
  name: string;
  description: string;
  industry: string;
  logo?: string;
  website?: string;
  employee_count?: number;
  profile_url: string;
  featured: boolean;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  image?: string;
  link?: string;
  order: number;
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  type: 'mjml' | 'react-email';
  template_content: string;
  default_settings: Record<string, any>;
  preview_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentRule {
  id: string;
  name: string;
  description: string;
  content_type: ContentType;
  selection_criteria: SelectionCriteria;
  max_items: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SelectionCriteria {
  status: string;
  featured_first?: boolean;
  date_filter?: 'recent' | 'upcoming' | 'all';
  max_days_old?: number;
  max_weeks_ahead?: number;
  active_only?: boolean;
  sort_by: string;
  include_images?: boolean;
  include_excerpt?: boolean;
  include_bio?: boolean;
  include_company?: boolean;
  include_registration_info?: boolean;
  new_members?: boolean;
  tags?: string[];
  location?: string;
}

export interface NewsletterAnalytics {
  id: string;
  campaign_id: string;
  subscription_id?: string;
  event_type: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed' | 'complained';
  event_data?: Record<string, any>;
  postmark_message_id?: string;
  occurred_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ContentCache {
  id: string;
  content_type: ContentType;
  date_range_start: string;
  date_range_end: string;
  content: any;
  generated_at: string;
  expires_at: string;
}

// API Request/Response Types

export interface CreateSubscriptionRequest {
  email: string;
  preferences?: Partial<SubscriptionPreferences>;
  member_id?: string;
}

export interface UpdateSubscriptionRequest {
  preferences?: Partial<SubscriptionPreferences>;
  status?: NewsletterSubscription['status'];
}

export interface CreateCampaignRequest {
  title: string;
  subject: string;
  template_id: string;
  custom_message?: string;
  branding?: Partial<BrandingConfig>;
  content?: Partial<CuratedContent>;
  scheduled_at?: string;
}

export interface UpdateCampaignRequest {
  title?: string;
  subject?: string;
  template_id?: string;
  custom_message?: string;
  branding?: Partial<BrandingConfig>;
  content?: Partial<CuratedContent>;
  scheduled_at?: string;
  status?: NewsletterCampaign['status'];
}

export interface SendTestEmailRequest {
  campaign_id: string;
  test_emails: string[];
}

export interface CurationOptions {
  date_range?: DateRange;
  content_types?: ContentType[];
  force_refresh?: boolean;
}

export interface DateRange {
  start: string;
  end: string;
}

// Filter Types

export interface SubscriptionFilters {
  status?: NewsletterSubscription['status'];
  search?: string;
  member_id?: string;
  date_range?: DateRange;
  limit?: number;
  offset?: number;
}

export interface CampaignFilters {
  status?: NewsletterCampaign['status'];
  search?: string;
  created_by?: string;
  date_range?: DateRange;
  template_id?: string;
  limit?: number;
  offset?: number;
}

export interface AnalyticsFilters {
  campaign_id?: string;
  event_type?: NewsletterAnalytics['event_type'];
  date_range?: DateRange;
  limit?: number;
  offset?: number;
}

// Statistics Types

export interface NewsletterStats {
  total_subscribers: number;
  active_subscribers: number;
  pending_subscribers: number;
  total_campaigns: number;
  sent_campaigns: number;
  avg_open_rate: number;
  avg_click_rate: number;
}

export interface CampaignAnalytics {
  campaign_id: string;
  total_sent: number;
  total_delivered: number;
  total_bounced: number;
  total_opened: number;
  total_clicked: number;
  total_unsubscribed: number;
  total_complained: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  top_links: Array<{
    url: string;
    clicks: number;
  }>;
  engagement_timeline: Array<{
    date: string;
    opens: number;
    clicks: number;
  }>;
}

// Email Template Types

export interface EmailPreview {
  html: string;
  text: string;
  subject: string;
  preview_url?: string;
}

export interface TemplateData {
  branding: BrandingConfig;
  content: CuratedContent;
  custom_message?: string;
  unsubscribe_url: string;
  web_view_url: string;
  subscriber: {
    email: string;
    name?: string;
    preferences: SubscriptionPreferences;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Postmark Integration Types

export interface PostmarkWebhook {
  RecordType: string;
  MessageID: string;
  Recipient: string;
  Tag?: string;
  DeliveredAt?: string;
  BouncedAt?: string;
  Details?: string;
  Description?: string;
  Email?: string;
  From?: string;
  Subject?: string;
}

export interface SendResult {
  success: boolean;
  message_id?: string;
  message_ids?: string[];
  error?: string;
  sent_count: number;
  failed_count: number;
  failed_emails: string[];
}

// Resend Integration Types
export interface ResendWebhook {
  type: string;
  data: {
    email_id: string;
    bounce_type?: 'hard' | 'soft';
    created_at: string;
    headers?: Record<string, string>;
    [key: string]: any;
  };
}

// Pagination Types

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type PaginatedSubscriptions = PaginatedResponse<NewsletterSubscription>;
export type PaginatedCampaigns = PaginatedResponse<NewsletterCampaign>;
export type PaginatedAnalytics = PaginatedResponse<NewsletterAnalytics>;