-- Ensure feature_toggles table has proper structure and test data
-- This fixes any issues with missing feature toggle data

-- Ensure the table exists with the current schema
CREATE TABLE IF NOT EXISTS public.feature_toggles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    enabled_for_users UUID[] DEFAULT '{}',
    enabled_for_roles TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    category TEXT DEFAULT 'general'
);

-- Ensure basic feature toggles exist
INSERT INTO public.feature_toggles (feature_key, enabled, description, category, created_at, updated_at)
VALUES 
  -- Core Features
  ('members_directory', true, 'Member directory and profiles', 'core', NOW(), NOW()),
  ('companies_listing', true, 'Company directory', 'core', NOW(), NOW()),
  ('events_system', true, 'Events and workshops system', 'core', NOW(), NOW()),
  ('news_blog', true, 'News and blog articles', 'core', NOW(), NOW()),
  ('groups_communities', true, 'Groups and communities feature', 'core', NOW(), NOW()),
  ('resources_library', true, 'Educational resources library', 'core', NOW(), NOW()),
  ('marketplace', true, 'Buy/sell marketplace', 'core', NOW(), NOW()),
  ('opportunities_board', true, 'Jobs and opportunities board', 'core', NOW(), NOW()),
  ('photo_galleries', true, 'Photo galleries feature', 'core', NOW(), NOW()),
  
  -- Social Features
  ('user_messaging', false, 'Direct messaging between users', 'social', NOW(), NOW()),
  ('social_feeds', false, 'Social activity feeds', 'social', NOW(), NOW()),
  ('user_following', false, 'User following system', 'social', NOW(), NOW()),
  ('content_likes', false, 'Like/favorite content', 'social', NOW(), NOW()),
  ('content_comments', false, 'Comment on content', 'social', NOW(), NOW()),
  ('content_sharing', false, 'Share content externally', 'social', NOW(), NOW()),
  
  -- Advanced Features
  ('advanced_search', false, 'Advanced search and filtering', 'advanced', NOW(), NOW()),
  ('content_tagging', false, 'Tag and categorize content', 'advanced', NOW(), NOW()),
  ('notification_system', false, 'Push and email notifications', 'advanced', NOW(), NOW()),
  ('calendar_integration', false, 'Calendar sync and integration', 'advanced', NOW(), NOW()),
  ('payment_processing', false, 'Payment and billing features', 'advanced', NOW(), NOW()),
  ('analytics_dashboard', false, 'Analytics and reporting', 'advanced', NOW(), NOW()),
  
  -- Admin Features
  ('bulk_operations', false, 'Bulk content operations', 'admin', NOW(), NOW()),
  ('audit_logging', true, 'Audit logs and tracking', 'admin', NOW(), NOW()),
  ('content_moderation', true, 'Content moderation tools', 'admin', NOW(), NOW()),
  ('user_management', true, 'Advanced user management', 'admin', NOW(), NOW()),
  ('newsletter_system', false, 'Email newsletter system', 'admin', NOW(), NOW()),
  
  -- Integration Features
  ('api_access', false, 'REST API access', 'integration', NOW(), NOW()),
  ('webhook_support', false, 'Webhook notifications', 'integration', NOW(), NOW()),
  ('sso_integration', false, 'Single sign-on integration', 'integration', NOW(), NOW()),
  ('ldap_integration', false, 'LDAP directory integration', 'integration', NOW(), NOW()),
  
  -- Mobile & Experimental
  ('mobile_app', false, 'Mobile application support', 'mobile', NOW(), NOW()),
  ('push_notifications', false, 'Mobile push notifications', 'mobile', NOW(), NOW()),
  ('offline_mode', false, 'Offline functionality', 'mobile', NOW(), NOW()),
  ('ai_content_suggestions', false, 'AI-powered content suggestions', 'experimental', NOW(), NOW()),
  ('automated_moderation', false, 'Automated content moderation', 'experimental', NOW(), NOW()),
  ('smart_matching', false, 'Smart user/content matching', 'experimental', NOW(), NOW()),
  ('voice_features', false, 'Voice notes and commands', 'experimental', NOW(), NOW()),
  ('video_features', false, 'Video content and calls', 'experimental', NOW(), NOW())
ON CONFLICT (feature_key) DO UPDATE 
SET 
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON public.feature_toggles(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_category ON public.feature_toggles(category);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_feature_key ON public.feature_toggles(feature_key);

-- Enable RLS (if not already enabled)
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;

-- Create policies for feature toggles (superadmin access only)
DROP POLICY IF EXISTS "Superadmins can view feature toggles" ON public.feature_toggles;
CREATE POLICY "Superadmins can view feature toggles" ON public.feature_toggles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

DROP POLICY IF EXISTS "Superadmins can manage feature toggles" ON public.feature_toggles;
CREATE POLICY "Superadmins can manage feature toggles" ON public.feature_toggles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS update_feature_toggles_updated_at ON public.feature_toggles;
CREATE TRIGGER update_feature_toggles_updated_at
  BEFORE UPDATE ON public.feature_toggles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();