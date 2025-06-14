-- Newsletter System Schema
-- This migration creates all tables needed for the newsletter functionality

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

-- Content Rules Table (for automatic content curation)
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

-- Content Cache Table (for performance)
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

-- Create indexes for performance
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX idx_newsletter_subscriptions_member_id ON newsletter_subscriptions(member_id);
CREATE INDEX idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX idx_newsletter_campaigns_scheduled_at ON newsletter_campaigns(scheduled_at);
CREATE INDEX idx_newsletter_campaigns_created_by ON newsletter_campaigns(created_by);
CREATE INDEX idx_newsletter_analytics_campaign_id ON newsletter_analytics(campaign_id);
CREATE INDEX idx_newsletter_analytics_subscription_id ON newsletter_analytics(subscription_id);
CREATE INDEX idx_newsletter_analytics_event_type ON newsletter_analytics(event_type);
CREATE INDEX idx_newsletter_content_cache_expires_at ON newsletter_content_cache(expires_at);

-- Apply updated_at triggers
CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_newsletter_templates_updated_at
  BEFORE UPDATE ON newsletter_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_newsletter_content_rules_updated_at
  BEFORE UPDATE ON newsletter_content_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default newsletter templates
INSERT INTO newsletter_templates (name, description, type, template_content, is_active) VALUES
  ('Community Digest', 'Weekly digest of community events and news', 'mjml', '<mjml><!-- Template content --></mjml>', true),
  ('Event Announcement', 'Single event announcement template', 'mjml', '<mjml><!-- Template content --></mjml>', true),
  ('Welcome Email', 'Welcome email for new subscribers', 'mjml', '<mjml><!-- Template content --></mjml>', true)
ON CONFLICT DO NOTHING;

-- Insert default content rules
INSERT INTO newsletter_content_rules (name, description, content_type, selection_criteria, max_items, priority) VALUES
  ('Upcoming Events', 'Select upcoming events for the next 2 weeks', 'events', '{"status": "published", "date_filter": "upcoming", "max_weeks_ahead": 2}', 5, 100),
  ('Latest News', 'Recent news articles from the past week', 'news', '{"status": "published", "date_filter": "recent", "max_days_old": 7}', 3, 90),
  ('New Opportunities', 'Job and volunteer opportunities', 'opportunities', '{"status": "active", "date_filter": "recent", "max_days_old": 14}', 5, 80),
  ('Featured Members', 'New or featured community members', 'members', '{"featured_first": true, "new_members": true}', 3, 70)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_content_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_content_cache ENABLE ROW LEVEL SECURITY;

-- Subscription policies
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own subscription" ON newsletter_subscriptions
  FOR SELECT USING (
    email = auth.jwt()->>'email' OR 
    member_id = auth.uid()
  );

CREATE POLICY "Users can update own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (
    email = auth.jwt()->>'email' OR 
    member_id = auth.uid()
  );

CREATE POLICY "Admins can manage all subscriptions" ON newsletter_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Template policies (admins only)
CREATE POLICY "Admins can manage templates" ON newsletter_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Campaign policies
CREATE POLICY "Admins can manage campaigns" ON newsletter_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Content rule policies
CREATE POLICY "Admins can manage content rules" ON newsletter_content_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Analytics policies (admins can read, system can write)
CREATE POLICY "Admins can view analytics" ON newsletter_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Content cache policies (system use only)
CREATE POLICY "System can manage cache" ON newsletter_content_cache
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Functions for newsletter operations

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_newsletter_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM newsletter_content_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update bounce count
CREATE OR REPLACE FUNCTION update_bounce_count(p_email VARCHAR, p_bounce_type VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE newsletter_subscriptions
  SET bounce_count = bounce_count + 1,
      status = CASE 
        WHEN p_bounce_type = 'hard' THEN 'bounced'
        WHEN bounce_count >= 4 THEN 'bounced'
        ELSE status
      END
  WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

-- Function to get subscription stats
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS TABLE (
  total_subscribers BIGINT,
  active_subscribers BIGINT,
  pending_subscribers BIGINT,
  total_campaigns BIGINT,
  sent_campaigns BIGINT,
  avg_open_rate NUMERIC,
  avg_click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE ns.id IS NOT NULL) AS total_subscribers,
    COUNT(*) FILTER (WHERE ns.status = 'active') AS active_subscribers,
    COUNT(*) FILTER (WHERE ns.status = 'pending') AS pending_subscribers,
    COUNT(DISTINCT nc.id) AS total_campaigns,
    COUNT(DISTINCT nc.id) FILTER (WHERE nc.status = 'sent') AS sent_campaigns,
    AVG((nc.delivery_stats->>'opened')::NUMERIC / NULLIF((nc.delivery_stats->>'sent')::NUMERIC, 0) * 100) AS avg_open_rate,
    AVG((nc.delivery_stats->>'clicked')::NUMERIC / NULLIF((nc.delivery_stats->>'opened')::NUMERIC, 0) * 100) AS avg_click_rate
  FROM newsletter_subscriptions ns
  CROSS JOIN newsletter_campaigns nc;
END;
$$ LANGUAGE plpgsql;