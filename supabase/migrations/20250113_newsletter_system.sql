-- Newsletter System Migration
-- Comprehensive newsletter functionality including subscriptions, campaigns, templates, and analytics

-- Newsletter subscriptions with preferences and double opt-in
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  member_id UUID REFERENCES members(id), -- Optional link to member account
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{
    "frequency": "weekly",
    "content_types": ["events", "news", "opportunities", "marketplace"],
    "format": "digest",
    "location_filter": true,
    "language": "en"
  }',
  subscription_token VARCHAR UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  confirmation_token VARCHAR UNIQUE, -- For double opt-in
  confirmed_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  bounce_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter campaigns and drafts
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  template_id VARCHAR NOT NULL DEFAULT 'community_digest',
  template_data JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL, -- Curated content for this campaign
  custom_message TEXT, -- Admin custom message
  branding JSONB DEFAULT '{
    "primary_color": "#3B82F6",
    "secondary_color": "#64748B", 
    "logo_url": "",
    "header_image": "",
    "footer_text": "Kootenay Tech Community",
    "social_links": []
  }',
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  send_type VARCHAR DEFAULT 'manual' CHECK (send_type IN ('manual', 'scheduled', 'automated')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  delivery_stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "bounced": 0, "opened": 0, "clicked": 0}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter templates
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR DEFAULT 'mjml' CHECK (type IN ('mjml', 'react-email')),
  template_content TEXT NOT NULL, -- MJML or React Email template
  default_settings JSONB DEFAULT '{}',
  preview_image VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content curation rules for automated newsletter generation
CREATE TABLE IF NOT EXISTS newsletter_content_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  content_type VARCHAR NOT NULL, -- 'events', 'news', 'opportunities', 'marketplace', 'members'
  selection_criteria JSONB NOT NULL, -- Query filters and sorting rules
  max_items INTEGER DEFAULT 5,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign analytics and tracking
CREATE TABLE IF NOT EXISTS newsletter_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES newsletter_subscriptions(id),
  event_type VARCHAR NOT NULL CHECK (event_type IN ('sent', 'delivered', 'bounced', 'opened', 'clicked', 'unsubscribed', 'complained')),
  event_data JSONB, -- Additional event details (link clicked, bounce reason, etc.)
  postmark_message_id VARCHAR, -- Postmark tracking ID
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Auto-generated newsletter content cache
CREATE TABLE IF NOT EXISTS newsletter_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day',
  UNIQUE(content_type, date_range_start, date_range_end)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_member_id ON newsletter_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_token ON newsletter_subscriptions(subscription_token);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_by ON newsletter_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON newsletter_campaigns(sent_at);

CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_campaign_id ON newsletter_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_event_type ON newsletter_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_occurred_at ON newsletter_analytics(occurred_at);

CREATE INDEX IF NOT EXISTS idx_newsletter_content_cache_type_date ON newsletter_content_cache(content_type, date_range_start, date_range_end);

-- Row Level Security Policies

-- Newsletter subscriptions: Users can manage their own, admins can manage all
CREATE POLICY "Users can view own newsletter subscription" ON newsletter_subscriptions
  FOR SELECT USING (
    auth.uid() = member_id OR 
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

CREATE POLICY "Anyone can create newsletter subscription" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own newsletter subscription" ON newsletter_subscriptions
  FOR UPDATE USING (
    auth.uid() = member_id OR 
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

-- Newsletter campaigns: Only admins can manage
CREATE POLICY "Admins can manage newsletter campaigns" ON newsletter_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

-- Newsletter templates: Only admins can manage
CREATE POLICY "Admins can manage newsletter templates" ON newsletter_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

-- Content rules: Only admins can manage
CREATE POLICY "Admins can manage content rules" ON newsletter_content_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

-- Analytics: Only admins can view
CREATE POLICY "Admins can view newsletter analytics" ON newsletter_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

CREATE POLICY "System can insert newsletter analytics" ON newsletter_analytics
  FOR INSERT WITH CHECK (true);

-- Content cache: Only system and admins
CREATE POLICY "Admins can manage content cache" ON newsletter_content_cache
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('superadmin', 'admin'))
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at
    BEFORE UPDATE ON newsletter_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_newsletter_updated_at();

CREATE TRIGGER update_newsletter_campaigns_updated_at
    BEFORE UPDATE ON newsletter_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_newsletter_updated_at();

CREATE TRIGGER update_newsletter_templates_updated_at
    BEFORE UPDATE ON newsletter_templates
    FOR EACH ROW EXECUTE FUNCTION update_newsletter_updated_at();

CREATE TRIGGER update_newsletter_content_rules_updated_at
    BEFORE UPDATE ON newsletter_content_rules
    FOR EACH ROW EXECUTE FUNCTION update_newsletter_updated_at();

-- Insert default newsletter templates
INSERT INTO newsletter_templates (id, name, description, type, template_content, default_settings) VALUES
(
  'community_digest',
  'Community Digest',
  'Weekly digest featuring community events, news, and opportunities',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>Community Digest</mj-title>
      <mj-preview>Your weekly update from the Kootenay Tech Community</mj-preview>
    </mj-head>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>Community Newsletter Template</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{
    "sections": ["hero", "events", "news", "opportunities", "footer"],
    "max_events": 5,
    "max_news": 3,
    "max_opportunities": 3
  }'
),
(
  'event_announcement',
  'Event Announcement',
  'Template for promoting specific events',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>Event Announcement</mj-title>
    </mj-head>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>Event Announcement Template</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{
    "sections": ["hero", "event_details", "speakers", "registration", "footer"],
    "event_focus": true
  }'
),
(
  'monthly_roundup',
  'Monthly Roundup',
  'Comprehensive monthly community update',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>Monthly Roundup</mj-title>
    </mj-head>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>Monthly Roundup Template</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{
    "sections": ["hero", "stats", "events", "news", "opportunities", "members", "footer"],
    "show_stats": true,
    "max_events": 10,
    "max_news": 5
  }'
) ON CONFLICT (id) DO NOTHING;

-- Insert default content curation rules
INSERT INTO newsletter_content_rules (name, description, content_type, selection_criteria, max_items, priority) VALUES
(
  'Upcoming Events',
  'Featured upcoming events for newsletter inclusion',
  'events',
  '{
    "status": "published",
    "date_filter": "upcoming",
    "featured_first": true,
    "max_weeks_ahead": 4,
    "sort_by": "date",
    "include_registration_info": true
  }',
  5,
  1
),
(
  'Latest News',
  'Recent news articles for newsletter',
  'news', 
  '{
    "status": "published",
    "date_filter": "recent",
    "max_days_old": 14,
    "featured_first": true,
    "sort_by": "created_at",
    "include_excerpt": true
  }',
  3,
  2
),
(
  'New Opportunities',
  'Recent job and volunteer opportunities',
  'opportunities',
  '{
    "status": "published",
    "date_filter": "recent", 
    "max_days_old": 30,
    "active_only": true,
    "sort_by": "created_at",
    "include_company": true
  }',
  3,
  3
),
(
  'Featured Marketplace',
  'Featured marketplace listings',
  'marketplace',
  '{
    "status": "published",
    "featured_only": true,
    "active_only": true,
    "max_days_old": 30,
    "sort_by": "featured_at",
    "include_images": true
  }',
  2,
  4
),
(
  'Member Spotlight',
  'Featured community members',
  'members',
  '{
    "status": "published",
    "featured_only": true,
    "new_members": false,
    "sort_by": "random",
    "include_bio": true
  }',
  1,
  5
) ON CONFLICT DO NOTHING;

-- Function to clean up expired content cache
CREATE OR REPLACE FUNCTION cleanup_expired_newsletter_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM newsletter_content_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get newsletter subscription stats
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS TABLE(
  total_subscribers bigint,
  active_subscribers bigint,
  pending_subscribers bigint,
  total_campaigns bigint,
  sent_campaigns bigint,
  avg_open_rate numeric,
  avg_click_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM newsletter_subscriptions),
    (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'active'),
    (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'pending'),
    (SELECT COUNT(*) FROM newsletter_campaigns),
    (SELECT COUNT(*) FROM newsletter_campaigns WHERE status = 'sent'),
    (SELECT ROUND(AVG(
      CASE 
        WHEN (delivery_stats->>'sent')::int > 0 
        THEN (delivery_stats->>'opened')::numeric / (delivery_stats->>'sent')::numeric * 100
        ELSE 0 
      END
    ), 2) FROM newsletter_campaigns WHERE status = 'sent'),
    (SELECT ROUND(AVG(
      CASE 
        WHEN (delivery_stats->>'opened')::int > 0 
        THEN (delivery_stats->>'clicked')::numeric / (delivery_stats->>'opened')::numeric * 100
        ELSE 0 
      END
    ), 2) FROM newsletter_campaigns WHERE status = 'sent');
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON newsletter_subscriptions TO authenticated;
GRANT ALL ON newsletter_campaigns TO authenticated;
GRANT ALL ON newsletter_templates TO authenticated;
GRANT ALL ON newsletter_content_rules TO authenticated;
GRANT ALL ON newsletter_analytics TO authenticated;
GRANT ALL ON newsletter_content_cache TO authenticated;