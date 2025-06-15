-- Comprehensive fix for all RLS policies to prevent infinite recursion
-- Run this after fix_user_roles_rls.sql

-- Update all tables that check for superadmin role
-- This replaces direct user_roles queries with the SECURITY DEFINER function

-- MEMBERS table
DROP POLICY IF EXISTS "Superadmins can manage all members" ON public.members;
CREATE POLICY "Superadmins can manage all members"
  ON public.members FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- MEMBER_SKILLS table
DROP POLICY IF EXISTS "Superadmins can manage all member skills" ON public.member_skills;
CREATE POLICY "Superadmins can manage all member skills"
  ON public.member_skills FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- COMPANIES table
DROP POLICY IF EXISTS "Superadmins can manage all companies" ON public.companies;
CREATE POLICY "Superadmins can manage all companies"
  ON public.companies FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- COMPANY_MEMBERS table
DROP POLICY IF EXISTS "Superadmins can manage all company members" ON public.company_members;
CREATE POLICY "Superadmins can manage all company members"
  ON public.company_members FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- EVENTS table
DROP POLICY IF EXISTS "Superadmins can manage all events" ON public.events;
CREATE POLICY "Superadmins can manage all events"
  ON public.events FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- EVENT_SESSIONS table
DROP POLICY IF EXISTS "Superadmins can manage all event sessions" ON public.event_sessions;
CREATE POLICY "Superadmins can manage all event sessions"
  ON public.event_sessions FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- EVENT_PRESENTERS table
DROP POLICY IF EXISTS "Superadmins can manage all event presenters" ON public.event_presenters;
CREATE POLICY "Superadmins can manage all event presenters"
  ON public.event_presenters FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- GROUPS table
DROP POLICY IF EXISTS "Superadmins can manage all groups" ON public.groups;
CREATE POLICY "Superadmins can manage all groups"
  ON public.groups FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- GROUP_MEMBERS table
DROP POLICY IF EXISTS "Superadmins can manage all group members" ON public.group_members;
CREATE POLICY "Superadmins can manage all group members"
  ON public.group_members FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- NEWS table
DROP POLICY IF EXISTS "Superadmins can manage all news" ON public.news;
CREATE POLICY "Superadmins can manage all news"
  ON public.news FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- NEWS_ASSOCIATIONS table
DROP POLICY IF EXISTS "Superadmins can manage all news associations" ON public.news_associations;
CREATE POLICY "Superadmins can manage all news associations"
  ON public.news_associations FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- RESOURCES table
DROP POLICY IF EXISTS "Superadmins can manage all resources" ON public.resources;
CREATE POLICY "Superadmins can manage all resources"
  ON public.resources FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- RESOURCE_TAGS table
DROP POLICY IF EXISTS "Superadmins can manage all resource tags" ON public.resource_tags;
CREATE POLICY "Superadmins can manage all resource tags"
  ON public.resource_tags FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Test the policies
-- These queries should now work without infinite recursion:
-- SELECT * FROM public.members LIMIT 10;
-- SELECT * FROM public.events LIMIT 10;
-- SELECT * FROM public.news LIMIT 10;
-- SELECT * FROM public.user_roles WHERE user_id = auth.uid();