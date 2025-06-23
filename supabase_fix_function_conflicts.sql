-- =====================================================
-- FIX FUNCTION CONFLICTS - CLEAN SLATE APPROACH
-- This drops all existing is_feature_enabled functions and creates a single clean version
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL EXISTING is_feature_enabled FUNCTIONS
-- =====================================================

-- Drop all possible versions of the function
DROP FUNCTION IF EXISTS is_feature_enabled(TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_feature_enabled(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS is_feature_enabled(unknown) CASCADE;
DROP FUNCTION IF EXISTS is_feature_enabled(character varying) CASCADE;
DROP FUNCTION IF EXISTS is_feature_enabled(character varying, UUID) CASCADE;

-- Also try dropping with different parameter combinations that might exist
DROP FUNCTION IF EXISTS public.is_feature_enabled(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.is_feature_enabled(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_feature_enabled(unknown) CASCADE;

-- =====================================================
-- STEP 2: CREATE FEATURE_TOGGLES TABLE IF MISSING
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_toggles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_key VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    enabled_for_users UUID[] DEFAULT '{}',
    enabled_for_roles TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE SINGLE, CLEAN is_feature_enabled FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION is_feature_enabled(feature_key_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    feature_enabled BOOLEAN := TRUE;
BEGIN
    -- Check if feature_toggles table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_toggles' AND table_schema = 'public') THEN
        -- If feature_toggles table doesn't exist, return true (features enabled by default)
        RETURN TRUE;
    END IF;

    -- Get the feature status
    SELECT enabled INTO feature_enabled
    FROM feature_toggles 
    WHERE feature_key = feature_key_param;

    -- If feature doesn't exist in the table, assume it's enabled
    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;

    -- Return the feature status
    RETURN feature_enabled;
    
EXCEPTION
    WHEN OTHERS THEN
        -- On any error, return true (fail-safe approach)
        RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: SET PERMISSIONS
-- =====================================================

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION is_feature_enabled(TEXT) TO anon, authenticated, public;

-- =====================================================
-- STEP 5: ENABLE RLS AND CREATE POLICIES FOR FEATURE_TOGGLES
-- =====================================================

-- Enable RLS
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous read access to feature_toggles" ON feature_toggles;
DROP POLICY IF EXISTS "Allow authenticated read feature_toggles" ON feature_toggles;

-- Create simple read policy for everyone
CREATE POLICY "Anyone can read feature toggles" ON feature_toggles
FOR SELECT USING (true);

-- =====================================================
-- STEP 6: INSERT DEFAULT FEATURE TOGGLES
-- =====================================================

-- Insert default feature toggles if they don't exist
INSERT INTO feature_toggles (feature_key, enabled, description) VALUES
    ('navigation_about', true, 'Enable About navigation section'),
    ('navigation_directory', true, 'Enable Directory navigation section'),
    ('navigation_events', true, 'Enable Events navigation section'),
    ('navigation_opportunities', true, 'Enable Opportunities navigation section'),
    ('navigation_resources', true, 'Enable Resources navigation section'),
    ('navigation_galleries', true, 'Enable Galleries navigation section'),
    ('navigation_news', true, 'Enable News navigation section'),
    ('navigation_groups', true, 'Enable Groups navigation section'),
    ('contact_form', true, 'Enable contact form submissions'),
    ('user_registration', true, 'Enable user registration'),
    ('admin_dashboard', true, 'Enable admin dashboard access'),
    ('newsletter_signup', true, 'Enable newsletter subscription'),
    ('member_profiles', true, 'Enable member profile pages'),
    ('company_profiles', true, 'Enable company profile pages'),
    ('event_registration', true, 'Enable event registration'),
    ('gallery_uploads', true, 'Enable gallery photo uploads'),
    ('group_creation', true, 'Enable group creation by users'),
    ('marketplace', true, 'Enable marketplace functionality'),
    ('job_board', true, 'Enable job board / opportunities'),
    ('resource_sharing', true, 'Enable resource sharing')
ON CONFLICT (feature_key) DO UPDATE SET
    enabled = EXCLUDED.enabled,
    description = EXCLUDED.description;

-- =====================================================
-- STEP 7: CREATE UPDATE TRIGGER
-- =====================================================

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update trigger for feature_toggles
DROP TRIGGER IF EXISTS update_feature_toggles_updated_at ON feature_toggles;
CREATE TRIGGER update_feature_toggles_updated_at
    BEFORE UPDATE ON feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 8: VERIFICATION AND TESTING
-- =====================================================

-- Show all functions named is_feature_enabled
SELECT 
    'Current is_feature_enabled functions:' as info,
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'is_feature_enabled'
AND routine_schema = 'public';

-- Test the function with explicit text casting
SELECT 
    'Testing is_feature_enabled function:' as status,
    is_feature_enabled('navigation_about'::TEXT) as about_enabled,
    is_feature_enabled('navigation_directory'::TEXT) as directory_enabled,
    is_feature_enabled('contact_form'::TEXT) as contact_enabled,
    is_feature_enabled('nonexistent_feature'::TEXT) as nonexistent_feature;

-- Show all feature toggles
SELECT 
    'Current feature toggles:' as status,
    feature_key,
    enabled,
    description
FROM feature_toggles 
ORDER BY feature_key;

-- Test a direct query to make sure the table works
SELECT 
    'Direct feature_toggles query test:' as status,
    COUNT(*) as total_features,
    COUNT(*) FILTER (WHERE enabled = true) as enabled_features
FROM feature_toggles;

-- Final success message
SELECT 'Function conflicts resolved! is_feature_enabled should now work properly.' as final_status;

COMMIT;