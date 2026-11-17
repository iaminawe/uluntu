-- Regression checks for 20261113000000_security_audit_fixes.sql.
--
-- Creates its own user, member and galleries, queries as anon and as an
-- ordinary signed-in member, and always rolls back. Raises on the first
-- failed check. Run against a database that has the migration applied, as a
-- role that can write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/security_audit_fixes.sql
--   supabase db query --linked -f supabase/tests/security_audit_fixes.sql

BEGIN;

CREATE FUNCTION pg_temp.act_as(p_user uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_user IS NULL THEN
    PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
    EXECUTE 'SET LOCAL ROLE anon';
  ELSE
    PERFORM set_config('request.jwt.claims',
      json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
  END IF;
END $$;

CREATE FUNCTION pg_temp.check(p_ok boolean, p_what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_ok IS NOT TRUE THEN
    RAISE EXCEPTION 'FAILED: %', p_what;
  END IF;
END $$;

DO $test$
DECLARE
  u_owner uuid := gen_random_uuid();
  u_other uuid := gen_random_uuid();
  m_owner uuid;
  g_public uuid;
  g_members uuid;
  g_private uuid;
  g_new uuid;
  v_n int;
  v_err text;
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'sa-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_other, 'sa-test-other@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Security test ' || u FROM unnest(ARRAY[u_owner, u_other]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;

  -- user_galleries.user_id is the owner's members.id, not their auth id.
  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'sa-test public', 'sa-test-public-' || m_owner, 'public', 'visible') RETURNING id INTO g_public;
  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'sa-test members', 'sa-test-members-' || m_owner, 'members_only', 'visible') RETURNING id INTO g_members;
  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'sa-test private', 'sa-test-private-' || m_owner, 'private', 'visible') RETURNING id INTO g_private;

  -- user_galleries as anon ----------------------------------------------------
  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.user_galleries WHERE privacy_level <> 'public';
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon sees no non-public galleries');

  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.user_galleries WHERE id = g_public;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'anon still sees public galleries');

  PERFORM pg_temp.act_as(NULL);
  BEGIN
    UPDATE public.user_galleries SET title = 'hijacked' WHERE id = g_public;
    GET DIAGNOSTICS v_n = ROW_COUNT;
  EXCEPTION WHEN insufficient_privilege THEN v_n := 0;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon cannot update a gallery');

  -- user_galleries as another member ------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  SELECT count(*) INTO v_n FROM public.user_galleries WHERE id IN (g_public, g_members);
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 2, 'a member sees public and members-only galleries');

  PERFORM pg_temp.act_as(u_other);
  SELECT count(*) INTO v_n FROM public.user_galleries WHERE id = g_private;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'a member cannot see someone else''s private gallery');

  PERFORM pg_temp.act_as(u_other);
  UPDATE public.user_galleries SET title = 'hijacked' WHERE id IN (g_public, g_members, g_private);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'a member cannot update someone else''s gallery');

  PERFORM pg_temp.act_as(u_other);
  DELETE FROM public.user_galleries WHERE id IN (g_public, g_members, g_private);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'a member cannot delete someone else''s gallery');

  -- user_galleries as the owner -----------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  UPDATE public.user_galleries SET title = 'sa-test renamed' WHERE id = g_private;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the owner can still update their private gallery');

  PERFORM pg_temp.act_as(u_owner);
  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'sa-test new', 'sa-test-new-' || m_owner, 'private', 'visible') RETURNING id INTO g_new;
  DELETE FROM public.user_galleries WHERE id = g_new;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the owner can create and delete their own gallery');

  PERFORM pg_temp.act_as(u_other);
  BEGIN
    INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
    VALUES (m_owner, 'sa-test forged', 'sa-test-forged-' || m_owner, 'public', 'visible');
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'a member cannot create a gallery for someone else');

  -- Revoked RPCs ----------------------------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  BEGIN
    PERFORM public.update_setting_with_history('security', 'sa_test', '"x"'::jsonb, NULL, false, NULL);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'a member cannot call update_setting_with_history');

  PERFORM pg_temp.act_as(u_other);
  BEGIN
    PERFORM public.move_menu_item(gen_random_uuid(), NULL, 0);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'a member cannot call move_menu_item');

  PERFORM pg_temp.check(
    NOT has_function_privilege('authenticated', 'public.delete_menu_item_safely(uuid)', 'EXECUTE')
    AND NOT has_function_privilege('authenticated', 'public.duplicate_menu_item(uuid,boolean,uuid,text)', 'EXECUTE')
    AND NOT has_function_privilege('authenticated', 'public.reorder_menu_items(uuid,jsonb,uuid)', 'EXECUTE')
    AND NOT has_function_privilege('authenticated', 'public.get_or_create_direct_thread(uuid,uuid)', 'EXECUTE')
    AND NOT has_function_privilege('anon', 'public.update_setting_with_history(text,text,jsonb,text,boolean,text)', 'EXECUTE'),
    'client roles have no EXECUTE on the revoked functions');

  RAISE NOTICE 'security audit checks passed';
END $test$;

ROLLBACK;
