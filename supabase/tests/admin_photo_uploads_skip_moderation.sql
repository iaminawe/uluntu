-- Regression checks for 20261119020000_admin_photo_uploads_skip_moderation.sql.
--
-- Creates a gallery owner and a site admin, then checks that a photo the
-- admin uploads into the owner's gallery is approved and recorded as reviewed
-- by the admin, that an explicit status from the admin is kept, and that the
-- owner's own uploads still start as pending. Always rolls back. Raises on
-- the first failed check. Run against a database that has the migration
-- applied, as a role that can write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/admin_photo_uploads_skip_moderation.sql
--   supabase db query --linked -f supabase/tests/admin_photo_uploads_skip_moderation.sql

BEGIN;

CREATE FUNCTION pg_temp.act_as(p_user uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
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
  m_admin uuid;
  g uuid;
  p uuid;
  r record;
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'am-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_admin, 'am-test-admin@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Admin upload test ' || u FROM unnest(ARRAY[u_owner, u_admin]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;
  SELECT id INTO m_admin FROM public.members WHERE user_id = u_admin;

  DELETE FROM public.user_roles WHERE user_id = u_admin;
  INSERT INTO public.user_roles (user_id, role) VALUES (u_admin, 'admin');

  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'am-test', 'am-test-' || m_owner, 'public', 'visible')
  RETURNING id INTO g;

  -- Admin uploads -------------------------------------------------------------
  PERFORM pg_temp.act_as(u_admin);
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path)
  VALUES (g, m_owner, 'a.jpg', 'a.jpg', 1, 'image/jpeg', 'am-test/a')
  RETURNING id INTO p;
  RESET ROLE;
  SELECT moderation_status, reviewed_by, reviewed_at, user_id INTO r FROM public.gallery_photos WHERE id = p;
  PERFORM pg_temp.check(r.moderation_status = 'approved' AND r.reviewed_by = m_admin
    AND r.reviewed_at IS NOT NULL AND r.user_id = m_owner,
    'an admin upload is approved, reviewed by the admin, and owned by the gallery owner');

  PERFORM pg_temp.act_as(u_admin);
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, moderation_status)
  VALUES (g, m_owner, 'b.jpg', 'b.jpg', 1, 'image/jpeg', 'am-test/b', 'rejected')
  RETURNING id INTO p;
  RESET ROLE;
  PERFORM pg_temp.check((SELECT moderation_status FROM public.gallery_photos WHERE id = p) = 'rejected',
    'an explicit status from an admin is kept');

  -- Member uploads ------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path)
  VALUES (g, m_owner, 'c.jpg', 'c.jpg', 1, 'image/jpeg', 'am-test/c')
  RETURNING id INTO p;
  RESET ROLE;
  SELECT moderation_status, reviewed_by INTO r FROM public.gallery_photos WHERE id = p;
  PERFORM pg_temp.check(r.moderation_status = 'pending' AND r.reviewed_by IS NULL,
    'a member''s own upload still starts as pending');

  RAISE NOTICE 'admin photo upload moderation checks passed';
END $test$;

ROLLBACK;
