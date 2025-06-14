# Newsletter System Architecture Plan

## Overview

This document outlines the comprehensive architecture for implementing a newsletter system for the Kootenay Tech Community platform. The system will automatically curate community content, provide professional email templates, offer admin management capabilities, and integrate seamlessly with existing user profiles and content.

## System Architecture

### Tech Stack Selection

#### Email Template Engine
- **Primary**: React Email for developer experience and TypeScript integration
- **Secondary**: MJML for complex responsive layouts and cross-client compatibility
- **Hybrid Approach**: Use React Email for simple notifications and MJML for rich newsletters

#### Email Delivery Service
- **Service**: Postmark (superior deliverability, community-focused pricing)
- **Integration**: Postmark Node.js SDK with Supabase Edge Functions
- **Analytics**: Built-in tracking for opens, clicks, bounces, and deliverability

#### Database Architecture
- **Storage**: Supabase PostgreSQL with new newsletter-specific tables
- **Integration**: Leverage existing content tables (events, news, opportunities, marketplace)
- **Security**: Row Level Security (RLS) policies for newsletter data

## Database Schema Design

### Core Newsletter Tables

```sql
-- Newsletter subscriptions with preferences
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  member_id UUID REFERENCES members(id), -- Optional link to member account
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{
    "frequency": "weekly",
    "content_types": ["events", "news", "opportunities", "marketplace"],
    "format": "digest",
    "location_filter": true
  }',
  subscription_token VARCHAR UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  confirmation_token VARCHAR UNIQUE, -- For double opt-in
  confirmed_at TIMESTAMP,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  last_sent_at TIMESTAMP,
  bounce_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter campaigns and drafts
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  template_id VARCHAR NOT NULL DEFAULT 'community_digest',
  template_data JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL, -- Curated content for this campaign
  custom_message TEXT, -- Admin custom message
  branding JSONB DEFAULT '{}', -- Community branding settings
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  send_type VARCHAR DEFAULT 'manual' CHECK (send_type IN ('manual', 'scheduled', 'automated')),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  recipient_count INTEGER DEFAULT 0,
  delivery_stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "bounced": 0, "opened": 0, "clicked": 0}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter templates
CREATE TABLE newsletter_templates (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR DEFAULT 'mjml' CHECK (type IN ('mjml', 'react-email')),
  template_content TEXT NOT NULL, -- MJML or React Email template
  default_settings JSONB DEFAULT '{}',
  preview_image VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content curation rules
CREATE TABLE newsletter_content_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  content_type VARCHAR NOT NULL, -- 'events', 'news', 'opportunities', 'marketplace', 'members'
  selection_criteria JSONB NOT NULL, -- Query filters and sorting rules
  max_items INTEGER DEFAULT 5,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign analytics
CREATE TABLE newsletter_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES newsletter_subscriptions(id),
  event_type VARCHAR NOT NULL CHECK (event_type IN ('sent', 'delivered', 'bounced', 'opened', 'clicked', 'unsubscribed', 'complained')),
  event_data JSONB, -- Additional event details
  postmark_message_id VARCHAR, -- Postmark tracking ID
  occurred_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Auto-generated newsletter content cache
CREATE TABLE newsletter_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  content JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 day',
  UNIQUE(content_type, date_range_start, date_range_end)
);
```

### RLS Policies

```sql
-- Subscriptions: Users can manage their own subscriptions, admins can see all
CREATE POLICY "Users can view own subscription" ON newsletter_subscriptions
  FOR SELECT USING (
    auth.uid() = member_id OR 
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

CREATE POLICY "Anyone can create subscription" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (auth.uid() = member_id);

-- Campaigns: Only admins can manage
CREATE POLICY "Admins can manage campaigns" ON newsletter_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

-- Analytics: Only admins can view
CREATE POLICY "Admins can view analytics" ON newsletter_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );
```

## Content Curation System

### Automated Content Aggregation

```typescript
interface ContentCurator {
  // Weekly digest generation
  generateWeeklyDigest(dateRange: DateRange): Promise<NewsletterContent>
  
  // Specific content type curation
  curateRecentEvents(options: EventCurationOptions): Promise<EventContent[]>
  curateLatestNews(options: NewsCurationOptions): Promise<NewsContent[]>
  curateNewOpportunities(options: OpportunityCurationOptions): Promise<OpportunityContent[]>
  curateFeaturedListings(options: MarketplaceCurationOptions): Promise<MarketplaceContent[]>
  curateMemberSpotlight(options: MemberCurationOptions): Promise<MemberContent>
  curateCompanyNews(options: CompanyCurationOptions): Promise<CompanyContent[]>
}

interface CurationRule {
  contentType: string
  selectionCriteria: {
    status: 'published'
    featured?: boolean
    dateRange?: DateRange
    tags?: string[]
    location?: string
    limit: number
    sortBy: 'created_at' | 'featured' | 'popularity'
  }
  priority: number
  maxItems: number
}
```

### Content Aggregation Logic

1. **Recent Events** (Next 2 weeks)
   - Upcoming events with available spots
   - Featured events prioritized
   - Include registration links and quick details

2. **Latest News** (Past 2 weeks)
   - Published articles only
   - Featured articles first
   - Include excerpt and "read more" links

3. **New Opportunities** (Posted in last month)
   - Active job postings and volunteer opportunities
   - Company attribution
   - Application deadline warnings

4. **Marketplace Highlights** (Active listings)
   - Featured products/services
   - Recent additions
   - Local focus (Nelson/BC area)

5. **Member/Company Spotlights**
   - New members/companies (monthly rotation)
   - Achievement highlights
   - Community contributions

## Email Template System

### Template Architecture

```typescript
// Template types
type TemplateEngine = 'mjml' | 'react-email'

interface NewsletterTemplate {
  id: string
  name: string
  engine: TemplateEngine
  components: {
    header: ComponentConfig
    hero: ComponentConfig
    contentSections: ContentSectionConfig[]
    footer: ComponentConfig
  }
  branding: BrandingConfig
  responsive: boolean
}

interface BrandingConfig {
  primaryColor: string
  secondaryColor: string
  logo: string
  headerImage?: string
  footerText: string
  socialLinks: SocialLink[]
}

interface ContentSectionConfig {
  type: 'events' | 'news' | 'opportunities' | 'marketplace' | 'custom'
  title: string
  maxItems: number
  layout: 'list' | 'grid' | 'featured'
  showImages: boolean
  showExcerpts: boolean
}
```

### Default Templates

1. **Community Digest** (Weekly)
   - Hero section with custom message
   - Event highlights (3-5 events)
   - Latest news (2-3 articles)
   - New opportunities (2-3 listings)
   - Member spotlight (1 featured member)

2. **Event Focus** (Event-driven)
   - Single event promotion
   - Related news/resources
   - Speaker/organizer highlights

3. **Monthly Roundup** (Monthly)
   - Month's top content
   - Community stats
   - Upcoming events preview
   - Marketplace featured items

4. **News Alert** (Breaking news)
   - Single news article focus
   - Related events/opportunities
   - Simple, clean layout

## API Design

### Newsletter API Structure

```typescript
// Newsletter subscription API
class NewsletterSubscriptionAPI {
  async subscribe(email: string, preferences?: SubscriptionPreferences): Promise<Subscription>
  async confirmSubscription(token: string): Promise<boolean>
  async unsubscribe(token: string): Promise<boolean>
  async updatePreferences(token: string, preferences: SubscriptionPreferences): Promise<Subscription>
  async getSubscription(email: string): Promise<Subscription | null>
  async getSubscriptionByToken(token: string): Promise<Subscription | null>
  
  // Admin methods
  async getAllSubscriptions(filters?: SubscriptionFilters): Promise<PaginatedSubscriptions>
  async getSubscriptionStats(): Promise<SubscriptionStats>
  async exportSubscriptions(format: 'csv' | 'json'): Promise<string>
}

// Newsletter campaign API
class NewsletterCampaignAPI {
  async createCampaign(campaignData: CreateCampaignData): Promise<Campaign>
  async getCampaigns(filters?: CampaignFilters): Promise<PaginatedCampaigns>
  async getCampaign(id: string): Promise<Campaign>
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>
  async deleteCampaign(id: string): Promise<boolean>
  
  async generateContent(rules: ContentRule[]): Promise<CuratedContent>
  async previewCampaign(id: string): Promise<EmailPreview>
  async sendTestEmail(id: string, testEmails: string[]): Promise<boolean>
  async scheduleCampaign(id: string, scheduledAt: Date): Promise<boolean>
  async sendCampaign(id: string): Promise<SendResult>
  
  async getCampaignAnalytics(id: string): Promise<CampaignAnalytics>
  async getAnalytics(dateRange?: DateRange): Promise<NewsletterAnalytics>
}

// Content curation API
class NewsletterContentAPI {
  async getCuratedContent(type: ContentType, options: CurationOptions): Promise<CuratedContent>
  async getContentRules(): Promise<ContentRule[]>
  async updateContentRule(id: string, rule: Partial<ContentRule>): Promise<ContentRule>
  async testContentRule(rule: ContentRule): Promise<CuratedContent>
}
```

### Integration with Postmark

```typescript
class PostmarkService {
  private client: postmark.ServerClient
  
  async sendNewsletterCampaign(campaign: Campaign, subscribers: Subscription[]): Promise<SendResult>
  async sendTestEmail(template: EmailTemplate, recipients: string[]): Promise<boolean>
  async trackDelivery(messageId: string): Promise<DeliveryStats>
  async processWebhook(webhook: PostmarkWebhook): Promise<void>
  async validateTemplate(template: string): Promise<ValidationResult>
}
```

## Admin Interface Design

### Newsletter Management Dashboard

#### Admin Pages Structure
```
src/pages/admin/newsletter/
├── NewsletterDashboard.tsx      # Overview with stats and recent campaigns
├── SubscriberManagement.tsx     # Subscriber list, import/export, segmentation
├── CampaignManagement.tsx       # Campaign list, creation, scheduling
├── CampaignEditor.tsx           # Campaign composition interface
├── TemplateManagement.tsx       # Template library and editing
├── ContentRules.tsx             # Content curation rule management
├── Analytics.tsx                # Newsletter performance analytics
└── Settings.tsx                 # Newsletter settings and configuration
```

#### Key Admin Features

1. **Campaign Editor**
   - Drag-and-drop content sections
   - Real-time preview
   - Custom message editor with rich text
   - Auto-generated content with manual override
   - A/B testing setup

2. **Subscriber Management**
   - Subscriber list with search/filtering
   - Import/export functionality
   - Segmentation based on preferences
   - Bounce and unsubscribe management

3. **Analytics Dashboard**
   - Campaign performance metrics
   - Subscriber growth trends
   - Engagement analytics
   - Deliverability monitoring

4. **Template Management**
   - Template library
   - Branding customization
   - Template preview and testing
   - Template performance analytics

## User Experience Design

### Frontend Integration

#### Subscription Flow
1. **Newsletter signup form** (existing component enhancement)
2. **Email confirmation** (double opt-in)
3. **Preference center** for subscribers
4. **Unsubscribe page** with feedback option

#### Member Profile Integration
- Newsletter preferences in member profile
- Subscription status indicator
- Quick subscribe/unsubscribe toggle
- Newsletter archive access for members

### Email User Experience

#### Newsletter Features
- **Responsive design** across all email clients
- **One-click unsubscribe** in footer
- **Web view** link for better mobile experience
- **Social sharing** buttons for content
- **Clear CTA buttons** for events and opportunities

#### Personalization
- Member name in greeting (if linked to account)
- Location-based content filtering
- Interest-based content recommendations
- Reading preferences (digest vs detailed)

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Database schema implementation
- Basic subscription API
- Postmark integration setup
- Simple email templates

### Phase 2: Core Features (Weeks 3-4)
- Admin campaign management
- Content curation system
- Template system implementation
- Basic analytics

### Phase 3: Advanced Features (Weeks 5-6)
- Rich template editor
- Advanced analytics
- A/B testing capabilities
- Automated scheduling

### Phase 4: Polish & Launch (Weeks 7-8)
- Performance optimization
- Comprehensive testing
- Documentation
- Community rollout

## Security and Compliance

### Data Protection
- GDPR compliance with explicit consent
- CAN-SPAM compliance with clear unsubscribe
- SOC 2 compliance through Postmark
- Secure token-based unsubscribe links

### Technical Security
- RLS policies for all newsletter data
- Rate limiting on subscription endpoints
- Email validation and sanitization
- Bounce and complaint handling

## Performance Considerations

### Scalability
- Efficient database queries with proper indexing
- Content caching for repeated newsletter generation
- Batch processing for large subscriber lists
- Edge functions for email sending

### Monitoring
- Campaign delivery monitoring
- Database performance tracking
- Email deliverability monitoring
- Error tracking and alerting

This architecture provides a comprehensive, scalable, and user-friendly newsletter system that integrates seamlessly with the existing Kootenay Tech Community platform while providing professional email marketing capabilities.