-- Newsletter System Enhancements
-- This migration adds tables for segments, enhanced templates, A/B testing, and advanced analytics

-- Newsletter Segments Table
CREATE TABLE IF NOT EXISTS newsletter_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_dynamic BOOLEAN DEFAULT false,
  color VARCHAR DEFAULT '#3B82F6',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Segment Assignments Table (for both static and dynamic segments)
CREATE TABLE IF NOT EXISTS newsletter_segment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES newsletter_segments(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES newsletter_subscriptions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(segment_id, subscription_id)
);

-- Enhanced Newsletter Templates Table (extend existing)
ALTER TABLE newsletter_templates 
ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'general',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Newsletter A/B Tests Table
CREATE TABLE IF NOT EXISTS newsletter_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  campaign_a_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  campaign_b_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  test_percentage DECIMAL(5,2) CHECK (test_percentage > 0 AND test_percentage <= 100),
  winner_metric VARCHAR CHECK (winner_metric IN ('open_rate', 'click_rate', 'conversion_rate')),
  status VARCHAR CHECK (status IN ('draft', 'running', 'completed', 'cancelled')) DEFAULT 'draft',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  results JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement Scores Table
CREATE TABLE IF NOT EXISTS newsletter_engagement_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES newsletter_subscriptions(id) ON DELETE CASCADE,
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  factors JSONB NOT NULL DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id)
);

-- Campaign Schedules Table
CREATE TABLE IF NOT EXISTS newsletter_campaign_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  schedule_type VARCHAR CHECK (schedule_type IN ('one_time', 'recurring', 'drip')),
  scheduled_at TIMESTAMPTZ,
  recurring_pattern JSONB,
  drip_config JSONB,
  timezone VARCHAR DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Content Performance Table
CREATE TABLE IF NOT EXISTS newsletter_content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR NOT NULL,
  content_id VARCHAR,
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  metrics JSONB NOT NULL DEFAULT '{}',
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_segments_created_by ON newsletter_segments(created_by);
CREATE INDEX IF NOT EXISTS idx_newsletter_segments_is_dynamic ON newsletter_segments(is_dynamic);
CREATE INDEX IF NOT EXISTS idx_newsletter_segment_assignments_segment_id ON newsletter_segment_assignments(segment_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_segment_assignments_subscription_id ON newsletter_segment_assignments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_templates_category ON newsletter_templates(category);
CREATE INDEX IF NOT EXISTS idx_newsletter_templates_tags ON newsletter_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_newsletter_templates_created_by ON newsletter_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_newsletter_ab_tests_status ON newsletter_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_ab_tests_created_by ON newsletter_ab_tests(created_by);
CREATE INDEX IF NOT EXISTS idx_newsletter_engagement_scores_score ON newsletter_engagement_scores(score);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaign_schedules_scheduled_at ON newsletter_campaign_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaign_schedules_is_active ON newsletter_campaign_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_content_performance_content_type ON newsletter_content_performance(content_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_content_performance_campaign_id ON newsletter_content_performance(campaign_id);

-- Apply updated_at triggers
CREATE TRIGGER update_newsletter_segments_updated_at
  BEFORE UPDATE ON newsletter_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_newsletter_ab_tests_updated_at
  BEFORE UPDATE ON newsletter_ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_newsletter_campaign_schedules_updated_at
  BEFORE UPDATE ON newsletter_campaign_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE newsletter_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_segment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_engagement_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaign_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_content_performance ENABLE ROW LEVEL SECURITY;

-- Segment policies (admins can manage all)
CREATE POLICY "Admins can manage segments" ON newsletter_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Segment assignment policies
CREATE POLICY "Admins can manage segment assignments" ON newsletter_segment_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- A/B test policies
CREATE POLICY "Admins can manage AB tests" ON newsletter_ab_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Engagement scores policies
CREATE POLICY "Admins can view engagement scores" ON newsletter_engagement_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "System can manage engagement scores" ON newsletter_engagement_scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update engagement scores" ON newsletter_engagement_scores
  FOR UPDATE USING (true);

-- Campaign schedule policies
CREATE POLICY "Admins can manage campaign schedules" ON newsletter_campaign_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

-- Content performance policies
CREATE POLICY "Admins can view content performance" ON newsletter_content_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "System can manage content performance" ON newsletter_content_performance
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Functions for newsletter enhancements

-- Function to refresh dynamic segments
CREATE OR REPLACE FUNCTION refresh_dynamic_segment(segment_id_param UUID)
RETURNS void AS $$
DECLARE
  segment_criteria JSONB;
  subscriber_ids UUID[];
BEGIN
  -- Get segment criteria
  SELECT criteria INTO segment_criteria
  FROM newsletter_segments
  WHERE id = segment_id_param AND is_dynamic = true;

  -- Clear existing assignments
  DELETE FROM newsletter_segment_assignments WHERE segment_id = segment_id_param;

  -- This is a simplified implementation
  -- In practice, you would parse the criteria JSON and build dynamic queries
  -- For now, we'll just add active subscribers as an example
  INSERT INTO newsletter_segment_assignments (segment_id, subscription_id)
  SELECT segment_id_param, id
  FROM newsletter_subscriptions
  WHERE status = 'active'
  LIMIT 100; -- Prevent runaway queries
END;
$$ LANGUAGE plpgsql;

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(subscription_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  sent_count INTEGER;
  open_count INTEGER;
  click_count INTEGER;
  subscription_age_days INTEGER;
  score DECIMAL;
BEGIN
  -- Get analytics counts
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'sent'),
    COUNT(*) FILTER (WHERE event_type = 'opened'),
    COUNT(*) FILTER (WHERE event_type = 'clicked')
  INTO sent_count, open_count, click_count
  FROM newsletter_analytics
  WHERE subscription_id = subscription_id_param;

  -- Get subscription age
  SELECT EXTRACT(days FROM NOW() - subscribed_at)
  INTO subscription_age_days
  FROM newsletter_subscriptions
  WHERE id = subscription_id_param;

  -- Calculate score (simplified algorithm)
  score := CASE 
    WHEN sent_count = 0 THEN 0
    ELSE 
      (CAST(open_count AS DECIMAL) / sent_count * 50) +
      (CASE WHEN open_count = 0 THEN 0 ELSE CAST(click_count AS DECIMAL) / open_count * 30 END) +
      (LEAST(subscription_age_days / 30.0, 12) * 1.5) -- Longevity bonus
  END;

  -- Insert or update engagement score
  INSERT INTO newsletter_engagement_scores (subscription_id, score, factors, calculated_at)
  VALUES (
    subscription_id_param,
    LEAST(100, score),
    jsonb_build_object(
      'open_rate', CASE WHEN sent_count = 0 THEN 0 ELSE CAST(open_count AS DECIMAL) / sent_count * 100 END,
      'click_rate', CASE WHEN open_count = 0 THEN 0 ELSE CAST(click_count AS DECIMAL) / open_count * 100 END,
      'subscription_age_days', subscription_age_days
    ),
    NOW()
  )
  ON CONFLICT (subscription_id) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    factors = EXCLUDED.factors,
    calculated_at = EXCLUDED.calculated_at;

  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

-- Function to get segment subscriber count
CREATE OR REPLACE FUNCTION get_segment_subscriber_count(segment_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  subscriber_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO subscriber_count
  FROM newsletter_segment_assignments
  WHERE segment_id = segment_id_param;

  RETURN COALESCE(subscriber_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Insert default segments
INSERT INTO newsletter_segments (name, description, criteria, is_dynamic, created_by) VALUES
  ('Highly Engaged', 'Subscribers with high engagement scores', '{"engagement_score_min": 70}', true, (SELECT id FROM auth.users LIMIT 1)),
  ('New Subscribers', 'Subscribers who joined in the last 30 days', '{"subscribed_after": "30_days_ago"}', true, (SELECT id FROM auth.users LIMIT 1)),
  ('Event Enthusiasts', 'Subscribers interested in events', '{"content_preferences": ["events"]}', true, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert enhanced template categories
UPDATE newsletter_templates 
SET category = 'newsletter', tags = ARRAY['digest', 'weekly'] 
WHERE name = 'Community Digest';

UPDATE newsletter_templates 
SET category = 'event', tags = ARRAY['announcement', 'single'] 
WHERE name = 'Event Announcement';

UPDATE newsletter_templates 
SET category = 'welcome', tags = ARRAY['onboarding', 'first-time'] 
WHERE name = 'Welcome Email';