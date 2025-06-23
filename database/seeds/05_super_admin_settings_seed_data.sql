-- Super Admin Settings Seed Data
-- Populates default settings and feature toggles for the platform

-- Insert default application settings
INSERT INTO public.application_settings (category, setting_key, setting_value, data_type, is_public, description, created_by, updated_by)
VALUES 
  -- Site Configuration
  ('site', 'title', '"Kootenay Tech Community"', 'string', true, 'Main site title displayed in header and browser'),
  ('site', 'description', '"A vibrant tech community in the Kootenays"', 'string', true, 'Site description for SEO and about sections'),
  ('site', 'logo_url', '"/logo.png"', 'string', true, 'URL to the main site logo'),
  ('site', 'favicon_url', '"/favicon.ico"', 'string', true, 'URL to the site favicon'),
  ('site', 'primary_color', '"#2563eb"', 'string', true, 'Primary brand color (hex)'),
  ('site', 'secondary_color', '"#64748b"', 'string', true, 'Secondary brand color (hex)'),
  
  -- Location Settings
  ('location', 'primary_city', '"Nelson"', 'string', true, 'Primary city for the community'),
  ('location', 'region', '"Kootenays"', 'string', true, 'Regional area covered'),
  ('location', 'province_state', '"British Columbia"', 'string', true, 'Province or state'),
  ('location', 'country', '"Canada"', 'string', true, 'Country'),
  ('location', 'timezone', '"America/Vancouver"', 'string', false, 'Default timezone for events and dates'),
  ('location', 'currency', '"CAD"', 'string', false, 'Default currency code'),
  
  -- Community Settings
  ('community', 'size_classification', '"medium"', 'string', false, 'Community size: small, medium, large, enterprise'),
  ('community', 'member_limit', '1000', 'number', false, 'Maximum number of members (0 = unlimited)'),
  ('community', 'requires_approval', 'true', 'boolean', false, 'Whether new members require approval'),
  ('community', 'public_registration', 'true', 'boolean', false, 'Allow public registration'),
  ('community', 'invite_only', 'false', 'boolean', false, 'Restrict to invite-only membership'),
  
  -- Contact Information
  ('contact', 'email', '"info@kootenaytechcommunity.com"', 'string', true, 'Main contact email'),
  ('contact', 'phone', '"+1-250-555-0123"', 'string', true, 'Main contact phone'),
  ('contact', 'address', '"123 Tech Street, Nelson, BC"', 'string', true, 'Physical address'),
  ('contact', 'business_hours', '"Mon-Fri 9AM-5PM PST"', 'string', true, 'Business hours display'),
  
  -- Social Media
  ('social', 'facebook_url', '""', 'string', true, 'Facebook page URL'),
  ('social', 'twitter_url', '""', 'string', true, 'Twitter/X profile URL'),
  ('social', 'linkedin_url', '""', 'string', true, 'LinkedIn page URL'),
  ('social', 'instagram_url', '""', 'string', true, 'Instagram profile URL'),
  ('social', 'youtube_url', '""', 'string', true, 'YouTube channel URL'),
  
  -- Content Settings
  ('content', 'default_language', '"en"', 'string', false, 'Default language code'),
  ('content', 'enable_moderation', 'true', 'boolean', false, 'Enable content moderation'),
  ('content', 'auto_approve_content', 'false', 'boolean', false, 'Automatically approve user content'),
  ('content', 'max_upload_size', '10', 'number', false, 'Maximum file upload size in MB'),
  
  -- Security Settings
  ('security', 'password_min_length', '8', 'number', false, 'Minimum password length'),
  ('security', 'require_email_verification', 'true', 'boolean', false, 'Require email verification for new accounts'),
  ('security', 'session_timeout', '24', 'number', false, 'Session timeout in hours'),
  ('security', 'max_login_attempts', '5', 'number', false, 'Maximum failed login attempts before lockout'),
  
  -- Email Settings
  ('email', 'smtp_enabled', 'false', 'boolean', false, 'Enable SMTP email sending'),
  ('email', 'from_email', '"noreply@kootenaytechcommunity.com"', 'string', false, 'Default from email address'),
  ('email', 'from_name', '"Kootenay Tech Community"', 'string', false, 'Default from name'),
  
  -- Analytics
  ('analytics', 'google_analytics_id', '""', 'string', false, 'Google Analytics tracking ID'),
  ('analytics', 'enable_tracking', 'false', 'boolean', false, 'Enable user activity tracking'),
  
  -- Maintenance
  ('maintenance', 'maintenance_mode', 'false', 'boolean', false, 'Enable maintenance mode'),
  ('maintenance', 'maintenance_message', '"Site temporarily unavailable for maintenance"', 'string', false, 'Message shown during maintenance')
ON CONFLICT (category, setting_key) DO NOTHING;

-- Insert default feature toggles
INSERT INTO public.feature_toggles (feature_key, enabled, description, config, rollout_percentage, enabled_for_roles)
VALUES 
  -- Core Features
  ('members_directory', true, 'Enable member directory and profiles', '{}', 100, '{superadmin,admin,member}'),
  ('companies_listing', true, 'Enable companies directory', '{}', 100, '{superadmin,admin,member}'),
  ('events_system', true, 'Enable events creation and management', '{}', 100, '{superadmin,admin,member}'),
  ('news_blog', true, 'Enable news and blog functionality', '{}', 100, '{superadmin,admin,member}'),
  ('groups_communities', true, 'Enable groups and communities', '{}', 100, '{superadmin,admin,member}'),
  ('resources_library', true, 'Enable resources and document library', '{}', 100, '{superadmin,admin,member}'),
  ('marketplace', true, 'Enable marketplace for buying/selling', '{}', 100, '{superadmin,admin,member}'),
  ('opportunities_board', true, 'Enable job and opportunity postings', '{}', 100, '{superadmin,admin,member}'),
  ('photo_galleries', true, 'Enable photo gallery system', '{}', 100, '{superadmin,admin,member}'),
  
  -- Social Features
  ('user_messaging', false, 'Enable direct messaging between users', '{}', 0, '{superadmin,admin}'),
  ('social_feeds', false, 'Enable social media style feeds', '{}', 0, '{superadmin,admin}'),
  ('user_following', false, 'Enable user following/followers', '{}', 0, '{superadmin,admin}'),
  ('content_likes', true, 'Enable likes/reactions on content', '{}', 100, '{superadmin,admin,member}'),
  ('content_comments', true, 'Enable comments on content', '{}', 100, '{superadmin,admin,member}'),
  ('content_sharing', true, 'Enable social sharing of content', '{}', 100, '{superadmin,admin,member}'),
  
  -- Advanced Features
  ('advanced_search', true, 'Enable advanced search and filtering', '{}', 100, '{superadmin,admin,member}'),
  ('content_tagging', true, 'Enable tagging system for content', '{}', 100, '{superadmin,admin,member}'),
  ('notification_system', true, 'Enable push notifications', '{}', 100, '{superadmin,admin,member}'),
  ('calendar_integration', false, 'Enable calendar integration (Google, Outlook)', '{}', 0, '{superadmin,admin}'),
  ('payment_processing', false, 'Enable payment processing for events/marketplace', '{}', 0, '{superadmin,admin}'),
  ('analytics_dashboard', true, 'Enable analytics and reporting', '{}', 100, '{superadmin,admin}'),
  
  -- Admin Features
  ('bulk_operations', true, 'Enable bulk operations in admin', '{}', 100, '{superadmin,admin}'),
  ('audit_logging', true, 'Enable detailed audit logging', '{}', 100, '{superadmin,admin}'),
  ('content_moderation', true, 'Enable content moderation tools', '{}', 100, '{superadmin,admin}'),
  ('user_management', true, 'Enable advanced user management', '{}', 100, '{superadmin,admin}'),
  ('newsletter_system', true, 'Enable newsletter campaigns', '{}', 100, '{superadmin,admin}'),
  
  -- Integration Features
  ('api_access', false, 'Enable API access for third-party integrations', '{}', 0, '{superadmin}'),
  ('webhook_support', false, 'Enable webhook notifications', '{}', 0, '{superadmin}'),
  ('sso_integration', false, 'Enable Single Sign-On integration', '{}', 0, '{superadmin}'),
  ('ldap_integration', false, 'Enable LDAP/Active Directory integration', '{}', 0, '{superadmin}'),
  
  -- Mobile Features
  ('mobile_app', false, 'Enable mobile app features', '{}', 0, '{superadmin,admin}'),
  ('push_notifications', false, 'Enable mobile push notifications', '{}', 0, '{superadmin,admin}'),
  ('offline_mode', false, 'Enable offline mode for mobile', '{}', 0, '{superadmin,admin}'),
  
  -- Experimental Features
  ('ai_content_suggestions', false, 'Enable AI-powered content suggestions', '{}', 0, '{superadmin}'),
  ('automated_moderation', false, 'Enable AI-powered content moderation', '{}', 0, '{superadmin}'),
  ('smart_matching', false, 'Enable smart matching for networking', '{}', 0, '{superadmin}'),
  ('voice_features', false, 'Enable voice notes and audio content', '{}', 0, '{superadmin}'),
  ('video_features', false, 'Enable video content and streaming', '{}', 0, '{superadmin}')
ON CONFLICT (feature_key) DO NOTHING;

-- Add some sample history entries
INSERT INTO public.settings_history (setting_id, category, setting_key, old_value, new_value, change_type, changed_by, ip_address, user_agent)
SELECT 
  s.id,
  s.category,
  s.setting_key,
  'null'::jsonb,
  s.setting_value,
  'created',
  s.created_by,
  '127.0.0.1'::inet,
  'System Setup'
FROM public.application_settings s
WHERE s.created_at > NOW() - INTERVAL '1 minute'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_application_settings_category ON public.application_settings (category);
CREATE INDEX IF NOT EXISTS idx_application_settings_public ON public.application_settings (is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON public.feature_toggles (enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_settings_history_changed_at ON public.settings_history (changed_at DESC);

-- Add some sample customization data for different community types
INSERT INTO public.application_settings (category, setting_key, setting_value, data_type, is_public, description, is_system)
VALUES 
  -- Template configurations
  ('templates', 'small_community_config', '{"max_members": 100, "features": ["members_directory", "events_system", "news_blog"], "theme": "simple"}', 'object', false, 'Configuration template for small communities', true),
  ('templates', 'medium_community_config', '{"max_members": 1000, "features": ["members_directory", "companies_listing", "events_system", "news_blog", "groups_communities", "resources_library"], "theme": "professional"}', 'object', false, 'Configuration template for medium communities', true),
  ('templates', 'large_community_config', '{"max_members": 0, "features": ["all"], "theme": "enterprise"}', 'object', false, 'Configuration template for large communities', true),
  
  -- Page customization defaults
  ('pages', 'home_hero_title', '"Welcome to Kootenay Tech Community"', 'string', true, 'Hero section title on home page'),
  ('pages', 'home_hero_subtitle', '"Connecting tech professionals in the beautiful Kootenays"', 'string', true, 'Hero section subtitle on home page'),
  ('pages', 'home_hero_image', '"/images/hero-nelson.jpg"', 'string', true, 'Hero section background image'),
  ('pages', 'about_page_content', '"We are a vibrant community of technology professionals, entrepreneurs, and enthusiasts located in the beautiful Kootenay region of British Columbia."', 'string', true, 'About page main content'),
  ('pages', 'contact_page_intro', '"Get in touch with our community team"', 'string', true, 'Contact page introduction text'),
  
  -- Navigation customization
  ('navigation', 'show_companies', 'true', 'boolean', false, 'Show companies in main navigation'),
  ('navigation', 'show_marketplace', 'true', 'boolean', false, 'Show marketplace in main navigation'),
  ('navigation', 'show_opportunities', 'true', 'boolean', false, 'Show opportunities in main navigation'),
  ('navigation', 'show_resources', 'true', 'boolean', false, 'Show resources in main navigation'),
  ('navigation', 'show_galleries', 'true', 'boolean', false, 'Show galleries in main navigation'),
  
  -- Footer customization
  ('footer', 'copyright_text', '"© 2024 Kootenay Tech Community. All rights reserved."', 'string', true, 'Footer copyright text'),
  ('footer', 'show_social_links', 'true', 'boolean', true, 'Show social media links in footer'),
  ('footer', 'show_newsletter_signup', 'true', 'boolean', true, 'Show newsletter signup in footer')
ON CONFLICT (category, setting_key) DO NOTHING;

-- Log successful seed completion
INSERT INTO public.settings_history (category, setting_key, new_value, change_type, ip_address, user_agent)
VALUES ('system', 'seed_data_loaded', '"Super Admin Settings seed data loaded successfully"', 'created', '127.0.0.1', 'Database Seed Script')
ON CONFLICT DO NOTHING;