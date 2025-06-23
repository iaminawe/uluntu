-- Super Admin Settings System Migration
-- Creates complete settings system with proper integration to existing architecture
-- Date: 2025-06-22
-- Version: 1.0.0

-- =====================================
-- 1. SETTINGS CATEGORIES TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.settings_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT, -- Lucide icon names
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 2. SETTINGS DEFINITIONS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.settings_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.settings_categories(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'json', 'array', 'url', 'email', 'color', 'image')),
    default_value JSONB,
    validation_rules JSONB DEFAULT '{}', -- JSON schema for validation
    is_required BOOLEAN DEFAULT false,
    is_sensitive BOOLEAN DEFAULT false, -- For passwords, API keys, etc.
    is_public BOOLEAN DEFAULT false, -- Whether setting is publicly accessible
    sort_order INTEGER DEFAULT 0,
    help_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 3. SETTINGS VALUES TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.settings_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL REFERENCES public.settings_definitions(setting_key) ON DELETE CASCADE,
    value JSONB NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(setting_key, environment)
);

-- =====================================
-- 4. FEATURE TOGGLES SYSTEM
-- =====================================

CREATE TABLE IF NOT EXISTS public.feature_toggles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_groups JSONB DEFAULT '[]', -- Array of group IDs or user segments
    conditions JSONB DEFAULT '{}', -- Complex conditions for feature activation
    dependencies JSONB DEFAULT '[]', -- Array of required feature keys
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================
-- 5. CUSTOMIZATION CONTENT TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.customization_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_key TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'html', 'markdown', 'image', 'video', 'file')),
    language_code VARCHAR(10) DEFAULT 'en',
    title TEXT,
    content TEXT,
    media_url TEXT,
    alt_text TEXT, -- For images
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(content_key, language_code)
);

-- =====================================
-- 6. COMMUNITY CONFIGURATION TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.community_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_name TEXT NOT NULL,
    theme_config JSONB DEFAULT '{}', -- Colors, fonts, layout preferences
    branding_config JSONB DEFAULT '{}', -- Logos, images, brand assets
    feature_config JSONB DEFAULT '{}', -- Enabled/disabled features per community
    navigation_config JSONB DEFAULT '{}', -- Custom navigation structure
    content_config JSONB DEFAULT '{}', -- Custom content overrides
    social_config JSONB DEFAULT '{}', -- Social media links and integrations
    contact_config JSONB DEFAULT '{}', -- Contact information
    seo_config JSONB DEFAULT '{}', -- SEO settings
    analytics_config JSONB DEFAULT '{}', -- Analytics tracking codes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================
-- 7. SETTINGS AUDIT TRAIL
-- =====================================

CREATE TABLE IF NOT EXISTS public.settings_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[], -- Array of field names that changed
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    ip_address INET,
    user_agent TEXT,
    session_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 8. SETTINGS VERSIONS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.settings_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_name TEXT NOT NULL UNIQUE,
    description TEXT,
    settings_snapshot JSONB NOT NULL, -- Complete settings state
    feature_toggles_snapshot JSONB NOT NULL, -- Complete feature toggles state
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    activated_at TIMESTAMPTZ,
    activated_by UUID REFERENCES auth.users(id)
);

-- =====================================
-- 9. MEDIA ASSETS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_key TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER, -- For images
    height INTEGER, -- For images
    alt_text TEXT,
    usage_context TEXT[], -- Where this asset is used
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- Settings categories
CREATE INDEX IF NOT EXISTS idx_settings_categories_active ON public.settings_categories(is_active, sort_order);

-- Settings definitions
CREATE INDEX IF NOT EXISTS idx_settings_definitions_category ON public.settings_definitions(category_id);
CREATE INDEX IF NOT EXISTS idx_settings_definitions_key ON public.settings_definitions(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_definitions_public ON public.settings_definitions(is_public) WHERE is_public = true;

-- Settings values
CREATE INDEX IF NOT EXISTS idx_settings_values_key ON public.settings_values(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_values_environment ON public.settings_values(environment);
CREATE INDEX IF NOT EXISTS idx_settings_values_updated ON public.settings_values(updated_at DESC);

-- Feature toggles
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON public.feature_toggles(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_feature_toggles_key ON public.feature_toggles(feature_key);

-- Customization content
CREATE INDEX IF NOT EXISTS idx_customization_content_key_lang ON public.customization_content(content_key, language_code);
CREATE INDEX IF NOT EXISTS idx_customization_content_active ON public.customization_content(is_active) WHERE is_active = true;

-- Community configuration
CREATE INDEX IF NOT EXISTS idx_community_configuration_active ON public.community_configuration(is_active) WHERE is_active = true;

-- Audit log
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_table_record ON public.settings_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_user ON public.settings_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_created ON public.settings_audit_log(created_at DESC);

-- Media assets
CREATE INDEX IF NOT EXISTS idx_media_assets_key ON public.media_assets(asset_key);
CREATE INDEX IF NOT EXISTS idx_media_assets_public ON public.media_assets(is_public) WHERE is_public = true;

-- =====================================
-- UPDATED_AT TRIGGERS
-- =====================================

-- Use existing update_updated_at function if available, otherwise create it
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_categories_updated_at
    BEFORE UPDATE ON public.settings_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_settings_definitions_updated_at
    BEFORE UPDATE ON public.settings_definitions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_settings_values_updated_at
    BEFORE UPDATE ON public.settings_values
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_feature_toggles_updated_at
    BEFORE UPDATE ON public.feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_customization_content_updated_at
    BEFORE UPDATE ON public.customization_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_community_configuration_updated_at
    BEFORE UPDATE ON public.community_configuration
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_media_assets_updated_at
    BEFORE UPDATE ON public.media_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =====================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================

-- Function to check if user has super admin role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin role (admin or superadmin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- AUDIT TRIGGERS
-- =====================================

-- Function to log settings changes
CREATE OR REPLACE FUNCTION public.log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.settings_audit_log (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        user_id,
        user_email,
        ip_address
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE to_jsonb(NEW) END,
        CASE 
            WHEN TG_OP = 'UPDATE' THEN 
                ARRAY(SELECT json_object_keys(to_jsonb(NEW)) 
                      WHERE to_jsonb(NEW) ? json_object_keys(to_jsonb(NEW)) 
                      AND to_jsonb(OLD) ? json_object_keys(to_jsonb(NEW))
                      AND to_jsonb(NEW) ->> json_object_keys(to_jsonb(NEW)) IS DISTINCT FROM to_jsonb(OLD) ->> json_object_keys(to_jsonb(NEW)))
            ELSE NULL
        END,
        auth.uid(),
        (auth.jwt() ->> 'email'),
        inet_client_addr()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_settings_values
    AFTER INSERT OR UPDATE OR DELETE ON public.settings_values
    FOR EACH ROW
    EXECUTE FUNCTION public.log_settings_change();

CREATE TRIGGER audit_feature_toggles
    AFTER INSERT OR UPDATE OR DELETE ON public.feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_settings_change();

CREATE TRIGGER audit_customization_content
    AFTER INSERT OR UPDATE OR DELETE ON public.customization_content
    FOR EACH ROW
    EXECUTE FUNCTION public.log_settings_change();

CREATE TRIGGER audit_community_configuration
    AFTER INSERT OR UPDATE OR DELETE ON public.community_configuration
    FOR EACH ROW
    EXECUTE FUNCTION public.log_settings_change();

-- =====================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================

-- Enable RLS on all tables
ALTER TABLE public.settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Settings Categories Policies
CREATE POLICY "Super admins can manage settings categories" ON public.settings_categories
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view settings categories" ON public.settings_categories
    FOR SELECT
    USING (public.is_admin());

-- Settings Definitions Policies
CREATE POLICY "Super admins can manage settings definitions" ON public.settings_definitions
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view settings definitions" ON public.settings_definitions
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Public access to public settings definitions" ON public.settings_definitions
    FOR SELECT
    USING (is_public = true);

-- Settings Values Policies
CREATE POLICY "Super admins can manage settings values" ON public.settings_values
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view non-sensitive settings values" ON public.settings_values
    FOR SELECT
    USING (
        public.is_admin() 
        AND EXISTS (
            SELECT 1 FROM public.settings_definitions sd
            WHERE sd.setting_key = settings_values.setting_key
            AND sd.is_sensitive = false
        )
    );

CREATE POLICY "Public access to public settings values" ON public.settings_values
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.settings_definitions sd
            WHERE sd.setting_key = settings_values.setting_key
            AND sd.is_public = true
            AND sd.is_sensitive = false
        )
    );

-- Feature Toggles Policies
CREATE POLICY "Super admins can manage feature toggles" ON public.feature_toggles
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view feature toggles" ON public.feature_toggles
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can view enabled feature toggles" ON public.feature_toggles
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND is_enabled = true);

-- Customization Content Policies
CREATE POLICY "Super admins can manage customization content" ON public.customization_content
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view customization content" ON public.customization_content
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Public access to active customization content" ON public.customization_content
    FOR SELECT
    USING (is_active = true);

-- Community Configuration Policies
CREATE POLICY "Super admins can manage community configuration" ON public.community_configuration
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view community configuration" ON public.community_configuration
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Public access to active community configuration" ON public.community_configuration
    FOR SELECT
    USING (is_active = true);

-- Settings Audit Log Policies
CREATE POLICY "Super admins can view settings audit log" ON public.settings_audit_log
    FOR SELECT
    USING (public.is_super_admin());

CREATE POLICY "Admins can view own settings changes" ON public.settings_audit_log
    FOR SELECT
    USING (public.is_admin() AND user_id = auth.uid());

-- Settings Versions Policies
CREATE POLICY "Super admins can manage settings versions" ON public.settings_versions
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view settings versions" ON public.settings_versions
    FOR SELECT
    USING (public.is_admin());

-- Media Assets Policies
CREATE POLICY "Super admins can manage media assets" ON public.media_assets
    FOR ALL
    USING (public.is_super_admin());

CREATE POLICY "Admins can view media assets" ON public.media_assets
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can upload media assets" ON public.media_assets
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Public access to public media assets" ON public.media_assets
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can view own media assets" ON public.media_assets
    FOR SELECT
    USING (uploaded_by = auth.uid());

-- =====================================
-- GRANT PERMISSIONS
-- =====================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select permissions for public access
GRANT SELECT ON public.settings_definitions TO anon;
GRANT SELECT ON public.settings_values TO anon;
GRANT SELECT ON public.customization_content TO anon;
GRANT SELECT ON public.community_configuration TO anon;
GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT ON public.feature_toggles TO authenticated;

-- Grant full permissions to authenticated users (controlled by RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================
-- DEFAULT SETTINGS CATEGORIES
-- =====================================

INSERT INTO public.settings_categories (name, display_name, description, icon_name, sort_order) VALUES
    ('general', 'General Settings', 'Basic site configuration and preferences', 'Settings', 1),
    ('appearance', 'Appearance & Branding', 'Visual customization and branding options', 'Palette', 2),
    ('features', 'Feature Management', 'Control which features are available', 'ToggleLeft', 3),
    ('security', 'Security & Privacy', 'Security settings and privacy controls', 'Shield', 4),
    ('notifications', 'Notifications', 'Email and notification preferences', 'Bell', 5),
    ('integrations', 'Integrations', 'Third-party service integrations', 'Plug', 6),
    ('content', 'Content Management', 'Content display and moderation settings', 'FileText', 7),
    ('analytics', 'Analytics & Tracking', 'Analytics and performance tracking', 'BarChart3', 8),
    ('advanced', 'Advanced Settings', 'Technical and advanced configuration', 'Cog', 9)
ON CONFLICT (name) DO NOTHING;

-- =====================================
-- DEFAULT SETTINGS DEFINITIONS
-- =====================================

-- General Settings
INSERT INTO public.settings_definitions (category_id, setting_key, display_name, description, data_type, default_value, is_public, sort_order) VALUES
    ((SELECT id FROM public.settings_categories WHERE name = 'general'), 'site_title', 'Site Title', 'The main title of your community site', 'string', '"Nelson Tech Community"', true, 1),
    ((SELECT id FROM public.settings_categories WHERE name = 'general'), 'site_description', 'Site Description', 'Brief description of your community', 'string', '"A vibrant technology community"', true, 2),
    ((SELECT id FROM public.settings_categories WHERE name = 'general'), 'contact_email', 'Contact Email', 'Main contact email for the community', 'email', '"info@nelsontech.ca"', true, 4),
    ((SELECT id FROM public.settings_categories WHERE name = 'general'), 'timezone', 'Default Timezone', 'Default timezone for events and dates', 'string', '"America/Vancouver"', true, 5)
ON CONFLICT (setting_key) DO NOTHING;

-- Appearance Settings
INSERT INTO public.settings_definitions (category_id, setting_key, display_name, description, data_type, default_value, is_public, sort_order) VALUES
    ((SELECT id FROM public.settings_categories WHERE name = 'appearance'), 'primary_color', 'Primary Color', 'Main brand color', 'color', '"#3B82F6"', true, 1),
    ((SELECT id FROM public.settings_categories WHERE name = 'appearance'), 'secondary_color', 'Secondary Color', 'Secondary brand color', 'color', '"#6B7280"', true, 2),
    ((SELECT id FROM public.settings_categories WHERE name = 'appearance'), 'dark_mode_enabled', 'Enable Dark Mode', 'Allow users to switch to dark mode', 'boolean', 'true', true, 7)
ON CONFLICT (setting_key) DO NOTHING;

-- Feature Settings
INSERT INTO public.settings_definitions (category_id, setting_key, display_name, description, data_type, default_value, is_public, sort_order) VALUES
    ((SELECT id FROM public.settings_categories WHERE name = 'features'), 'enable_events', 'Enable Events', 'Show events functionality', 'boolean', 'true', true, 1),
    ((SELECT id FROM public.settings_categories WHERE name = 'features'), 'enable_marketplace', 'Enable Marketplace', 'Show marketplace functionality', 'boolean', 'true', true, 2),
    ((SELECT id FROM public.settings_categories WHERE name = 'features'), 'enable_directory', 'Enable Member Directory', 'Show member directory', 'boolean', 'true', true, 3),
    ((SELECT id FROM public.settings_categories WHERE name = 'features'), 'enable_gallery', 'Enable Photo Gallery', 'Show photo gallery functionality', 'boolean', 'true', true, 8)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================
-- DEFAULT FEATURE TOGGLES
-- =====================================

INSERT INTO public.feature_toggles (feature_key, display_name, description, is_enabled, rollout_percentage) VALUES
    ('advanced_search', 'Advanced Search', 'Enable advanced search functionality with filters', true, 100),
    ('enhanced_profiles', 'Enhanced User Profiles', 'Enable additional profile fields and customization', true, 75),
    ('social_login', 'Social Media Login', 'Enable login with social media accounts', true, 100),
    ('real_time_notifications', 'Real-time Notifications', 'Enable WebSocket-based real-time notifications', false, 25),
    ('ai_content_suggestions', 'AI Content Suggestions', 'Enable AI-powered content recommendations', false, 0)
ON CONFLICT (feature_key) DO NOTHING;

-- =====================================
-- DEFAULT SETTINGS VALUES
-- =====================================

-- Insert default values for all settings
INSERT INTO public.settings_values (setting_key, value, environment)
SELECT 
    setting_key,
    default_value,
    'production'
FROM public.settings_definitions
WHERE default_value IS NOT NULL
ON CONFLICT (setting_key, environment) DO NOTHING;

-- =====================================
-- DEFAULT COMMUNITY CONFIGURATION
-- =====================================

INSERT INTO public.community_configuration (
    community_name,
    theme_config,
    branding_config,
    feature_config,
    navigation_config,
    contact_config,
    social_config,
    seo_config
) VALUES (
    'Nelson Tech Community',
    '{
        "primaryColor": "#3B82F6",
        "secondaryColor": "#6B7280",
        "fontFamily": "Inter",
        "borderRadius": "0.5rem"
    }',
    '{
        "logoUrl": "/images/logo.png",
        "faviconUrl": "/favicon.ico",
        "brandName": "Nelson Tech"
    }',
    '{
        "enableEvents": true,
        "enableMarketplace": true,
        "enableDirectory": true,
        "enableNews": true,
        "enableGroups": true,
        "enableResources": true,
        "enableCompanies": true,
        "enableGallery": true
    }',
    '{
        "mainNavigation": [
            {"label": "Home", "path": "/", "icon": "Home"},
            {"label": "Events", "path": "/events", "icon": "Calendar"},
            {"label": "Directory", "path": "/directory", "icon": "Users"},
            {"label": "News", "path": "/news", "icon": "Newspaper"},
            {"label": "Groups", "path": "/groups", "icon": "Users"},
            {"label": "Resources", "path": "/resources", "icon": "BookOpen"},
            {"label": "Companies", "path": "/companies", "icon": "Building"},
            {"label": "Marketplace", "path": "/marketplace", "icon": "ShoppingBag"}
        ]
    }',
    '{
        "email": "info@nelsontech.ca",
        "phone": "+1 (250) 555-0123",
        "address": "Nelson, BC, Canada"
    }',
    '{
        "facebook": "https://facebook.com/nelsontech",
        "twitter": "https://twitter.com/nelsontech",
        "linkedin": "https://linkedin.com/company/nelsontech",
        "instagram": "https://instagram.com/nelsontech"
    }',
    '{
        "title": "Nelson Tech Community - Technology Innovation in the Kootenays",
        "description": "Join Nelson''s vibrant technology community. Connect with developers, entrepreneurs, and tech enthusiasts in beautiful British Columbia.",
        "keywords": "nelson tech, technology community, british columbia, kootenays, developers, entrepreneurs",
        "ogImage": "/images/og-image.jpg"
    }'
)
ON CONFLICT (community_name) DO NOTHING;