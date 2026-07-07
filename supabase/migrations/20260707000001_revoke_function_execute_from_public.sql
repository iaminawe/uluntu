-- ============================================================================
-- Security hardening (follow-up): revoke function EXECUTE from PUBLIC
-- ============================================================================
-- The previous migration (20260707000000) revoked EXECUTE from `anon`, but
-- Postgres grants EXECUTE to PUBLIC by default, and `anon` inherits from
-- PUBLIC — so the revoke was a no-op (proacl showed `=X/postgres`). The fix is
-- to revoke from PUBLIC and then grant EXECUTE back only to the roles that
-- should keep it.
--
-- Trigger functions: EXECUTE privilege is NOT checked when a trigger fires, so
-- revoking from PUBLIC removes them from the RPC surface without affecting
-- trigger behaviour.
--
-- Callable admin / authenticated-only RPCs: revoke PUBLIC (blocks anon), grant
-- authenticated + service_role. Admin RPCs still self-guard via is_admin.
--
-- Idempotent. Validated with a transaction rollback dry-run.
-- ============================================================================

BEGIN;

-- Trigger functions wrongly exposed as RPCs -> remove from PUBLIC entirely.
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
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f::regprocedure);
  END LOOP;
END $$;

-- Admin / authenticated-only RPCs -> block anon, keep authenticated + service_role.
DO $$
DECLARE
  f oid;
  fns text[] := ARRAY[
    -- admin operations (self-guard internally via is_admin)
    'bulk_manage_user_roles','manage_user_roles','change_member_role',
    'delete_menu_item_safely','duplicate_menu_item','move_menu_item',
    'reorder_menu_items','validate_menu_structure','update_setting_with_history',
    'get_admin_users','get_contact_submission_stats',
    -- authenticated-user operations
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
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f::regprocedure);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f::regprocedure);
  END LOOP;
END $$;

COMMIT;
