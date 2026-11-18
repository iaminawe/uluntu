-- H3 from the 2026-11-12 Supabase security audit: signed-in users could read
-- every row, drafts and unpublished records included, on nine tables, and two
-- USING (true) policies let anonymous visitors read all companies and
-- resources. Drop those read-everything policies.
--
-- What each table keeps for SELECT afterwards:
--   everyone:  the published-row policies already in place
--   owners:    members (own profile), news (author), opportunities (poster),
--              marketplace_listings (seller) already have own-row policies;
--              events (organizer) and resources (contributor) get one here.
--              The resources one also lets INSERT ... RETURNING read back a
--              new row. companies has no owner column and no write policy
--              for client roles (only admins and the service role create or
--              edit companies), so unpublished companies are admin-only.
--   admins:    the existing "Superadmins can manage" policies only match the
--              'superadmin' role, so plain admins saw drafts only through the
--              read-all policies. Add an is_site_admin() read policy, except
--              on resources and resource_photos where admin policies exist.
--
-- Rows with a NULL status stay readable by anyone through the existing
-- "Allow anonymous read access" policies. Every status column has a non-NULL
-- default and no live row is NULL; tightening that is left for later.
-- Checks are in supabase/tests/read_all_policies.sql.

BEGIN;

DROP POLICY IF EXISTS "authenticated_can_read_all_members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated users to read all members" ON public.members;
DROP POLICY IF EXISTS "authenticated_users_can_read_all_companies" ON public.companies;
DROP POLICY IF EXISTS "Allow authenticated read all companies" ON public.companies;
DROP POLICY IF EXISTS "anyone_can_read_companies" ON public.companies;
DROP POLICY IF EXISTS "Allow authenticated read all events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated read all news" ON public.news;
DROP POLICY IF EXISTS "authenticated_can_read_all_news" ON public.news;
DROP POLICY IF EXISTS "Allow authenticated read all opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "authenticated_can_read_all_opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "authenticated_can_read_all_resources" ON public.resources;
DROP POLICY IF EXISTS "Public can view resources" ON public.resources;
DROP POLICY IF EXISTS "authenticated_can_read_all_listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "authenticated_can_read_all_resource_photos" ON public.resource_photos;
DROP POLICY IF EXISTS "authenticated_can_read_all_tags" ON public.tags;

DROP POLICY IF EXISTS "Organizers can read their own events" ON public.events;
CREATE POLICY "Organizers can read their own events" ON public.events
  FOR SELECT TO authenticated
  USING (organizer_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Contributors can read their own resources" ON public.resources;
CREATE POLICY "Contributors can read their own resources" ON public.resources
  FOR SELECT TO authenticated
  USING (contributor_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Site admins can read all members" ON public.members;
CREATE POLICY "Site admins can read all members" ON public.members
  FOR SELECT TO authenticated USING ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Site admins can read all companies" ON public.companies;
CREATE POLICY "Site admins can read all companies" ON public.companies
  FOR SELECT TO authenticated USING ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Site admins can read all events" ON public.events;
CREATE POLICY "Site admins can read all events" ON public.events
  FOR SELECT TO authenticated USING ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Site admins can read all news" ON public.news;
CREATE POLICY "Site admins can read all news" ON public.news
  FOR SELECT TO authenticated USING ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Site admins can read all opportunities" ON public.opportunities;
CREATE POLICY "Site admins can read all opportunities" ON public.opportunities
  FOR SELECT TO authenticated USING ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Site admins can read all marketplace listings" ON public.marketplace_listings;
CREATE POLICY "Site admins can read all marketplace listings" ON public.marketplace_listings
  FOR SELECT TO authenticated USING ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Site admins can read all tags" ON public.tags;
CREATE POLICY "Site admins can read all tags" ON public.tags
  FOR SELECT TO authenticated USING ((select public.is_site_admin()));

COMMIT;
