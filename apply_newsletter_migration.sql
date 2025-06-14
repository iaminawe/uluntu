-- Apply Newsletter Migration - Clean Version for Supabase SQL Editor

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  member_id UUID REFERENCES members(id),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{
    "frequency": "weekly",
    "content_types": ["events", "news", "opportunities", "marketplace"],
    "format": "digest",
    "location_filter": true,
    "language": "en"
  }',
  subscription_token VARCHAR UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  confirmation_token VARCHAR UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  confirmed_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  bounce_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Templates Table
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR CHECK (type IN ('mjml', 'react-email')) DEFAULT 'mjml',
  template_content TEXT NOT NULL,
  default_settings JSONB DEFAULT '{}',
  preview_image VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Campaigns Table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  template_id UUID REFERENCES newsletter_templates(id),
  template_data JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  custom_message TEXT,
  branding JSONB DEFAULT '{
    "primary_color": "#3B82F6",
    "secondary_color": "#64748B",
    "logo_url": "",
    "header_image": "",
    "footer_text": "Kootenay Tech Community",
    "social_links": []
  }',
  status VARCHAR CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')) DEFAULT 'draft',
  send_type VARCHAR CHECK (send_type IN ('manual', 'scheduled', 'automated')) DEFAULT 'manual',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,
  delivery_stats JSONB DEFAULT '{
    "sent": 0,
    "delivered": 0,
    "bounced": 0,
    "opened": 0,
    "clicked": 0
  }',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Rules Table
CREATE TABLE IF NOT EXISTS newsletter_content_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  content_type VARCHAR CHECK (content_type IN ('events', 'news', 'opportunities', 'marketplace', 'members', 'companies')),
  selection_criteria JSONB DEFAULT '{}',
  max_items INT DEFAULT 5,
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Analytics Table
CREATE TABLE IF NOT EXISTS newsletter_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES newsletter_subscriptions(id),
  event_type VARCHAR CHECK (event_type IN ('sent', 'delivered', 'bounced', 'opened', 'clicked', 'unsubscribed', 'complained')),
  event_data JSONB DEFAULT '{}',
  postmark_message_id VARCHAR,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Content Cache Table
CREATE TABLE IF NOT EXISTS newsletter_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(content_type, date_range_start, date_range_end)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_campaign_id ON newsletter_analytics(campaign_id);

-- Insert default templates
INSERT INTO newsletter_templates (name, description, type, template_content, is_active) VALUES
  ('Community Digest', 'Weekly digest of community events and news', 'mjml', '<mjml><!-- Template --></mjml>', true),
  ('Event Announcement', 'Single event announcement template', 'mjml', '<mjml><!-- Template --></mjml>', true),
  ('Welcome Email', 'Welcome email for new subscribers', 'mjml', '<mjml><!-- Template --></mjml>', true)
ON CONFLICT DO NOTHING;

-- Insert default content rules
INSERT INTO newsletter_content_rules (name, description, content_type, selection_criteria, max_items, priority) VALUES
  ('Upcoming Events', 'Upcoming events for next 2 weeks', 'events', '{"status": "published"}', 5, 100),
  ('Latest News', 'Recent news from past week', 'news', '{"status": "published"}', 3, 90),
  ('New Opportunities', 'Job and volunteer opportunities', 'opportunities', '{"status": "active"}', 5, 80),
  ('Featured Members', 'New or featured members', 'members', '{"featured_first": true}', 3, 70)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_content_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_content_cache ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Superadmins can manage newsletters" ON newsletter_subscriptions FOR ALL USING (public.is_superadmin(auth.uid()));
CREATE POLICY "Superadmins can manage templates" ON newsletter_templates FOR ALL USING (public.is_superadmin(auth.uid()));
CREATE POLICY "Superadmins can manage campaigns" ON newsletter_campaigns FOR ALL USING (public.is_superadmin(auth.uid()));
CREATE POLICY "Superadmins can manage rules" ON newsletter_content_rules FOR ALL USING (public.is_superadmin(auth.uid()));
CREATE POLICY "Superadmins can view analytics" ON newsletter_analytics FOR SELECT USING (public.is_superadmin(auth.uid()));
CREATE POLICY "System can manage cache" ON newsletter_content_cache FOR ALL USING (auth.uid() IS NOT NULL);