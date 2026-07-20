-- ============================================================================
-- Security hardening migration
-- ============================================================================
-- Addresses findings from the Supabase security advisor (2026-07):
--   * ERROR  rls_disabled_in_public        -> resource_photos
--   * ERROR  security_definer_view         -> 4 public views
--   * WARN   rls_policy_always_true         -> 7 *_tags management policies
--   * WARN   anon_security_definer_function_executable -> trigger fns + admin RPCs
--
-- Idempotent: safe to re-run. Uses DROP ... IF EXISTS / ALTER guards.
--
-- REVIEW BEFORE APPLYING TO PRODUCTION. Two areas change runtime behaviour and
-- should be smoke-tested (see NOTES at each section):
--   1. Flipping the 4 views to security_invoker (they now respect the caller's
--      RLS on the underlying tables).
--   2. Tag management is restricted to admins (see assumption in section 3).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ERROR: resource_photos is public but has RLS disabled
-- ----------------------------------------------------------------------------
-- Join table: resource_id -> resources(id), photo_id -> gallery_photos(id).
-- Policy mirrors the parent `resources` table: photos of a published resource
-- are publicly readable; authenticated users can read all and manage.
ALTER TABLE public.resource_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_read_published_resource_photos" ON public.resource_photos;
CREATE POLICY "public_can_read_published_resource_photos"
  ON public.resource_photos FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = resource_photos.resource_id
        AND r.status = 'published'
    )
  );

DROP POLICY IF EXISTS "authenticated_can_read_all_resource_photos" ON public.resource_photos;
CREATE POLICY "authenticated_can_read_all_resource_photos"
  ON public.resource_photos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated_can_manage_resource_photos" ON public.resource_photos;
CREATE POLICY "authenticated_can_manage_resource_photos"
  ON public.resource_photos FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 2. ERROR: SECURITY DEFINER views bypass the caller's RLS
-- ----------------------------------------------------------------------------
-- security_invoker = true makes each view run with the querying user's
-- permissions, so RLS on the underlying tables is enforced again.
-- NOTE: user_conversation_access is the important one — it exposes private
-- messaging membership. After this change it only returns rows the caller is
-- allowed to see via conversation_participants RLS. Smoke-test messaging,
-- news listing, public galleries and topic analytics after applying.
ALTER VIEW public.public_galleries        SET (security_invoker = true);
ALTER VIEW public.topic_analytics         SET (security_invoker = true);
ALTER VIEW public.user_conversation_access SET (security_invoker = true);
ALTER VIEW public.news_with_authors       SET (security_invoker = true);

-- ----------------------------------------------------------------------------
-- 3. WARN: *_tags management policies allow any authenticated user full access
-- ----------------------------------------------------------------------------
-- These are join tables (content_id, tag_id) with no owner column. The old
-- `authenticated_can_manage_*_tags` policy used USING (true) FOR ALL, letting
-- ANY signed-in user add/remove tags on ANYONE's content.
--
-- ASSUMPTION: tags are curated through the admin UI (topic/tag management),
-- not by end users on their own content. Management is therefore restricted to
-- admins; public read is preserved. If end users must manage tags on content
-- they own, replace these with an owner-join policy per content type instead.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'company_tags','event_tags','group_tags','marketplace_tags',
    'member_tags','news_tags','opportunity_tags'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
                   'authenticated_can_manage_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
                   'admins_can_manage_' || t, t);
    EXECUTE format($f$
      CREATE POLICY %I ON public.%I FOR ALL
        TO authenticated
        USING (public.is_admin_user(auth.uid()))
        WITH CHECK (public.is_admin_user(auth.uid()))
    $f$, 'admins_can_manage_' || t, t);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 4. WARN: trigger functions are exposed as callable RPCs to anon/authenticated
-- ----------------------------------------------------------------------------
-- These are invoked by table triggers, which fire regardless of EXECUTE grants.
-- They have no business being callable via PostgREST (/rest/v1/rpc/*), so revoke
-- EXECUTE from both public roles. Safe: triggers keep working.
DO $$
DECLARE
  f oid;
  fns text[] := ARRAY[
    'audit_menu_containers_changes','handle_group_creation','handle_new_user',
    'handle_new_user_profile','log_admin_action','on_auth_user_created_create_profile'
  ];
BEGIN
  FOR f IN
    SELECT p.oid FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace AND p.proname = ANY(fns)
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated', f::regprocedure);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 5. WARN: admin/authenticated-only SECURITY DEFINER RPCs callable by anon
-- ----------------------------------------------------------------------------
-- Remove these from the anonymous RPC surface. `authenticated` retains access
-- (the admin ones self-guard internally via is_admin checks); we only strip the
-- unauthenticated role. Deliberately NOT touched, because they are legitimately
-- public or used inside RLS policies:
--   get_public_settings, get_menu_tree, is_feature_enabled,
--   get_topic_content_counts, get_galleries_by_topic, get_topics_for_gallery,
--   is_admin*, is_group_admin, is_member_of_group, is_superadmin_direct,
--   check_is_admin, get_auth_member_id, get_current_member_id, generate_unique_slug
DO $$
DECLARE
  f oid;
  fns text[] := ARRAY[
    -- admin operations
    'bulk_manage_user_roles','manage_user_roles','change_member_role',
    'delete_menu_item_safely','duplicate_menu_item','move_menu_item',
    'reorder_menu_items','validate_menu_structure','update_setting_with_history',
    'get_admin_users','get_contact_submission_stats',
    -- authenticated-user operations (anon has no business calling these)
    'accept_invitation','create_member_profile','create_group_with_admin',
    'create_direct_conversation','get_or_create_direct_thread',
    'mark_conversation_as_read','get_unread_message_count',
    'update_conversation_title','check_conversation_participant',
    'join_group','leave_group'
  ];
BEGIN
  FOR f IN
    SELECT p.oid FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace AND p.proname = ANY(fns)
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', f::regprocedure);
  END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- NOT handled here (require dashboard/config changes or broader review):
--   * function_search_path_mutable (95 fns)  -> ALTER FUNCTION ... SET search_path
--   * public buckets group-images/theme-assets allow listing
--   * 8 tables with RLS enabled but no policy (deny-all; add policies if the
--     feature needs client access): company_galleries, event_attendees,
--     event_photos, event_resources, group_photos, newsletter_photo_features,
--     page_headers, photo_promotions
--   * Auth: enable leaked-password protection, add MFA options
--   * Upgrade Postgres to pick up security patches
-- ============================================================================
