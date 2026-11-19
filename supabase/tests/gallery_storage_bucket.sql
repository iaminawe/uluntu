-- Regression checks for 20261119010000_gallery_storage_bucket.sql.
--
-- Creates a gallery owner, another member and a site admin with a gallery
-- each, then checks who can upload, read, move and delete objects in the
-- gallery-photos bucket. Writes storage.objects rows directly, as the Storage
-- API does, and always rolls back, so no files are created. Raises on the
-- first failed check. Run against a database that has the migration applied,
-- as a role that can write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/gallery_storage_bucket.sql
--   supabase db query --linked -f supabase/tests/gallery_storage_bucket.sql

BEGIN;

-- The Storage API sets this before deleting; direct deletes are blocked without it.
SET LOCAL storage.allow_delete_query = 'true';

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

-- SQLSTATE of uploading p_name as p_user, or NULL if it succeeded.
CREATE FUNCTION pg_temp.try_upload(p_user uuid, p_name text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v_err text;
BEGIN
  PERFORM pg_temp.act_as(p_user);
  BEGIN
    INSERT INTO storage.objects (bucket_id, name, owner_id) VALUES ('gallery-photos', p_name, p_user::text);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  RETURN v_err;
END $$;

DO $test$
DECLARE
  u_owner uuid := gen_random_uuid();
  u_other uuid := gen_random_uuid();
  u_admin uuid := gen_random_uuid();
  m_owner uuid;
  m_other uuid;
  g_owner uuid;
  g_other uuid;
  base text;
  v_n int;
BEGIN
  PERFORM pg_temp.check(
    (SELECT public AND file_size_limit = 52428800 AND 'image/webp' = ANY(allowed_mime_types)
     FROM storage.buckets WHERE id = 'gallery-photos'),
    'the gallery-photos bucket exists, is public, and has its size and type limits');

  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'gs-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_other, 'gs-test-other@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_admin, 'gs-test-admin@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Storage test ' || u FROM unnest(ARRAY[u_owner, u_other, u_admin]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;
  SELECT id INTO m_other FROM public.members WHERE user_id = u_other;

  DELETE FROM public.user_roles WHERE user_id = u_admin;
  INSERT INTO public.user_roles (user_id, role) VALUES (u_admin, 'admin');

  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'gs-test owner', 'gs-test-owner-' || m_owner, 'public', 'visible')
  RETURNING id INTO g_owner;
  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_other, 'gs-test other', 'gs-test-other-' || m_other, 'public', 'visible')
  RETURNING id INTO g_other;

  base := 'users/' || u_owner || '/galleries/' || g_owner || '/';

  -- Uploads -------------------------------------------------------------------
  PERFORM pg_temp.check(pg_temp.try_upload(u_owner, base || 'originals/a_1.jpg') IS NULL
    AND pg_temp.try_upload(u_owner, base || 'medium/medium_a_1.jpg') IS NULL
    AND pg_temp.try_upload(u_owner, base || 'thumbs/thumb_a_1.jpg') IS NULL,
    'the owner can upload every size into their own gallery folder');

  PERFORM pg_temp.check(pg_temp.try_upload(u_owner, base || 'large/a_1.jpg') = '42501',
    'uploads must go in an originals, medium or thumbs folder');
  PERFORM pg_temp.check(pg_temp.try_upload(u_owner, base || 'originals/extra/a_1.jpg') = '42501',
    'uploads cannot add extra folders');
  PERFORM pg_temp.check(
    pg_temp.try_upload(u_owner, 'users/' || u_owner || '/galleries/' || g_other || '/originals/a_1.jpg') = '42501',
    'the owner cannot upload for a gallery they do not own');
  PERFORM pg_temp.check(pg_temp.try_upload(u_other, base || 'originals/b_1.jpg') = '42501',
    'another member cannot upload into the owner''s folder');
  PERFORM pg_temp.check(pg_temp.try_upload(u_owner, 'gallery/original/a_1.jpg') = '42501',
    'uploads outside the users/ layout are refused');
  PERFORM pg_temp.check(pg_temp.try_upload(NULL, base || 'originals/c_1.jpg') IS NOT NULL,
    'anon cannot upload');

  -- Reads ---------------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  SELECT count(*) INTO v_n FROM storage.objects WHERE bucket_id = 'gallery-photos' AND name LIKE base || '%';
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 3, 'the owner can list their files');

  PERFORM pg_temp.act_as(u_other);
  SELECT count(*) INTO v_n FROM storage.objects WHERE bucket_id = 'gallery-photos' AND name LIKE base || '%';
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'another member cannot list the owner''s files');

  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM storage.objects WHERE bucket_id = 'gallery-photos' AND name LIKE base || '%';
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon cannot list gallery files');

  -- Moves ---------------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  UPDATE storage.objects SET name = base || 'originals/a_2.jpg'
  WHERE bucket_id = 'gallery-photos' AND name = base || 'originals/a_1.jpg';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the owner can rename a file within their gallery folder');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    UPDATE storage.objects
    SET name = 'users/' || u_owner || '/galleries/' || g_other || '/originals/a_2.jpg'
    WHERE bucket_id = 'gallery-photos' AND name = base || 'originals/a_2.jpg';
    v_n := NULL;
  EXCEPTION WHEN insufficient_privilege THEN v_n := -1;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = -1, 'the owner cannot move a file into a gallery they do not own');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    UPDATE storage.objects SET name = 'users/' || u_owner || '/elsewhere/a_2.jpg'
    WHERE bucket_id = 'gallery-photos' AND name = base || 'originals/a_2.jpg';
    v_n := NULL;
  EXCEPTION WHEN insufficient_privilege THEN v_n := -1;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = -1, 'the owner cannot move a file outside the gallery layout');

  -- Deletes -------------------------------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  DELETE FROM storage.objects WHERE bucket_id = 'gallery-photos' AND name LIKE base || '%';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'another member cannot delete the owner''s files');

  PERFORM pg_temp.act_as(u_owner);
  DELETE FROM storage.objects WHERE bucket_id = 'gallery-photos' AND name = base || 'thumbs/thumb_a_1.jpg';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the owner can delete their file');

  -- Admins ----------------------------------------------------------------------
  PERFORM pg_temp.check(pg_temp.try_upload(u_admin, base || 'originals/d_1.jpg') IS NULL,
    'a site admin can upload into a member''s gallery folder');

  PERFORM pg_temp.act_as(u_admin);
  DELETE FROM storage.objects WHERE bucket_id = 'gallery-photos' AND name LIKE base || '%';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 3, 'a site admin can delete a member''s files');

  RAISE NOTICE 'gallery storage bucket checks passed';
END $test$;

ROLLBACK;
