-- =====================================================
-- CREATE MISSING DATABASE TABLES AND FUNCTIONS
-- Run this to fix the 400 errors for missing tables/functions
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE GROUP_MEMBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'owner')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Indexes for group_members
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- Enable RLS on group_members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_members
DROP POLICY IF EXISTS "Allow users to read group memberships" ON group_members;
CREATE POLICY "Allow users to read group memberships" ON group_members
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to join groups" ON group_members;
CREATE POLICY "Allow authenticated users to join groups" ON group_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to leave groups or admins to manage" ON group_members;
CREATE POLICY "Allow users to leave groups or admins to manage" ON group_members
FOR DELETE USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'super_admin')
    )
);

-- =====================================================
-- CREATE USER_GALLERIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gallery_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('viewer', 'contributor', 'editor', 'admin', 'owner')),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, gallery_id)
);

-- Indexes for user_galleries
CREATE INDEX IF NOT EXISTS idx_user_galleries_user_id ON user_galleries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_galleries_gallery_id ON user_galleries(gallery_id);
CREATE INDEX IF NOT EXISTS idx_user_galleries_role ON user_galleries(role);

-- Enable RLS on user_galleries
ALTER TABLE user_galleries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_galleries
DROP POLICY IF EXISTS "Allow users to read their gallery access" ON user_galleries;
CREATE POLICY "Allow users to read their gallery access" ON user_galleries
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow gallery owners to manage access" ON user_galleries;
CREATE POLICY "Allow gallery owners to manage access" ON user_galleries
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_galleries ug 
        WHERE ug.gallery_id = user_galleries.gallery_id 
        AND ug.user_id = auth.uid() 
        AND ug.role = 'owner'
    )
    OR
    EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'super_admin')
    )
);

-- =====================================================
-- CREATE/FIX IS_FEATURE_ENABLED FUNCTION
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS is_feature_enabled(TEXT);
DROP FUNCTION IF EXISTS is_feature_enabled(TEXT, UUID);

-- Create the is_feature_enabled function with proper column references
CREATE OR REPLACE FUNCTION is_feature_enabled(feature_key_param TEXT, user_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    feature_record RECORD;
    user_has_role BOOLEAN := FALSE;
BEGIN
    -- Check if feature_toggles table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_toggles') THEN
        -- If feature_toggles table doesn't exist, return true (features enabled by default)
        RETURN TRUE;
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

    -- If no user_id provided, return the global enabled status
    IF user_id_param IS NULL THEN
        RETURN feature_record.enabled;
    END IF;

    -- Check if feature is enabled for specific users
    IF feature_record.enabled_for_users IS NOT NULL AND array_length(feature_record.enabled_for_users, 1) > 0 THEN
        IF user_id_param = ANY(feature_record.enabled_for_users) THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Check if feature is enabled for user's roles
    IF feature_record.enabled_for_roles IS NOT NULL AND array_length(feature_record.enabled_for_roles, 1) > 0 THEN
        SELECT EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = user_id_param 
            AND ur.role = ANY(feature_record.enabled_for_roles)
        ) INTO user_has_role;
        
        IF user_has_role THEN
            RETURN TRUE;
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
GRANT EXECUTE ON FUNCTION is_feature_enabled(TEXT) TO anon, authenticated;

-- Create overloaded version without user_id parameter
CREATE OR REPLACE FUNCTION is_feature_enabled(feature_key_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_feature_enabled(feature_key_param, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Enable RLS on feature_toggles (already done in previous script, but safe to repeat)
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE GROUPS TABLE IF IT DOESN'T EXIST
-- =====================================================

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    long_description TEXT,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'secret')),
    member_count INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    resource_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    hero_image VARCHAR(500),
    cover_image VARCHAR(500),
    featured BOOLEAN DEFAULT false,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for groups
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON groups(visibility);
CREATE INDEX IF NOT EXISTS idx_groups_featured ON groups(featured);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON groups(slug);

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

-- Add update triggers for new tables
CREATE TRIGGER update_group_members_updated_at
    BEFORE UPDATE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_galleries_updated_at
    BEFORE UPDATE ON user_galleries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_toggles_updated_at
    BEFORE UPDATE ON feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFY TABLES AND FUNCTIONS EXIST
-- =====================================================

-- Check that all tables exist
SELECT 
    'Tables created successfully:' as status,
    array_agg(table_name) as tables
FROM information_schema.tables 
WHERE table_name IN ('group_members', 'user_galleries', 'feature_toggles', 'groups')
AND table_schema = 'public';

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

COMMIT;