-- Regression checks for 20261119030000_member_photo_uploads_pending.sql.
--
-- Creates a gallery owner and a site admin, then checks that a member's
-- upload starts as pending whatever status they send, and stays hidden from
-- other visitors until an admin approves it, while an admin's upload is
-- still approved. Always rolls back. Raises on the first failed check. Run
-- against a database that has the migration applied, as a role that can
-- write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/member_photo_uploads_pending.sql
--   supabase db query --linked -f supabase/tests/member_photo_uploads_pending.sql

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
  u_admin uuid := gen_random_uuid();
  m_owner uuid;
  g uuid;
  p uuid;
  v_n int;
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'mp-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_admin, 'mp-test-admin@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Pending upload test ' || u FROM unnest(ARRAY[u_owner, u_admin]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;

  DELETE FROM public.user_roles WHERE user_id = u_admin;
  INSERT INTO public.user_roles (user_id, role) VALUES (u_admin, 'admin');

  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'mp-test', 'mp-test-' || m_owner, 'public', 'visible')
  RETURNING id INTO g;

  -- Member uploads ------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, moderation_status)
  VALUES (g, m_owner, 'a.jpg', 'a.jpg', 1, 'image/jpeg', 'mp-test/a', 'approved')
  RETURNING id INTO p;
  RESET ROLE;
  PERFORM pg_temp.check((SELECT moderation_status FROM public.gallery_photos WHERE id = p) = 'pending',
    'a member''s upload is pending even when they send approved');

  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.gallery_photos WHERE id = p;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon cannot see the pending upload');

  PERFORM pg_temp.act_as(u_owner);
  SELECT count(*) INTO v_n FROM public.gallery_photos WHERE id = p;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the owner still sees their pending upload');

  PERFORM pg_temp.act_as(u_admin);
  UPDATE public.gallery_photos SET moderation_status = 'approved' WHERE id = p;
  RESET ROLE;
  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.gallery_photos WHERE id = p;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'once an admin approves it, anon can see it');

  -- Admin uploads ---------------------------------------------------------------
  PERFORM pg_temp.act_as(u_admin);
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path)
  VALUES (g, m_owner, 'b.jpg', 'b.jpg', 1, 'image/jpeg', 'mp-test/b')
  RETURNING id INTO p;
  RESET ROLE;
  PERFORM pg_temp.check((SELECT moderation_status FROM public.gallery_photos WHERE id = p) = 'approved',
    'an admin''s upload is still approved');

  RAISE NOTICE 'member photo upload checks passed';
END $test$;

ROLLBACK;
