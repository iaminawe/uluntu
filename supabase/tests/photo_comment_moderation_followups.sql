-- Regression checks for 20261119000000_photo_comment_moderation_followups.sql.
--
-- Creates a photo owner, another member and a site admin, a public photo and
-- a private one, then checks comment status on insert and edit, the approved
-- comment count, reply threading, and that likes and comments on a private
-- photo stay private. Always rolls back. Raises on the first failed check.
-- Run against a database that has the migration applied, as a role that can
-- write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/photo_comment_moderation_followups.sql
--   supabase db query --linked -f supabase/tests/photo_comment_moderation_followups.sql

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
  g_public uuid;
  g_private uuid;
  p_public uuid;
  p_private uuid;
  c_id uuid;
  r_id uuid;
  v_n int;
  v_s text;
  v_err text;
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'cf-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_other, 'cf-test-other@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_admin, 'cf-test-admin@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Comment test ' || u FROM unnest(ARRAY[u_owner, u_other, u_admin]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;
  SELECT id INTO m_other FROM public.members WHERE user_id = u_other;

  DELETE FROM public.user_roles WHERE user_id = u_admin;
  INSERT INTO public.user_roles (user_id, role) VALUES (u_admin, 'admin');

  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'cf-test public', 'cf-test-public-' || m_owner, 'public', 'visible')
  RETURNING id INTO g_public;
  INSERT INTO public.user_galleries (user_id, title, slug, privacy_level, visibility)
  VALUES (m_owner, 'cf-test private', 'cf-test-private-' || m_owner, 'private', 'visible')
  RETURNING id INTO g_private;

  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, moderation_status)
  VALUES (g_public, m_owner, 'a.jpg', 'a.jpg', 1, 'image/jpeg', 'cf-test/a', 'approved')
  RETURNING id INTO p_public;
  INSERT INTO public.gallery_photos
    (gallery_id, user_id, file_name, original_file_name, file_size, mime_type, storage_path, moderation_status)
  VALUES (g_private, m_owner, 'b.jpg', 'b.jpg', 1, 'image/jpeg', 'cf-test/b', 'approved')
  RETURNING id INTO p_private;

  -- Status on insert ----------------------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  INSERT INTO public.photo_comments (photo_id, user_id, content, moderation_status)
  VALUES (p_public, m_other, 'first', 'rejected')
  RETURNING id INTO c_id;
  RESET ROLE;
  PERFORM pg_temp.check(
    (SELECT moderation_status FROM public.photo_comments WHERE id = c_id) = 'approved'
    AND (SELECT comment_count FROM public.gallery_photos WHERE id = p_public) = 1,
    'a new comment is approved whatever status the client sends, and counted');

  -- Private photo -------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  INSERT INTO public.photo_comments (photo_id, user_id, content) VALUES (p_private, m_owner, 'mine');
  INSERT INTO public.photo_likes (photo_id, user_id) VALUES (p_private, m_owner);
  RESET ROLE;

  PERFORM pg_temp.act_as(u_other);
  SELECT (SELECT count(*) FROM public.photo_comments WHERE photo_id = p_private)
       + (SELECT count(*) FROM public.photo_likes WHERE photo_id = p_private) INTO v_n;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'another member sees no comments or likes on a private photo');

  PERFORM pg_temp.act_as(NULL);
  SELECT (SELECT count(*) FROM public.photo_comments WHERE photo_id = p_private)
       + (SELECT count(*) FROM public.photo_likes WHERE photo_id = p_private) INTO v_n;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon sees no comments or likes on a private photo');

  -- Replies -------------------------------------------------------------------
  PERFORM pg_temp.act_as(u_owner);
  INSERT INTO public.photo_comments (photo_id, user_id, content, parent_comment_id)
  VALUES (p_public, m_owner, 'reply', c_id)
  RETURNING id INTO r_id;
  RESET ROLE;
  PERFORM pg_temp.check(r_id IS NOT NULL
    AND (SELECT comment_count FROM public.gallery_photos WHERE id = p_public) = 2,
    'a member can reply on the same photo');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    INSERT INTO public.photo_comments (photo_id, user_id, content, parent_comment_id)
    VALUES (p_private, m_owner, 'x', c_id);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '23514', 'a reply cannot answer a comment on another photo');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    UPDATE public.photo_comments SET parent_comment_id = NULL WHERE id = r_id;
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'the author cannot move their reply to another thread');

  -- Edits -----------------------------------------------------------------------
  PERFORM pg_temp.act_as(u_other);
  UPDATE public.photo_comments SET content = 'first, edited', is_edited = true WHERE id = c_id;
  RESET ROLE;
  PERFORM pg_temp.check(
    (SELECT moderation_status FROM public.photo_comments WHERE id = c_id) = 'pending'
    AND (SELECT comment_count FROM public.gallery_photos WHERE id = p_public) = 1,
    'editing an approved comment sends it back for review and uncounts it');

  PERFORM pg_temp.act_as(NULL);
  SELECT count(*) INTO v_n FROM public.photo_comments WHERE id = c_id;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 0, 'anon cannot see an edited comment awaiting review');

  PERFORM pg_temp.act_as(u_other);
  SELECT count(*) INTO v_n FROM public.photo_comments WHERE id = c_id;
  RESET ROLE;
  PERFORM pg_temp.check(v_n = 1, 'the author still sees their edited comment');

  -- Admin decisions ---------------------------------------------------------------
  PERFORM pg_temp.act_as(u_admin);
  UPDATE public.photo_comments SET moderation_status = 'approved' WHERE id = c_id;
  RESET ROLE;
  PERFORM pg_temp.check((SELECT comment_count FROM public.gallery_photos WHERE id = p_public) = 2,
    'approving a comment counts it again');

  PERFORM pg_temp.act_as(u_admin);
  UPDATE public.photo_comments SET moderation_status = 'rejected' WHERE id = c_id;
  RESET ROLE;
  PERFORM pg_temp.check((SELECT comment_count FROM public.gallery_photos WHERE id = p_public) = 1,
    'rejecting a comment uncounts it');

  PERFORM pg_temp.act_as(u_other);
  UPDATE public.photo_comments SET content = 'first, again' WHERE id = c_id;
  RESET ROLE;
  SELECT moderation_status INTO v_s FROM public.photo_comments WHERE id = c_id;
  PERFORM pg_temp.check(v_s = 'rejected', 'editing a rejected comment leaves it rejected');

  PERFORM pg_temp.act_as(u_owner);
  BEGIN
    INSERT INTO public.photo_comments (photo_id, user_id, content, parent_comment_id)
    VALUES (p_public, m_owner, 'y', c_id);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '23514', 'a member cannot reply to a comment they cannot see');

  RAISE NOTICE 'photo comment moderation follow-up checks passed';
END $test$;

ROLLBACK;
