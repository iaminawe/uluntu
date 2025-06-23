-- Super Admin Settings Migration
-- Creates comprehensive settings system for platform customization

-- Create application_settings table for global platform settings
CREATE TABLE IF NOT EXISTS public.application_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL DEFAULT '{}',
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'object', 'array')),
    is_public BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(category, setting_key)
);

-- Create feature_toggles table for feature management
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
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create settings_history table for audit trail
CREATE TABLE IF NOT EXISTS public.settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID,
    category TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type TEXT CHECK (change_type IN ('created', 'updated', 'deleted')),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_application_settings_category ON public.application_settings(category);
CREATE INDEX IF NOT EXISTS idx_application_settings_key ON public.application_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_application_settings_public ON public.application_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON public.feature_toggles(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_key ON public.feature_toggles(feature_key);
CREATE INDEX IF NOT EXISTS idx_settings_history_setting ON public.settings_history(category, setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_history_date ON public.settings_history(changed_at);

-- Enable RLS on all tables
ALTER TABLE public.application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_settings
CREATE POLICY "Public settings are readable by all" ON public.application_settings
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Authenticated users can read non-system settings" ON public.application_settings
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND (is_public = true OR is_system = false)
    );

CREATE POLICY "Super admins can manage all settings" ON public.application_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'superadmin'
        )
    );

-- RLS Policies for feature_toggles
CREATE POLICY "Authenticated users can read feature toggles" ON public.feature_toggles
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage feature toggles" ON public.feature_toggles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'superadmin'
        )
    );

-- RLS Policies for settings_history
CREATE POLICY "Admins can read settings history" ON public.settings_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('superadmin', 'admin')
        )
    );

-- Create trigger function for settings history
CREATE OR REPLACE FUNCTION public.log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.settings_history (
        setting_id,
        category,
        setting_key,
        old_value,
        new_value,
        change_type,
        changed_by,
        ip_address,
        user_agent
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.category, OLD.category),
        COALESCE(NEW.setting_key, OLD.setting_key),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE OLD.setting_value END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE NEW.setting_value END,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        auth.uid(),
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER settings_history_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.application_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_settings_change();

CREATE TRIGGER feature_toggles_history_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_settings_change();

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_application_settings_updated_at
    BEFORE UPDATE ON public.application_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_toggles_updated_at
    BEFORE UPDATE ON public.feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default application settings
INSERT INTO public.application_settings (category, setting_key, setting_value, data_type, is_public, description) VALUES
    -- Site Configuration
    ('site', 'title', '"Community Platform"', 'string', true, 'Main site title displayed in header and browser tab'),
    ('site', 'description', '"A vibrant community platform for connecting professionals"', 'string', true, 'Site description for SEO and meta tags'),
    ('site', 'logo_url', '"/images/logo.png"', 'string', true, 'URL to site logo image'),
    ('site', 'favicon_url', '"/favicon.ico"', 'string', true, 'URL to site favicon'),
    ('site', 'primary_color', '"#3B82F6"', 'string', true, 'Primary brand color (hex code)'),
    ('site', 'secondary_color', '"#64748B"', 'string', true, 'Secondary brand color (hex code)'),
    
    -- Header Configuration
    ('header', 'show_logo', 'true', 'boolean', true, 'Show logo in header'),
    ('header', 'show_search', 'true', 'boolean', true, 'Show search bar in header'),
    ('header', 'custom_hero_image', '""', 'string', true, 'Custom hero image URL'),
    ('header', 'hero_title', '"Welcome to Our Community"', 'string', true, 'Hero section title'),
    ('header', 'hero_subtitle', '"Connect, collaborate, and grow together"', 'string', true, 'Hero section subtitle'),
    
    -- Navigation Configuration
    ('navigation', 'show_directory', 'true', 'boolean', true, 'Show directory in navigation'),
    ('navigation', 'show_companies', 'true', 'boolean', true, 'Show companies in navigation'),
    ('navigation', 'show_events', 'true', 'boolean', true, 'Show events in navigation'),
    ('navigation', 'show_groups', 'true', 'boolean', true, 'Show groups in navigation'),
    ('navigation', 'show_resources', 'true', 'boolean', true, 'Show resources in navigation'),
    ('navigation', 'show_marketplace', 'true', 'boolean', true, 'Show marketplace in navigation'),
    ('navigation', 'show_opportunities', 'true', 'boolean', true, 'Show opportunities in navigation'),
    ('navigation', 'show_news', 'true', 'boolean', true, 'Show news in navigation'),
    
    -- Community Configuration
    ('community', 'registration_open', 'true', 'boolean', false, 'Allow new user registration'),
    ('community', 'require_approval', 'false', 'boolean', false, 'Require admin approval for new members'),
    ('community', 'default_member_role', '"member"', 'string', false, 'Default role assigned to new members'),
    ('community', 'max_members', 'null', 'number', false, 'Maximum number of members (null for unlimited)'),
    
    -- Location Configuration
    ('location', 'default_city', '"Your City"', 'string', true, 'Default city name'),
    ('location', 'default_region', '"Your Region"', 'string', true, 'Default region/state'),
    ('location', 'default_country', '"Your Country"', 'string', true, 'Default country'),
    ('location', 'coverage_areas', '["Local", "Regional", "National"]', 'array', true, 'Areas of coverage/service'),
    
    -- Contact Information
    ('contact', 'email', '"info@community.com"', 'string', true, 'Primary contact email'),
    ('contact', 'phone', '""', 'string', true, 'Primary contact phone number'),
    ('contact', 'address', '""', 'string', true, 'Physical address'),
    ('contact', 'social_links', '{}', 'object', true, 'Social media links object'),
    
    -- Feature Limits
    ('limits', 'max_groups_per_user', '10', 'number', false, 'Maximum groups a user can create'),
    ('limits', 'max_events_per_user', '20', 'number', false, 'Maximum events a user can create'),
    ('limits', 'max_resources_per_user', '50', 'number', false, 'Maximum resources a user can create'),
    ('limits', 'max_marketplace_items_per_user', '25', 'number', false, 'Maximum marketplace items per user')
ON CONFLICT (category, setting_key) DO NOTHING;

-- Insert default feature toggles
INSERT INTO public.feature_toggles (feature_key, enabled, description) VALUES
    ('directory', true, 'Member directory feature'),
    ('companies', true, 'Companies listing feature'),
    ('events', true, 'Events management feature'),
    ('groups', true, 'Groups/communities feature'),
    ('resources', true, 'Resources sharing feature'),
    ('marketplace', true, 'Marketplace feature'),
    ('opportunities', true, 'Job opportunities feature'),
    ('news', true, 'News/blog feature'),
    ('gallery', true, 'Photo gallery feature'),
    ('newsletter', true, 'Newsletter system'),
    ('analytics', false, 'Advanced analytics dashboard'),
    ('api_access', false, 'Public API access'),
    ('advanced_search', true, 'Advanced search functionality'),
    ('real_time_notifications', true, 'Real-time notifications'),
    ('user_profiles', true, 'Extended user profiles'),
    ('social_features', true, 'Social interaction features'),
    ('content_moderation', true, 'Content moderation system'),
    ('mobile_app', false, 'Mobile app integration'),
    ('sso_integration', false, 'Single sign-on integration'),
    ('custom_themes', false, 'Custom theme support')
ON CONFLICT (feature_key) DO NOTHING;

-- Create function to get public settings for frontend
CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS TABLE (
    category TEXT,
    setting_key TEXT,
    setting_value JSONB,
    data_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.category,
        s.setting_key,
        s.setting_value,
        s.data_type
    FROM public.application_settings s
    WHERE s.is_public = true
    ORDER BY s.category, s.setting_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check feature toggles
CREATE OR REPLACE FUNCTION public.is_feature_enabled(feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    feature_enabled BOOLEAN := false;
    user_id UUID := auth.uid();
    user_roles TEXT[];
BEGIN
    -- Get feature toggle info
    SELECT enabled, enabled_for_users, enabled_for_roles
    INTO feature_enabled, user_roles
    FROM public.feature_toggles
    WHERE feature_key = feature_name;
    
    -- If feature doesn't exist, return false
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- If globally enabled, return true
    IF feature_enabled THEN
        RETURN true;
    END IF;
    
    -- Check if user is specifically enabled
    IF user_id = ANY(enabled_for_users) THEN
        RETURN true;
    END IF;
    
    -- Check if user has enabled role
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_id
        AND r.name = ANY(user_roles)
    ) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.application_settings TO authenticated;
GRANT SELECT ON public.feature_toggles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_settings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_feature_enabled(TEXT) TO anon, authenticated;