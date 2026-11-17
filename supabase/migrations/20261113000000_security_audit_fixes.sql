-- Fixes from the 2026-11-12 Supabase security audit (the Critical and High
-- items that are SQL; the auth URL settings are changed in the dashboard).
--
-- user_galleries: the policy "Users can access their gallery relationships"
--   was FOR ALL TO public USING (true), so anyone with the anon key could
--   read, update or delete any gallery. Replace it with what it was standing
--   in for: site admins manage everything, signed-in members read
--   members_only galleries, and anyone keeps "Public can view public
--   galleries". user_id references members(id), but the owner policies
--   compared it with auth.uid(), so they never matched and owners only got
--   in through the open policy. They now compare with the caller's member id.
--
-- update_setting_with_history and the menu RPCs: SECURITY DEFINER with no
--   caller check, executable by any signed-in user. Nothing in src/ or api/
--   calls them (the admin screens write the tables under admin RLS), so
--   revoke EXECUTE from the client roles. get_or_create_direct_thread refers
--   to tables that no longer exist; revoke it the same way.

BEGIN;

DROP POLICY IF EXISTS "Users can access their gallery relationships" ON public.user_galleries;

DROP POLICY IF EXISTS "Site admins can manage all galleries" ON public.user_galleries;
CREATE POLICY "Site admins can manage all galleries" ON public.user_galleries
  FOR ALL TO authenticated
  USING ((select public.is_site_admin()))
  WITH CHECK ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Members can view members-only galleries" ON public.user_galleries;
CREATE POLICY "Members can view members-only galleries" ON public.user_galleries
  FOR SELECT TO authenticated
  USING (privacy_level = 'members_only' AND visibility = 'visible');

DROP POLICY IF EXISTS "Users can view their own galleries" ON public.user_galleries;
CREATE POLICY "Users can view their own galleries" ON public.user_galleries
  FOR SELECT TO authenticated
  USING (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Users can create their own galleries" ON public.user_galleries;
CREATE POLICY "Users can create their own galleries" ON public.user_galleries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Users can update their own galleries" ON public.user_galleries;
CREATE POLICY "Users can update their own galleries" ON public.user_galleries
  FOR UPDATE TO authenticated
  USING (user_id = (select public.get_current_member_id()))
  WITH CHECK (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Users can delete their own galleries" ON public.user_galleries;
CREATE POLICY "Users can delete their own galleries" ON public.user_galleries
  FOR DELETE TO authenticated
  USING (user_id = (select public.get_current_member_id()));

REVOKE EXECUTE ON FUNCTION public.update_setting_with_history(text, text, jsonb, text, boolean, text)
  FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.delete_menu_item_safely(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.duplicate_menu_item(uuid, boolean, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_menu_item(uuid, uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reorder_menu_items(uuid, jsonb, uuid) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_or_create_direct_thread(uuid, uuid) FROM PUBLIC, anon, authenticated;

COMMIT;
