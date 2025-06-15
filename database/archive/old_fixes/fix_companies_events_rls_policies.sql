-- Fix RLS policies for companies and events tables
-- This resolves the 500 errors by adding public read access policies

-- First, check if RLS is enabled (it should be)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'events', 'groups');

-- COMPANIES TABLE POLICIES
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public can read published companies" ON public.companies;
DROP POLICY IF EXISTS "Public can read all companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update their companies" ON public.companies;

-- Create new policies for companies
-- 1. Public read access (for all companies since there's no status field)
CREATE POLICY "Public can read all companies"
  ON public.companies
  FOR SELECT
  USING (true);

-- 2. Authenticated users can create companies
CREATE POLICY "Authenticated users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. For now, only superadmins can update companies
-- (since company_members table doesn't exist yet)
CREATE POLICY "Superadmins can update companies"
  ON public.companies
  FOR UPDATE
  USING (public.is_superadmin(auth.uid()));

-- EVENTS TABLE POLICIES
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public can read published events" ON public.events;
DROP POLICY IF EXISTS "Public can read all events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event organizers can update their events" ON public.events;

-- Create new policies for events
-- 1. Public read access for published events
CREATE POLICY "Public can read published events"
  ON public.events
  FOR SELECT
  USING (status = 'published');

-- 2. Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Event organizers can update their events
CREATE POLICY "Event organizers can update their events"
  ON public.events
  FOR UPDATE
  USING (organizer_id = auth.uid());

-- 4. Event organizers can delete their events
CREATE POLICY "Event organizers can delete their events"
  ON public.events
  FOR DELETE
  USING (organizer_id = auth.uid());

-- GROUPS TABLE - Verify existing policies are working
-- Groups already has proper policies, but let's ensure they're active
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'groups'
ORDER BY policyname;

-- Test the policies
-- These queries should now work without errors:
/*
-- Test public read access
SELECT COUNT(*) FROM public.companies;
SELECT COUNT(*) FROM public.events WHERE status = 'published';
SELECT COUNT(*) FROM public.groups WHERE visibility IN ('open', 'closed') AND status = 'published';

-- Test authenticated user access (need to be logged in)
-- SELECT * FROM public.companies WHERE id IN (
--   SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
-- );
*/

-- Verify all policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('companies', 'events', 'groups')
ORDER BY tablename, policyname;