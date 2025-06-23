-- =====================================================
-- SIMPLIFIED SUPABASE RLS POLICIES SETUP
-- Run this AFTER running the contact submissions migration
-- =====================================================

-- First, enable RLS on all tables (excluding contact_submissions which is handled in its migration)
ALTER TABLE IF EXISTS members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MEMBERS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to read all members" ON members;
DROP POLICY IF EXISTS "Allow users to update own profile" ON members;

-- Allow anonymous read access to published members
CREATE POLICY "Allow anonymous read access to members" ON members
FOR SELECT USING (status = 'published' OR status IS NULL);

-- Allow authenticated users to read all members
CREATE POLICY "Allow authenticated users to read all members" ON members
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON members
FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- NEWS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to news" ON news;
DROP POLICY IF EXISTS "Allow authenticated read all news" ON news;

-- Allow anonymous read access to published news
CREATE POLICY "Allow anonymous read access to news" ON news
FOR SELECT USING (status = 'published' OR status IS NULL);

-- Allow authenticated users to read all news
CREATE POLICY "Allow authenticated read all news" ON news
FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to events" ON events;
DROP POLICY IF EXISTS "Allow authenticated read all events" ON events;

-- Allow anonymous read access to published events
CREATE POLICY "Allow anonymous read access to events" ON events
FOR SELECT USING (status = 'published' OR status IS NULL);

-- Allow authenticated users to read all events
CREATE POLICY "Allow authenticated read all events" ON events
FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- GROUPS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to groups" ON groups;
DROP POLICY IF EXISTS "Allow authenticated read all groups" ON groups;

-- Allow anonymous read access to open/public groups
CREATE POLICY "Allow anonymous read access to groups" ON groups
FOR SELECT USING (visibility = 'open' OR visibility = 'public' OR visibility IS NULL);

-- Allow authenticated users to read all groups
CREATE POLICY "Allow authenticated read all groups" ON groups
FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- COMPANIES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated read all companies" ON companies;

-- Allow anonymous read access to published companies
CREATE POLICY "Allow anonymous read access to companies" ON companies
FOR SELECT USING (status = 'published' OR status IS NULL);

-- Allow authenticated users to read all companies
CREATE POLICY "Allow authenticated read all companies" ON companies
FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- OPPORTUNITIES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to opportunities" ON opportunities;
DROP POLICY IF EXISTS "Allow authenticated read all opportunities" ON opportunities;

-- Allow anonymous read access to published opportunities
CREATE POLICY "Allow anonymous read access to opportunities" ON opportunities
FOR SELECT USING (status = 'published' OR status IS NULL);

-- Allow authenticated users to read all opportunities
CREATE POLICY "Allow authenticated read all opportunities" ON opportunities
FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- FEATURE_TOGGLES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to feature_toggles" ON feature_toggles;
DROP POLICY IF EXISTS "Allow authenticated read feature_toggles" ON feature_toggles;

-- Allow anonymous read access to feature toggles
CREATE POLICY "Allow anonymous read access to feature_toggles" ON feature_toggles
FOR SELECT USING (true);

-- Allow authenticated read access to feature toggles
CREATE POLICY "Allow authenticated read feature_toggles" ON feature_toggles
FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- USER_ROLES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to read own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow anonymous read roles for public queries" ON user_roles;

-- Allow users to read their own roles
CREATE POLICY "Allow users to read own roles" ON user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Allow anonymous read for public role checks (needed for admin verification)
CREATE POLICY "Allow anonymous read roles for public queries" ON user_roles
FOR SELECT USING (true);

-- =====================================================
-- RESOURCES TABLE POLICIES (if table exists)
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resources') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow anonymous read access to resources" ON resources;
        
        -- Allow anonymous read access to published resources
        CREATE POLICY "Allow anonymous read access to resources" ON resources
        FOR SELECT USING (status = 'published' OR status IS NULL);
    END IF;
END $$;

-- =====================================================
-- GALLERIES TABLE POLICIES (if table exists)
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'galleries') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow anonymous read access to galleries" ON galleries;
        
        -- Allow anonymous read access to public galleries
        CREATE POLICY "Allow anonymous read access to galleries" ON galleries
        FOR SELECT USING (visibility = 'public' OR visibility IS NULL);
    END IF;
END $$;

-- =====================================================
-- PHOTOS TABLE POLICIES (if table exists)
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'photos') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow anonymous read access to photos" ON photos;
        
        -- Allow anonymous read access to photos in public galleries
        CREATE POLICY "Allow anonymous read access to photos" ON photos
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM galleries 
            WHERE galleries.id = photos.gallery_id 
            AND (galleries.visibility = 'public' OR galleries.visibility IS NULL)
          )
        );
    END IF;
END $$;

-- =====================================================
-- NEWSLETTER TABLES POLICIES (if tables exist)
-- =====================================================

-- Newsletter content cache
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'newsletter_content_cache') THEN
        DROP POLICY IF EXISTS "Allow anonymous read newsletter_content_cache" ON newsletter_content_cache;
        CREATE POLICY "Allow anonymous read newsletter_content_cache" ON newsletter_content_cache
        FOR SELECT USING (true);
    END IF;
END $$;

-- Newsletter campaigns  
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'newsletter_campaigns') THEN
        DROP POLICY IF EXISTS "Allow anonymous read newsletter_campaigns" ON newsletter_campaigns;
        CREATE POLICY "Allow anonymous read newsletter_campaigns" ON newsletter_campaigns
        FOR SELECT USING (status = 'published' OR status IS NULL);
    END IF;
END $$;

-- Newsletter subscriptions
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
        DROP POLICY IF EXISTS "Allow anonymous insert newsletter_subscriptions" ON newsletter_subscriptions;
        DROP POLICY IF EXISTS "Allow users read own newsletter_subscriptions" ON newsletter_subscriptions;

        CREATE POLICY "Allow anonymous insert newsletter_subscriptions" ON newsletter_subscriptions
        FOR INSERT WITH CHECK (true);

        CREATE POLICY "Allow users read own newsletter_subscriptions" ON newsletter_subscriptions
        FOR SELECT USING (auth.uid() = member_id OR email = auth.email());
    END IF;
END $$;

-- =====================================================
-- SETTINGS TABLE POLICIES (if table exists)
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'settings') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow anonymous read public settings" ON settings;
        
        -- Allow anonymous read access to public settings
        CREATE POLICY "Allow anonymous read public settings" ON settings
        FOR SELECT USING (is_public = true OR is_public IS NULL);
    END IF;
END $$;

-- =====================================================
-- HELPFUL FUNCTIONS FOR TESTING
-- =====================================================

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get public settings (if it doesn't exist)
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE(category TEXT, key TEXT, value TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.category, s.key, s.value
  FROM settings s
  WHERE s.is_public = true;
EXCEPTION
  WHEN undefined_table THEN
    -- If settings table doesn't exist, return empty result
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFY POLICIES WERE CREATED
-- =====================================================

-- Check that policies exist (this will show you what was created)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

COMMIT;