-- Security hotfix: close privilege-escalation paths that any signed-up member
-- could use. Written to be idempotent and safe to run whatever state production
-- is in (DROP ... IF EXISTS / CREATE OR REPLACE), because the effective policy
-- set can't be fully reconstructed from migration history.

-- ---------------------------------------------------------------------------
-- Helper: is the caller a site admin? SECURITY DEFINER so it can be used inside
-- policies without RLS recursion on user_roles. New name to avoid colliding
-- with the overloaded is_admin_user() variants that exist in some environments.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin', 'super_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_site_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- 1. group_members: earlier migrations created an UPDATE policy with
--    USING (true) and an INSERT policy that didn't constrain role. Production
--    (checked 2026-11-08) only has a read policy, so the safe end state is
--    read-only for clients. Membership changes go through SECURITY DEFINER
--    functions (join_group, change_member_role, create_group_with_admin).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regprocedure('public.is_group_admin(uuid, uuid)') IS NULL THEN
    RAISE EXCEPTION 'public.is_group_admin(uuid, uuid) is missing; apply 20250821000000_fix_group_creator_admin.sql first';
  END IF;
  ALTER FUNCTION public.is_group_admin(uuid, uuid) SET search_path = public, pg_temp;
END $$;

-- Permissive policies are OR'd together, so a leftover policy under any other
-- name would bypass this. Drop every policy on the table and recreate the set.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'group_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_members_read_all"
  ON public.group_members
  FOR SELECT
  USING (true);
-- No INSERT/UPDATE/DELETE policies: clients can't write group_members directly.

-- ---------------------------------------------------------------------------
-- 2. join_group: callers could pass p_role => 'admin' and p_user_id => anyone.
--    The signature is kept for client compatibility; both arguments are now
--    ignored in favour of auth.uid() and 'member'.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  -- Remove any other overloads so only the hardened version is callable.
  FOR fn IN
    SELECT pg_get_function_identity_arguments(oid) AS args
    FROM pg_proc
    WHERE proname = 'join_group' AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.join_group(%s)', fn.args);
  END LOOP;
END $$;

CREATE FUNCTION public.join_group(
  p_group_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_role text DEFAULT 'member'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_member_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_user_id IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot add other users to a group';
  END IF;

  SELECT id INTO v_member_id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id
      AND status = 'published'
      AND visibility IN ('open', 'closed')
  ) THEN
    RAISE EXCEPTION 'Group not found or not joinable';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND member_id = v_member_id
  ) THEN
    RETURN true;
  END IF;

  INSERT INTO public.group_members (group_id, member_id, role, status, joined_at)
  VALUES (p_group_id, v_member_id, 'member', 'active', now());

  UPDATE public.groups
  SET member_count = (
    SELECT count(*) FROM public.group_members
    WHERE group_id = p_group_id AND status = 'active'
  )
  WHERE id = p_group_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.join_group(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group(uuid, uuid, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. grant_admin_role(uuid): SECURITY DEFINER, granted to authenticated, no
--    authorization check. Not called by the app. Drop every overload.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT pg_get_function_identity_arguments(oid) AS args
    FROM pg_proc
    WHERE proname = 'grant_admin_role' AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.grant_admin_role(%s)', fn.args);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. pages: any member could insert a published, featured page on the main
--    domain. Page management is admin-only ("Admins can manage all pages").
-- ---------------------------------------------------------------------------
-- Drafts were also readable by every signed-in member. Drop every policy and
-- recreate the intended pair.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.pages', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published pages"
  ON public.pages
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all pages"
  ON public.pages
  FOR ALL
  TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

-- ---------------------------------------------------------------------------
-- 5. menu_containers: FOR ALL USING (auth.role() = 'authenticated') let any
--    member rewrite site navigation. "Admin container management" remains.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage menu containers" ON public.menu_containers;
