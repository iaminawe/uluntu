-- Regression checks for 20261118020000_photo_likes_comments_moderation.sql.
--
-- Creates a photo owner, another member and a site admin, a public photo and
-- a private one, then checks likes, comments, counts and the moderation
-- record. Always rolls back. Raises on the first failed check. Run against a
-- database that has the migration applied, as a role that can write
-- auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/photo_likes_comments_moderation.sql
--   supabase db query --linked -f supabase/tests/photo_likes_comments_moderation.sql

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
  u_admin uuid := gen_random_uuid();
  m_owner uuid;
  m_other uuid;
  m_admin uuid;
  g_public uuid;
  g_private uuid;
  p_public uuid;
  p_private uuid;
  c_id uuid;
  v_n int;
  v_err text;
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'lc-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_other, 'lc-test-other@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_admin, 'lc-test-admin@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Like test ' || u FROM unnest(ARRAY[u_owner, u_other, u_admin]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;
  SELECT id INTO m_other FROM public.members WHERE user_id = u_other;
  SELECT id INTO m_admin FROM public.members WHERE user_id = u_admin;

  DELETE FROM public.user_roles WHERE user_id = u_admin;
  INSERT INTO public.user_roles (user_id, role) VALUES (u_admin, 'admin');

  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'lc-test public', 'lc-test-public-' || m_owner, 'public', 'visible')
  RETURNING id INTO g_public;
  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'lc-test private', 'lc-test-private-' || m_owner, 'private', 'visible')
  RETURNING id INTO g_private;

  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, moderation_status)
  VALUES (g_public, m_owner, 'a.jpg', 'a.jpg', 1, 'image/jpeg', 'lc-test/a', 'approved')
  RETURNING id INTO p_public;
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, moderation_status)
  VALUES (g_private, m_owner, 'b.jpg', 'b.jpg', 1, 'image/jpeg', 'lc-test/b', 'approved')
  RETURNING id INTO p_private;

  -- Likes ---------------------------------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  INSERT INTO public.photo_likes (photo_id, user_id) VALUES (p_public, m_other);
  RESET ROLE;
  PERFORM pg_temp.check((SELECT like_count FROM public.gallery_photos WHERE id = p_public) = 1,
    'a member can like someone else''s photo and its like count goes up');

  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.photo_likes WHERE photo_id = p_public;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'anon sees likes on a public photo');

  PERFORM pg_temp.act_as(u_other);
  BEGIN
    INSERT INTO public.photo_likes (photo_id, user_id) VALUES (p_private, m_other);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'a member cannot like a photo they cannot see');

  PERFORM pg_temp.act_as(u_other);
  BEGIN
    INSERT INTO public.photo_likes (photo_id, user_id) VALUES (p_public, m_admin);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'a member cannot like on someone else''s behalf');

  PERFORM pg_temp.act_as(u_owner);
  DELETE FROM public.photo_likes WHERE photo_id = p_public;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'a member cannot remove someone else''s like');

  PERFORM pg_temp.act_as(u_other);
  DELETE FROM public.photo_likes WHERE photo_id = p_public AND user_id = m_other;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1 AND (SELECT like_count FROM public.gallery_photos WHERE id = p_public) = 0,
    'a member can remove their like and the count goes down');

  -- Comments ------------------------------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  INSERT INTO public.photo_comments (photo_id, user_id, content, moderation_status)
  VALUES (p_public, m_other, 'nice', 'approved')
  RETURNING id INTO c_id;
  RESET ROLE;
  PERFORM pg_temp.check(c_id IS NOT NULL
    AND (SELECT comment_count FROM public.gallery_photos WHERE id = p_public) = 1,
    'a member can comment on someone else''s photo and its comment count goes up');

  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.photo_comments WHERE id = c_id;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'anon sees an approved comment on a public photo');

  PERFORM pg_temp.act_as(u_other);
  BEGIN
    INSERT INTO public.photo_comments (photo_id, user_id, content) VALUES (p_private, m_other, 'x');
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'a member cannot comment on a photo they cannot see');

  PERFORM pg_temp.act_as(u_other);
  UPDATE public.photo_comments SET content = 'nice!', is_edited = true WHERE id = c_id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the author can edit their comment');

  PERFORM pg_temp.act_as(u_owner);
  UPDATE public.photo_comments SET content = 'hijacked' WHERE id = c_id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'another member cannot edit the comment');

  -- An admin rejects the comment; its author cannot undo that.
  PERFORM pg_temp.act_as(u_admin);
  UPDATE public.photo_comments
  SET moderation_status = 'rejected', moderated_by = m_admin, moderated_at = now()
  WHERE id = c_id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'a site admin can reject a comment');

  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.photo_comments WHERE id = c_id;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon no longer sees a rejected comment');

  PERFORM pg_temp.act_as(u_other);
  BEGIN
    UPDATE public.photo_comments SET moderation_status = 'approved' WHERE id = c_id;
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the author cannot re-approve a rejected comment');

  PERFORM pg_temp.act_as(u_other);
  DELETE FROM public.photo_comments WHERE id = c_id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1 AND (SELECT comment_count FROM public.gallery_photos WHERE id = p_public) = 0,
    'the author can delete their comment and the count goes down');

  -- Photo moderation record ---------------------------------------------------
  PERFORM pg_temp.act_as(u_admin);
  UPDATE public.gallery_photos
  SET moderation_status = 'rejected', reviewed_by = m_admin, reviewed_at = now(),
      moderation_notes = 'test'
  WHERE id = p_public;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'a site admin can record a review on a photo');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    UPDATE public.gallery_photos SET moderation_notes = NULL WHERE id = p_public;
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the owner cannot change the review record');

  RAISE NOTICE 'photo likes, comments and moderation checks passed';
END $test$;

ROLLBACK;
