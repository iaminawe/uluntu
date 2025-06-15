-- Fix RLS policies for admin area access
-- This adds policies that allow authenticated users (especially admins) to see all entities

-- COMPANIES TABLE - Add admin access
CREATE POLICY "authenticated_users_can_read_all_companies"
    ON public.companies
    FOR SELECT
    TO authenticated
    USING (true);

-- EVENTS TABLE - Add admin access
CREATE POLICY "authenticated_users_can_read_all_events"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (true);

-- GROUPS TABLE - Fix the recursion issue and add admin access
-- First drop the problematic policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT polname 
        FROM pg_policy p
        JOIN pg_class c ON c.oid = p.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'groups'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.groups', pol.polname);
    END LOOP;
END $$;

-- Create new policies for groups
-- 1. Public can see published open/closed groups
CREATE POLICY "public_can_read_published_groups"
    ON public.groups
    FOR SELECT
    TO anon
    USING (
        status = 'published' 
        AND visibility IN ('open', 'closed')
    );

-- 2. Authenticated users can see ALL groups (for admin area)
CREATE POLICY "authenticated_can_read_all_groups"
    ON public.groups
    FOR SELECT
    TO authenticated
    USING (true);

-- MEMBERS TABLE - Add policies if missing
CREATE POLICY IF NOT EXISTS "public_can_read_published_members"
    ON public.members
    FOR SELECT
    TO anon
    USING (status = 'published');

CREATE POLICY IF NOT EXISTS "authenticated_can_read_all_members"
    ON public.members
    FOR SELECT
    TO authenticated
    USING (true);

-- NEWS TABLE - Add policies if missing
CREATE POLICY IF NOT EXISTS "public_can_read_published_news"
    ON public.news
    FOR SELECT
    TO anon
    USING (status = 'published');

CREATE POLICY IF NOT EXISTS "authenticated_can_read_all_news"
    ON public.news
    FOR SELECT
    TO authenticated
    USING (true);

-- RESOURCES TABLE - Add policies if missing
CREATE POLICY IF NOT EXISTS "public_can_read_published_resources"
    ON public.resources
    FOR SELECT
    TO anon
    USING (status = 'published');

CREATE POLICY IF NOT EXISTS "authenticated_can_read_all_resources"
    ON public.resources
    FOR SELECT
    TO authenticated
    USING (true);

-- OPPORTUNITIES TABLE - Add policies if missing
CREATE POLICY IF NOT EXISTS "public_can_read_active_opportunities"
    ON public.opportunities
    FOR SELECT
    TO anon
    USING (status = 'active');

CREATE POLICY IF NOT EXISTS "authenticated_can_read_all_opportunities"
    ON public.opportunities
    FOR SELECT
    TO authenticated
    USING (true);

-- MARKETPLACE_LISTINGS TABLE - Add policies if missing
CREATE POLICY IF NOT EXISTS "public_can_read_published_listings"
    ON public.marketplace_listings
    FOR SELECT
    TO anon
    USING (status = 'published');

CREATE POLICY IF NOT EXISTS "authenticated_can_read_all_listings"
    ON public.marketplace_listings
    FOR SELECT
    TO authenticated
    USING (true);

-- Verify all policies are in place
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    CASE 
        WHEN roles = '{anon}' THEN 'Public access'
        WHEN roles = '{authenticated}' THEN 'Authenticated users'
        ELSE roles::text
    END as access_level
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('companies', 'events', 'groups', 'members', 'news', 'resources', 'opportunities', 'marketplace_listings')
ORDER BY tablename, access_level, policyname;