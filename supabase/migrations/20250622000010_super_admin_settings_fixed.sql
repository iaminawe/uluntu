-- Super Admin Settings Migration - Fixed for Current Schema
-- Creates comprehensive settings system for platform customization
-- Compatible with existing user_roles system

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

-- Updated policy to work with existing user_roles system
CREATE POLICY "Super admins can manage all settings" ON public.application_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'superadmin'
        )
    );

-- RLS Policies for feature_toggles
CREATE POLICY "Authenticated users can read feature toggles" ON public.feature_toggles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Updated policy to work with existing user_roles system
CREATE POLICY "Super admins can manage feature toggles" ON public.feature_toggles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'superadmin'
        )
    );

CREATE POLICY "Admins can read feature toggles" ON public.feature_toggles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- RLS Policies for settings_history
CREATE POLICY "Admins can read settings history" ON public.settings_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "System can write settings history" ON public.settings_history
    FOR INSERT
    WITH CHECK (true);

-- Create helper functions for settings access

-- Function to get public settings
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE (
    category TEXT,
    setting_key TEXT,
    setting_value JSONB,
    data_type TEXT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        s.category,
        s.setting_key,
        s.setting_value,
        s.data_type
    FROM public.application_settings s
    WHERE s.is_public = true
    ORDER BY s.category, s.setting_key;
$$;

-- Function to check if feature is enabled for current user
CREATE OR REPLACE FUNCTION is_feature_enabled(feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    feature_record RECORD;
    user_id UUID;
    user_role TEXT;
BEGIN
    -- Get current user
    user_id := auth.uid();
    
    -- Get feature toggle
    SELECT * INTO feature_record
    FROM public.feature_toggles
    WHERE feature_key = feature_name;
    
    -- If feature doesn't exist, return false
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- If feature is disabled globally, return false
    IF NOT feature_record.enabled THEN
        RETURN false;
    END IF;
    
    -- If no user context (anonymous), only allow if rollout is 100%
    IF user_id IS NULL THEN
        RETURN feature_record.rollout_percentage >= 100;
    END IF;
    
    -- Check if user is specifically enabled
    IF user_id = ANY(feature_record.enabled_for_users) THEN
        RETURN true;
    END IF;
    
    -- Check user role
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_id = is_feature_enabled.user_id
    LIMIT 1;
    
    -- Check if user's role is enabled
    IF user_role IS NOT NULL AND user_role = ANY(feature_record.enabled_for_roles) THEN
        RETURN true;
    END IF;
    
    -- Check rollout percentage (simple random distribution)
    -- This is a basic implementation - production might use more sophisticated logic
    IF feature_record.rollout_percentage >= 100 THEN
        RETURN true;
    ELSIF feature_record.rollout_percentage <= 0 THEN
        RETURN false;
    ELSE
        -- Use user_id hash for consistent rollout
        RETURN (hashtext(user_id::text) % 100) < feature_record.rollout_percentage;
    END IF;
END;
$$;

-- Function to update settings with history tracking
CREATE OR REPLACE FUNCTION update_setting_with_history(
    p_category TEXT,
    p_setting_key TEXT,
    p_new_value JSONB,
    p_data_type TEXT DEFAULT 'string',
    p_is_public BOOLEAN DEFAULT false,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    setting_id UUID;
    old_value JSONB;
    user_id UUID;
BEGIN
    user_id := auth.uid();
    
    -- Get current value
    SELECT id, setting_value INTO setting_id, old_value
    FROM public.application_settings
    WHERE category = p_category AND setting_key = p_setting_key;
    
    -- Upsert setting
    INSERT INTO public.application_settings (
        category, setting_key, setting_value, data_type, is_public, description, updated_by
    )
    VALUES (
        p_category, p_setting_key, p_new_value, p_data_type, p_is_public, p_description, user_id
    )
    ON CONFLICT (category, setting_key)
    DO UPDATE SET
        setting_value = EXCLUDED.setting_value,
        data_type = EXCLUDED.data_type,
        is_public = EXCLUDED.is_public,
        description = EXCLUDED.description,
        updated_at = NOW(),
        updated_by = user_id
    RETURNING id INTO setting_id;
    
    -- Record history
    INSERT INTO public.settings_history (
        setting_id, category, setting_key, old_value, new_value, 
        change_type, changed_by, ip_address, user_agent
    )
    VALUES (
        setting_id, p_category, p_setting_key, old_value, p_new_value,
        CASE WHEN old_value IS NULL THEN 'created' ELSE 'updated' END,
        user_id, 
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
    
    RETURN setting_id;
END;
$$;

-- Create trigger function for automatic history tracking
CREATE OR REPLACE FUNCTION trigger_settings_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.settings_history (
            setting_id, category, setting_key, old_value, new_value,
            change_type, changed_by, ip_address
        )
        VALUES (
            OLD.id, OLD.category, OLD.setting_key, OLD.setting_value, NULL,
            'deleted', auth.uid(), inet_client_addr()
        );
        RETURN OLD;
    ELSE
        INSERT INTO public.settings_history (
            setting_id, category, setting_key, old_value, new_value,
            change_type, changed_by, ip_address
        )
        VALUES (
            NEW.id, NEW.category, NEW.setting_key, 
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.setting_value END,
            NEW.setting_value,
            CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
            auth.uid(), inet_client_addr()
        );
        RETURN NEW;
    END IF;
END;
$$;

-- Create triggers for automatic history tracking
CREATE TRIGGER settings_history_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.application_settings
    FOR EACH ROW EXECUTE FUNCTION trigger_settings_history();

CREATE TRIGGER feature_toggles_history_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.feature_toggles
    FOR EACH ROW EXECUTE FUNCTION trigger_settings_history();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.application_settings TO authenticated;
GRANT SELECT ON public.feature_toggles TO authenticated;
GRANT SELECT ON public.settings_history TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_public_settings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_feature_enabled(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_setting_with_history(TEXT, TEXT, JSONB, TEXT, BOOLEAN, TEXT) TO authenticated;