-- Contact Settings Migration
-- Adds comprehensive contact settings definitions to the settings system
-- Date: 2025-06-23
-- Version: 1.0.0

-- =====================================
-- 1. ADD CONTACT SETTINGS CATEGORY (if not exists)
-- =====================================

INSERT INTO public.settings_categories (name, display_name, description, icon_name, sort_order) VALUES
    ('contact', 'Contact Information', 'Contact details and communication settings', 'Phone', 10)
ON CONFLICT (name) DO NOTHING;

-- =====================================
-- 2. CONTACT SETTINGS DEFINITIONS
-- =====================================

-- Basic Contact Information
INSERT INTO public.settings_definitions (category_id, setting_key, display_name, description, data_type, default_value, is_public, is_required, sort_order, help_text) VALUES
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'contact_email', 'Primary Contact Email', 'Main contact email displayed on contact page', 'email', '"hello@nelsontech.community"', true, true, 1, 'This email will be displayed publicly on your contact page'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'support_email', 'Support Email', 'Email for technical support and help requests', 'email', '"hello@nelsontech.community"', true, false, 2, 'Used for support-related inquiries'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'privacy_email', 'Privacy Contact Email', 'Email for privacy-related inquiries', 'email', '"privacy@nelsontech.community"', true, false, 3, 'Used for privacy policy and data protection inquiries'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'contact_phone', 'Primary Phone Number', 'Main phone number for the organization', 'string', '"+1 (250) 555-0123"', true, false, 4, 'Include country code and format as desired'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'contact_address', 'Mailing Address', 'Primary mailing address', 'string', '"Nelson, British Columbia\nCanada"', true, false, 5, 'Full mailing address displayed on contact page'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'privacy_address', 'Privacy Officer Address', 'Address for privacy-related correspondence', 'string', '"Nelson Tech Community, Privacy Officer\nNelson, BC, Canada"', true, false, 6, 'Address displayed in privacy policy for data protection inquiries')
ON CONFLICT (setting_key) DO NOTHING;

-- Location and Organization Settings
INSERT INTO public.settings_definitions (category_id, setting_key, display_name, description, data_type, default_value, is_public, is_required, sort_order, help_text) VALUES
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'organization_name', 'Organization Name', 'Full name of the organization', 'string', '"Nelson Tech Community"', true, true, 10, 'Official name of your organization'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'organization_short_name', 'Short Organization Name', 'Abbreviated name or acronym', 'string', '"Nelson Tech"', true, false, 11, 'Short name used in branding and headers'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'location_name', 'Location Name', 'Name of primary location or venue', 'string', '"Nelson Innovation Centre"', true, false, 12, 'Primary meeting or office location'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'location_address', 'Location Address', 'Full address of primary location', 'string', '"Box 752 - 560 Baker Street\nNelson, BC V1L 4E5"', true, false, 13, 'Street address of your primary location'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'hosted_by_name', 'Hosted By Organization', 'Name of hosting organization', 'string', '"Kootenay Association for Science & Technology (KAST)"', true, false, 14, 'Organization that hosts or sponsors this community'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'hosted_by_url', 'Hosted By URL', 'Website URL of hosting organization', 'url', '"#"', true, false, 15, 'Link to hosting organization website'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'maps_embed_url', 'Google Maps Embed URL', 'Google Maps embed URL for location', 'url', '"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.3982126901476!2d-117.2931246!3d49.4938073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537cb6a0878e85b7%3A0xb2217c37b07c8c3a!2sNelson%20Innovation%20Centre!5e0!3m2!1sen!2sca!4v1696376047294!5m2!1sen!2sca"', true, false, 16, 'Embed URL from Google Maps for displaying location map')
ON CONFLICT (setting_key) DO NOTHING;

-- Response Time Settings
INSERT INTO public.settings_definitions (category_id, setting_key, display_name, description, data_type, default_value, is_public, is_required, sort_order, help_text) VALUES
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'response_time_general', 'General Inquiry Response Time', 'Expected response time for general inquiries', 'string', '"24-48 hours"', true, false, 20, 'Response time displayed for general inquiries'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'response_time_partnership', 'Partnership Response Time', 'Expected response time for partnership requests', 'string', '"3-5 business days"', true, false, 21, 'Response time displayed for partnership inquiries'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'response_time_support', 'Technical Support Response Time', 'Expected response time for technical support', 'string', '"12-24 hours"', true, false, 22, 'Response time displayed for technical support')
ON CONFLICT (setting_key) DO NOTHING;

-- Social Media Settings (if not already exist)
INSERT INTO public.settings_definitions (category_id, setting_key, display_name, description, data_type, default_value, is_public, is_required, sort_order, help_text) VALUES
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_facebook', 'Facebook URL', 'Facebook page or profile URL', 'url', '""', true, false, 30, 'Link to your Facebook page'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_twitter', 'Twitter/X URL', 'Twitter/X profile URL', 'url', '""', true, false, 31, 'Link to your Twitter/X profile'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_linkedin', 'LinkedIn URL', 'LinkedIn company or profile URL', 'url', '""', true, false, 32, 'Link to your LinkedIn page'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_instagram', 'Instagram URL', 'Instagram profile URL', 'url', '""', true, false, 33, 'Link to your Instagram profile'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_youtube', 'YouTube URL', 'YouTube channel URL', 'url', '""', true, false, 34, 'Link to your YouTube channel'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_github', 'GitHub URL', 'GitHub organization or profile URL', 'url', '""', true, false, 35, 'Link to your GitHub organization'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_discord', 'Discord URL', 'Discord server invite URL', 'url', '""', true, false, 36, 'Link to your Discord server'),
    ((SELECT id FROM public.settings_categories WHERE name = 'contact'), 'social_slack', 'Slack URL', 'Slack workspace URL', 'url', '""', true, false, 37, 'Link to your Slack workspace')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================
-- 3. INSERT DEFAULT VALUES
-- =====================================

-- Insert default values for all new contact settings
INSERT INTO public.settings_values (setting_key, value, environment)
SELECT 
    setting_key,
    default_value,
    'production'
FROM public.settings_definitions
WHERE category_id = (SELECT id FROM public.settings_categories WHERE name = 'contact')
AND default_value IS NOT NULL
ON CONFLICT (setting_key, environment) DO NOTHING;

-- =====================================
-- 4. UPDATE EXISTING COMMUNITY CONFIGURATION
-- =====================================

-- Update existing community configuration with enhanced contact info
UPDATE public.community_configuration 
SET contact_config = jsonb_build_object(
    'email', 'hello@nelsontech.community',
    'support_email', 'hello@nelsontech.community',
    'privacy_email', 'privacy@nelsontech.community',
    'phone', '+1 (250) 555-0123',
    'address', 'Nelson, British Columbia' || E'\n' || 'Canada',
    'privacy_address', 'Nelson Tech Community, Privacy Officer' || E'\n' || 'Nelson, BC, Canada',
    'organization_name', 'Nelson Tech Community',
    'organization_short_name', 'Nelson Tech',
    'location_name', 'Nelson Innovation Centre',
    'location_address', 'Box 752 - 560 Baker Street' || E'\n' || 'Nelson, BC V1L 4E5',
    'hosted_by_name', 'Kootenay Association for Science & Technology (KAST)',
    'hosted_by_url', '#',
    'maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.3982126901476!2d-117.2931246!3d49.4938073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537cb6a0878e85b7%3A0xb2217c37b07c8c3a!2sNelson%20Innovation%20Centre!5e0!3m2!1sen!2sca!4v1696376047294!5m2!1sen!2sca',
    'response_times', jsonb_build_object(
        'general', '24-48 hours',
        'partnership', '3-5 business days',
        'support', '12-24 hours'
    ),
    'social_links', jsonb_build_object(
        'facebook', '',
        'twitter', '',
        'linkedin', '',
        'instagram', '',
        'youtube', '',
        'github', '',
        'discord', '',
        'slack', ''
    )
)
WHERE community_name = 'Nelson Tech Community';

-- =====================================
-- 5. CREATE HELPER FUNCTIONS
-- =====================================

-- Function to get contact setting value with fallback
CREATE OR REPLACE FUNCTION public.get_contact_setting(setting_name TEXT, fallback_value TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT sv.value::text 
    INTO result
    FROM public.settings_values sv
    JOIN public.settings_definitions sd ON sd.setting_key = sv.setting_key
    WHERE sd.setting_key = setting_name
    AND sv.environment = 'production'
    AND sd.category_id = (SELECT id FROM public.settings_categories WHERE name = 'contact');
    
    -- Remove quotes if the value is a JSON string
    IF result IS NOT NULL AND result LIKE '"%"' THEN
        result := substring(result from 2 for length(result) - 2);
    END IF;
    
    RETURN COALESCE(result, fallback_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all contact settings as JSON
CREATE OR REPLACE FUNCTION public.get_all_contact_settings()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_object_agg(sd.setting_key, sv.value)
    INTO result
    FROM public.settings_values sv
    JOIN public.settings_definitions sd ON sd.setting_key = sv.setting_key
    WHERE sd.category_id = (SELECT id FROM public.settings_categories WHERE name = 'contact')
    AND sv.environment = 'production';
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_contact_setting(TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_all_contact_settings() TO authenticated, anon;

-- =====================================
-- MIGRATION COMPLETE
-- =====================================

-- Log migration completion
INSERT INTO public.settings_audit_log (
    table_name,
    record_id,
    operation,
    new_values,
    user_id,
    user_email
) VALUES (
    'settings_definitions',
    gen_random_uuid(),
    'INSERT',
    '{"migration": "contact_settings_definitions", "status": "completed", "date": "2025-06-23"}'::jsonb,
    NULL,
    'system-migration'
);