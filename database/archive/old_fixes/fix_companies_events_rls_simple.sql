-- Simple RLS policies for companies and events tables
-- This version doesn't rely on any functions or complex joins

-- COMPANIES TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Public can read published companies" ON public.companies;
DROP POLICY IF EXISTS "Public can read all companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Superadmins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Superadmins can manage all companies" ON public.companies;

-- Create simple policies for companies
-- 1. Everyone can read all companies
CREATE POLICY "Public can read all companies"
  ON public.companies
  FOR SELECT
  USING (true);

-- 2. Authenticated users can create companies
CREATE POLICY "Authenticated users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Users can update companies they created (assuming there's a created_by field)
-- If no created_by field exists, comment this out
/*
CREATE POLICY "Users can update their own companies"
  ON public.companies
  FOR UPDATE
  USING (created_by = auth.uid());
*/

-- EVENTS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Public can read published events" ON public.events;
DROP POLICY IF EXISTS "Public can read all events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event organizers can update their events" ON public.events;
DROP POLICY IF EXISTS "Event organizers can delete their events" ON public.events;
DROP POLICY IF EXISTS "Superadmins can manage all events" ON public.events;

-- Create simple policies for events
-- 1. Everyone can read published events
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

-- Verify the policies are created
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename IN ('companies', 'events')
ORDER BY tablename, policyname;