-- Fix Settings Triggers - Table-specific trigger functions
-- This migration fixes the trigger function error by creating separate triggers for each table

-- Drop existing triggers first
DROP TRIGGER IF EXISTS settings_history_trigger ON public.application_settings;
DROP TRIGGER IF EXISTS feature_toggles_history_trigger ON public.feature_toggles;

-- Drop the problematic function
DROP FUNCTION IF EXISTS trigger_settings_history();

-- Create trigger function specifically for application_settings
CREATE OR REPLACE FUNCTION trigger_application_settings_history()
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

-- Create trigger function specifically for feature_toggles
CREATE OR REPLACE FUNCTION trigger_feature_toggles_history()
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
            OLD.id, 'feature_toggles', OLD.feature_key, 
            jsonb_build_object(
                'enabled', OLD.enabled,
                'config', OLD.config,
                'rollout_percentage', OLD.rollout_percentage,
                'enabled_for_users', OLD.enabled_for_users,
                'enabled_for_roles', OLD.enabled_for_roles
            ), 
            NULL,
            'deleted', auth.uid(), inet_client_addr()
        );
        RETURN OLD;
    ELSE
        INSERT INTO public.settings_history (
            setting_id, category, setting_key, old_value, new_value,
            change_type, changed_by, ip_address
        )
        VALUES (
            NEW.id, 'feature_toggles', NEW.feature_key,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE 
                jsonb_build_object(
                    'enabled', OLD.enabled,
                    'config', OLD.config,
                    'rollout_percentage', OLD.rollout_percentage,
                    'enabled_for_users', OLD.enabled_for_users,
                    'enabled_for_roles', OLD.enabled_for_roles
                )
            END,
            jsonb_build_object(
                'enabled', NEW.enabled,
                'config', NEW.config,
                'rollout_percentage', NEW.rollout_percentage,
                'enabled_for_users', NEW.enabled_for_users,
                'enabled_for_roles', NEW.enabled_for_roles
            ),
            CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
            auth.uid(), inet_client_addr()
        );
        RETURN NEW;
    END IF;
END;
$$;

-- Create the corrected triggers
CREATE TRIGGER application_settings_history_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.application_settings
    FOR EACH ROW EXECUTE FUNCTION trigger_application_settings_history();

CREATE TRIGGER feature_toggles_history_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.feature_toggles
    FOR EACH ROW EXECUTE FUNCTION trigger_feature_toggles_history();