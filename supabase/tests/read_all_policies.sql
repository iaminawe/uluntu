-- Regression checks for 20261118000000_drop_read_all_policies.sql.
--
-- Creates an owner, another member and a site admin, gives the owner one
-- unpublished row in each table, checks who can read those rows, and always
-- rolls back. Raises on the first failed check. Run against a database that
-- has the migration applied, as a role that can write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/read_all_policies.sql
--   supabase db query --linked -f supabase/tests/read_all_policies.sql

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

-- How many of the given rows p_user (NULL for anon) can read.
CREATE FUNCTION pg_temp.visible(p_user uuid, p_table text, p_ids uuid[]) RETURNS int
LANGUAGE plpgsql AS $$
DECLARE v_n int;
BEGIN
  PERFORM pg_temp.act_as(p_user);
  EXECUTE format('SELECT count(*) FROM public.%I WHERE id = ANY($1)', p_table) INTO v_n USING p_ids;
  RESET ROLE;
  RETURN v_n;
END $$;

DO $test$
DECLARE
  u_owner uuid := gen_random_uuid();
  u_other uuid := gen_random_uuid();
  u_admin uuid := gen_random_uuid();
  m_owner uuid;
  t text;
  v_id uuid;
  v_n int;
  -- One unpublished row per table, owned by u_owner where the table has an owner.
  drafts jsonb := '{}';
  -- Tables whose owner column points at u_owner's member row.
  owned text[] := ARRAY['members', 'events', 'news', 'opportunities', 'resources', 'marketplace_listings'];
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_owner, 'ra-test-owner@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_other, 'ra-test-other@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_admin, 'ra-test-admin@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Read test ' || u FROM unnest(ARRAY[u_owner, u_other, u_admin]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_owner FROM public.members WHERE user_id = u_owner;
  UPDATE public.members SET status = 'draft' WHERE id = m_owner;
  drafts := drafts || jsonb_build_object('members', m_owner);

  DELETE FROM public.user_roles WHERE user_id = u_admin;
  INSERT INTO public.user_roles (user_id, role) VALUES (u_admin, 'admin');

  INSERT INTO public.companies (name, description, logo, industry, size, founded, location, slug, status)
  VALUES ('ra-test', 'test', '', ARRAY['test'], '1', '2026', 'test', 'ra-test-' || m_owner, 'draft')
  RETURNING id INTO v_id;
  drafts := drafts || jsonb_build_object('companies', v_id);

  INSERT INTO public.events (title, description, date, location, image, type, organizer_id, status)
  VALUES ('ra-test', 'test', now() + interval '7 days', 'test', '', 'online', m_owner, 'draft')
  RETURNING id INTO v_id;
  drafts := drafts || jsonb_build_object('events', v_id);

  INSERT INTO public.news (title, slug, content, author_id, status)
  VALUES ('ra-test', 'ra-test-' || m_owner, 'test', m_owner, 'draft')
  RETURNING id INTO v_id;
  drafts := drafts || jsonb_build_object('news', v_id);

  INSERT INTO public.opportunities (title, description, type, location, contact_email, organization, posted_by, status)
  VALUES ('ra-test', 'test', 'job', 'test', 'ra-test@example.invalid', 'test', m_owner, 'archived')
  RETURNING id INTO v_id;
  drafts := drafts || jsonb_build_object('opportunities', v_id);

  INSERT INTO public.resources (title, description, type, url, contributor_id, status)
  VALUES ('ra-test', 'test', 'link', 'https://example.invalid', m_owner, 'draft')
  RETURNING id INTO v_id;
  drafts := drafts || jsonb_build_object('resources', v_id);

  INSERT INTO public.marketplace_listings (title, description, type, seller_id, location, status)
  VALUES ('ra-test', 'test', 'sale', m_owner, 'test', 'draft')
  RETURNING id INTO v_id;
  drafts := drafts || jsonb_build_object('marketplace_listings', v_id);

  INSERT INTO public.tags (name, slug, created_by, status)
  VALUES ('ra-test', 'ra-test-' || m_owner, m_owner, 'inactive')
  RETURNING id INTO v_id;
  drafts := drafts || jsonb_build_object('tags', v_id);

  -- Who can read the unpublished rows ----------------------------------------
  FOR t IN SELECT jsonb_object_keys(drafts) LOOP
    v_id := (drafts ->> t)::uuid;
    PERFORM pg_temp.check(pg_temp.visible(NULL, t, ARRAY[v_id]) = 0,
      format('anon cannot read an unpublished %s row', t));
    PERFORM pg_temp.check(pg_temp.visible(u_other, t, ARRAY[v_id]) = 0,
      format('another member cannot read an unpublished %s row', t));
    PERFORM pg_temp.check(pg_temp.visible(u_admin, t, ARRAY[v_id]) = 1,
      format('a site admin can read an unpublished %s row', t));
    IF t = ANY (owned) THEN
      PERFORM pg_temp.check(pg_temp.visible(u_owner, t, ARRAY[v_id]) = 1,
        format('the owner can read their unpublished %s row', t));
    END IF;
  END LOOP;

  -- The dashboard's "my content" queries, as the owner.
  PERFORM pg_temp.act_as(u_owner);
  SELECT count(*) INTO v_n FROM public.events WHERE organizer_id = m_owner;
  PERFORM pg_temp.check(v_n = 1, 'my events lists the owner''s draft');
  SELECT count(*) INTO v_n FROM public.news WHERE author_id = m_owner;
  PERFORM pg_temp.check(v_n = 1, 'my news lists the owner''s draft');
  SELECT count(*) INTO v_n FROM public.opportunities WHERE posted_by = m_owner;
  PERFORM pg_temp.check(v_n = 1, 'my opportunities lists the owner''s archived row');
  SELECT count(*) INTO v_n FROM public.resources WHERE contributor_id = m_owner;
  PERFORM pg_temp.check(v_n = 1, 'my resources lists the owner''s draft');
  SELECT count(*) INTO v_n FROM public.marketplace_listings WHERE seller_id = m_owner;
  PERFORM pg_temp.check(v_n = 1, 'my listings lists the owner''s draft');

  -- INSERT ... RETURNING needs SELECT on the new row.
  INSERT INTO public.resources (title, description, type, url, contributor_id, status)
  VALUES ('ra-test 2', 'test', 'link', 'https://example.invalid/2', m_owner, 'draft')
  RETURNING id INTO v_id;
  RESET ROLE;
  PERFORM pg_temp.check(v_id IS NOT NULL, 'a contributor can insert a draft resource and read it back');

  -- Published content is still public.
  PERFORM pg_temp.act_as(NULL);
  PERFORM pg_temp.check((SELECT count(*) FROM public.members WHERE status = 'published') > 0,
    'anon still reads published members');
  PERFORM pg_temp.check((SELECT count(*) FROM public.events WHERE status = 'published') > 0,
    'anon still reads published events');
  PERFORM pg_temp.check((SELECT count(*) FROM public.companies WHERE status = 'published') > 0,
    'anon still reads published companies');
  RESET ROLE;

  PERFORM pg_temp.act_as(u_other);
  PERFORM pg_temp.check((SELECT count(*) FROM public.resources WHERE status = 'published') > 0,
    'a member still reads published resources');
  PERFORM pg_temp.check((SELECT count(*) FROM public.tags WHERE status = 'active') > 0,
    'a member still reads active tags');
  RESET ROLE;

  -- No read-everything policy is left on these tables.
  SELECT count(*) INTO v_n FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('members', 'companies', 'events', 'news', 'opportunities', 'resources',
                      'marketplace_listings', 'resource_photos', 'tags')
    AND cmd IN ('SELECT', 'ALL')
    AND (qual = 'true' OR qual = '(auth.role() = ''authenticated''::text)');
  PERFORM pg_temp.check(v_n = 0, 'no USING (true) or any-signed-in-user read policies remain');

  RAISE NOTICE 'read-all policy checks passed';
END $test$;

ROLLBACK;
