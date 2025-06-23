-- =====================================================
-- CREATE MISSING DATABASE FUNCTIONS (CORRECTED VERSION)
-- This version matches your existing schema structure
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE/FIX IS_FEATURE_ENABLED FUNCTION
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS is_feature_enabled(TEXT);
DROP FUNCTION IF EXISTS is_feature_enabled(TEXT, UUID);

-- Create the is_feature_enabled function with proper column references
-- Note: Your schema uses 'members' table, not auth.users
CREATE OR REPLACE FUNCTION is_feature_enabled(feature_key_param TEXT, member_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    feature_record RECORD;
    user_has_role BOOLEAN := FALSE;
    current_member_id UUID;
BEGIN
    -- Check if feature_toggles table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_toggles') THEN
        -- If feature_toggles table doesn't exist, return true (features enabled by default)
        RETURN TRUE;
    END IF;

    -- If no member_id provided, try to get current authenticated user's member id
    IF member_id_param IS NULL THEN
        -- Try to get member_id from auth.uid() if members table has user_id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'members' 
            AND column_name = 'user_id' 
            AND table_schema = 'public'
        ) THEN
            SELECT id INTO current_member_id 
            FROM members 
            WHERE user_id = auth.uid()
            LIMIT 1;
        ELSE
            -- If no user_id column, use auth.uid() directly as member_id
            current_member_id := auth.uid();
        END IF;
    ELSE
        current_member_id := member_id_param;
    END IF;

    -- Get the feature toggle record
    SELECT ft.enabled, ft.enabled_for_users, ft.enabled_for_roles
    INTO feature_record
    FROM feature_toggles ft
    WHERE ft.feature_key = feature_key_param;

    -- If feature doesn't exist, assume it's enabled
    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;

    -- If feature is globally disabled, return false
    IF NOT feature_record.enabled THEN
        RETURN FALSE;
    END IF;

    -- If no member_id available, return the global enabled status
    IF current_member_id IS NULL THEN
        RETURN feature_record.enabled;
    END IF;

    -- Check if feature is enabled for specific users
    IF feature_record.enabled_for_users IS NOT NULL AND array_length(feature_record.enabled_for_users, 1) > 0 THEN
        IF current_member_id = ANY(feature_record.enabled_for_users) THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Check if feature is enabled for user's roles
    -- Note: Check if user_roles table exists and has the right columns
    IF feature_record.enabled_for_roles IS NOT NULL AND array_length(feature_record.enabled_for_roles, 1) > 0 THEN
        -- Check if user_roles table exists
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
            -- Check what columns exist in user_roles
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'user_roles' 
                AND column_name = 'user_id' 
                AND table_schema = 'public'
            ) THEN
                -- user_roles has user_id column
                SELECT EXISTS (
                    SELECT 1 FROM user_roles ur 
                    WHERE ur.user_id = auth.uid()
                    AND ur.role = ANY(feature_record.enabled_for_roles)
                ) INTO user_has_role;
            ELSIF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'user_roles' 
                AND column_name = 'member_id' 
                AND table_schema = 'public'
            ) THEN
                -- user_roles has member_id column
                SELECT EXISTS (
                    SELECT 1 FROM user_roles ur 
                    WHERE ur.member_id = current_member_id
                    AND ur.role = ANY(feature_record.enabled_for_roles)
                ) INTO user_has_role;
            END IF;
            
            IF user_has_role THEN
                RETURN TRUE;
            END IF;
        END IF;
    END IF;

    -- If no specific user or role targeting, return global enabled status
    RETURN feature_record.enabled;
EXCEPTION
    WHEN OTHERS THEN
        -- On any error, return true (fail-safe)
        RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_feature_enabled(TEXT, UUID) TO anon, authenticated;

-- Create overloaded version without member_id parameter
CREATE OR REPLACE FUNCTION is_feature_enabled(feature_key_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_feature_enabled(feature_key_param, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_feature_enabled(TEXT) TO anon, authenticated;

-- =====================================================
-- CREATE FEATURE_TOGGLES TABLE IF IT DOESN'T EXIST
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

-- Insert default feature toggles if table is empty
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
ON CONFLICT (feature_key) DO NOTHING;

-- Enable RLS on feature_toggles
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feature_toggles (allow anonymous read)
DROP POLICY IF EXISTS "Allow anonymous read access to feature_toggles" ON feature_toggles;
CREATE POLICY "Allow anonymous read access to feature_toggles" ON feature_toggles
FOR SELECT USING (true);

-- =====================================================
-- CREATE UPDATE TRIGGERS
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
-- CREATE USER_ROLES TABLE IF IT DOESN'T EXIST
-- (Based on your schema, this might already exist)
-- =====================================================

-- Check if user_roles table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE user_roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            member_id UUID REFERENCES members(id) ON DELETE CASCADE,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, role)
        );

        -- Enable RLS
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Allow users to read own roles" ON user_roles
        FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Allow anonymous read roles for public queries" ON user_roles
        FOR SELECT USING (true);

        -- Create indexes
        CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
        CREATE INDEX idx_user_roles_member_id ON user_roles(member_id);
        CREATE INDEX idx_user_roles_role ON user_roles(role);

        -- Add trigger
        CREATE TRIGGER update_user_roles_updated_at
            BEFORE UPDATE ON user_roles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- VERIFY TABLES AND FUNCTIONS EXIST
-- =====================================================

-- Check that feature_toggles table exists
SELECT 
    'feature_toggles table status:' as status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_toggles')
        THEN 'EXISTS'
        ELSE 'MISSING'
    END as table_status;

-- Check that functions exist
SELECT 
    'Functions created successfully:' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'is_feature_enabled'
AND routine_schema = 'public';

-- Test the is_feature_enabled function
SELECT 
    'Testing is_feature_enabled function:' as status,
    is_feature_enabled('navigation_about') as about_enabled,
    is_feature_enabled('navigation_directory') as directory_enabled,
    is_feature_enabled('contact_form') as contact_enabled;

-- Show feature toggles
SELECT 
    'Current feature toggles:' as status,
    feature_key,
    enabled
FROM feature_toggles 
ORDER BY feature_key;

-- Check if user_roles table structure
SELECT 
    'user_roles table columns:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

COMMIT;