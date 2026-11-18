-- Regression checks for 20261118010000_gallery_photo_owner_policies.sql.
--
-- Creates an owner, another member and a site admin, gives the owner a
-- public, a members-only and a private gallery with an approved and a pending
-- photo in each, checks who can read and change them, and always rolls back.
-- Raises on the first failed check. Run against a database that has the
-- migration applied, as a role that can write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/gallery_photo_policies.sql
--   supabase db query --linked -f supabase/tests/gallery_photo_policies.sql

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

-- Which of the test photos p_user (NULL for anon) can read, as 'privacy/status' labels.
CREATE FUNCTION pg_temp.seen(p_user uuid, p_ids uuid[]) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text;
BEGIN
  PERFORM pg_temp.act_as(p_user);
  SELECT string_agg(p.title, ',' ORDER BY p.title) INTO v
  FROM public.gallery_photos p WHERE p.id = ANY(p_ids);
  RESET ROLE;
  RETURN coalesce(v, '');
END $$;

DO $test$
DECLARE
  u_owner uuid := gen_random_uuid();
  u_other uuid := gen_random_uuid();
  u_admin uuid := gen_random_uuid();
  m_owner uuid;
  m_other uuid;
  g uuid;
  g_public uuid;
  g_other uuid;
  lvl text;
  ids uuid[] := '{}';
  p_pending uuid;
  p_new uuid;
  v_n int;
  v_err text;
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'gp-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_other, 'gp-test-other@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_admin, 'gp-test-admin@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Photo test ' || u FROM unnest(ARRAY[u_owner, u_other, u_admin]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;
  SELECT id INTO m_other FROM public.members WHERE user_id = u_other;

  DELETE FROM public.user_roles WHERE user_id = u_admin;
  INSERT INTO public.user_roles (user_id, role) VALUES (u_admin, 'admin');

  FOREACH lvl IN ARRAY ARRAY['public', 'members_only', 'private'] LOOP
    INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
    VALUES (m_owner, 'gp-test ' || lvl, 'gp-test-' || replace(lvl, '_', '-') || '-' || m_owner, lvl, 'visible')
    RETURNING id INTO g;
    IF lvl = 'public' THEN g_public := g; END IF;
    WITH ins AS (
      INSERT INTO public.gallery_photos
        (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path,
         title, moderation_status)
      SELECT g, m_owner, 'gp.jpg', 'gp.jpg', 1, 'image/jpeg', 'gp-test/' || lvl || '/' || s,
             lvl || '/' || s, s
      FROM unnest(ARRAY['approved', 'pending']) AS s
      RETURNING id
    )
    SELECT ids || array_agg(id) INTO ids FROM ins;
  END LOOP;
  SELECT id INTO p_pending FROM public.gallery_photos WHERE id = ANY(ids) AND title = 'public/pending';

  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_other, 'gp-test other', 'gp-test-other-' || m_other, 'public', 'visible')
  RETURNING id INTO g_other;

  -- Reads ---------------------------------------------------------------------
  PERFORM pg_temp.check(pg_temp.seen(NULL, ids) = 'public/approved',
    'anon sees only approved photos in public galleries');
  PERFORM pg_temp.check(pg_temp.seen(u_other, ids) = 'members_only/approved,public/approved',
    'another member also sees approved members-only photos, never pending or private');
  PERFORM pg_temp.check(array_length(string_to_array(pg_temp.seen(u_owner, ids), ','), 1) = 6,
    'the owner sees all their photos, pending and private included');
  PERFORM pg_temp.check(array_length(string_to_array(pg_temp.seen(u_admin, ids), ','), 1) = 6,
    'a site admin sees every photo');

  -- Owner writes --------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  UPDATE public.gallery_photos SET caption = 'edited' WHERE id = ANY(ids);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 6, 'the owner can edit their photos');

  PERFORM pg_temp.act_as(u_owner);
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, moderation_status)
  VALUES (g_public, m_owner, 'new.jpg', 'new.jpg', 1, 'image/jpeg', 'gp-test/new', 'approved')
  RETURNING id INTO p_new;
  RESET ROLE;
  PERFORM pg_temp.check(p_new IS NOT NULL, 'the owner can upload into their gallery and read it back');
  PERFORM pg_temp.check((SELECT photo_count FROM public.user_galleries WHERE id = g_public) >= 1,
    'the photo count trigger still runs for the owner');

  PERFORM pg_temp.act_as(u_owner);
  DELETE FROM public.gallery_photos WHERE id = p_new;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the owner can delete their photo');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    INSERT INTO public.gallery_photos
      (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path)
    VALUES (g_other, m_owner, 'x.jpg', 'x.jpg', 1, 'image/jpeg', 'gp-test/x');
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the owner cannot upload into someone else''s gallery');

  -- Moderation guard ------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    UPDATE public.gallery_photos SET moderation_status = 'approved' WHERE id = p_pending;
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the owner cannot approve their own pending photo');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    UPDATE public.gallery_photos SET is_featured = true WHERE id = p_pending;
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the owner cannot feature their photo');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    UPDATE public.gallery_photos SET gallery_id = g_other WHERE id = p_pending;
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the owner cannot move a photo into someone else''s gallery');

  PERFORM pg_temp.act_as(u_owner);
  UPDATE public.gallery_photos SET visibility = 'hidden' WHERE id = p_pending;
  UPDATE public.gallery_photos SET visibility = 'visible' WHERE id = p_pending;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the owner can hide and unhide their own photo');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    INSERT INTO public.gallery_photos
      (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, is_featured)
    VALUES (g_public, m_owner, 'f.jpg', 'f.jpg', 1, 'image/jpeg', 'gp-test/f', true);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the owner cannot upload a featured photo');

  -- Other member writes ---------------------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  UPDATE public.gallery_photos SET caption = 'hijacked' WHERE id = ANY(ids);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'another member cannot edit the owner''s photos');

  PERFORM pg_temp.act_as(u_other);
  DELETE FROM public.gallery_photos WHERE id = ANY(ids);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'another member cannot delete the owner''s photos');

  PERFORM pg_temp.act_as(NULL);
  BEGIN
    UPDATE public.gallery_photos SET caption = 'hijacked' WHERE id = ANY(ids);
    GET DIAGNOSTICS v_n = ROW_COUNT;
  EXCEPTION WHEN insufficient_privilege THEN v_n := 0;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon cannot edit photos');

  -- Admin moderation ------------------------------------------------------------
  PERFORM pg_temp.act_as(u_admin);
  UPDATE public.gallery_photos SET moderation_status = 'approved', is_featured = true WHERE id = p_pending;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'a site admin can approve and feature a photo');
  PERFORM pg_temp.check(pg_temp.seen(NULL, ARRAY[p_pending]) = 'public/pending',
    'the approved photo is now public');

  RAISE NOTICE 'gallery photo policy checks passed';
END $test$;

ROLLBACK;
