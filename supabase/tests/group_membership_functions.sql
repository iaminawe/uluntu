-- Regression checks for join_group, leave_group and accept_invitation
-- (migrations 20261112000000 and 20261112010000).
--
-- Creates its own users, members, group and invitations, calls the functions
-- as those users through the authenticated role, and always rolls back.
-- Raises on the first failed check. Run against a database that has the
-- migrations applied, as a role that can write auth.users:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/group_membership_functions.sql
--   supabase db query --linked -f supabase/tests/group_membership_functions.sql

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
  u_a uuid := gen_random_uuid();  -- group admin
  u_b uuid := gen_random_uuid();  -- ordinary member
  u_c uuid := gen_random_uuid();  -- invitee
  m_a uuid; m_b uuid; m_c uuid;
  g uuid;
  v_err text;
  v_ok boolean;

  -- Membership state of a member in g, e.g. 'member/active'.
  v_state text;
BEGIN
  -- Fixtures ----------------------------------------------------------------
  INSERT INTO auth.users (id, email, email_confirmed_at, aud, role)
  VALUES (u_a, 'gm-test-a@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_b, 'gm-test-b@example.invalid', now(), 'authenticated', 'authenticated'),
         (u_c, 'gm-test-c@example.invalid', now(), 'authenticated', 'authenticated');

  -- A signup trigger may already have created member rows.
  INSERT INTO public.members (user_id, name)
  SELECT u, 'Group test ' || u FROM unnest(ARRAY[u_a, u_b, u_c]) AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = u);
  SELECT id INTO m_a FROM public.members WHERE user_id = u_a;
  SELECT id INTO m_b FROM public.members WHERE user_id = u_b;
  SELECT id INTO m_c FROM public.members WHERE user_id = u_c;

  INSERT INTO public.groups (name, description, hero_image, visibility, status, created_by)
  VALUES ('Group membership test', 'test', '', 'open', 'published', m_a)
  RETURNING id INTO g;

  -- A group-creation trigger may have added the creator; start from a known set.
  DELETE FROM public.group_members WHERE group_id = g;
  INSERT INTO public.group_members (group_id, member_id, role, status, joined_at)
  VALUES (g, m_a, 'admin', 'active', now()),
         (g, m_b, 'member', 'active', now());

  -- leave_group -------------------------------------------------------------
  PERFORM pg_temp.act_as(u_b);
  BEGIN
    PERFORM public.leave_group(g, m_a);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'a member cannot remove another member');

  PERFORM pg_temp.act_as(u_a);
  BEGIN
    PERFORM public.leave_group(g);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLERRM;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err LIKE 'Make another member an admin%',
    'the only admin cannot leave while other members remain');

  PERFORM pg_temp.act_as(u_b);
  v_ok := public.leave_group(g);
  RESET ROLE;
  SELECT status INTO v_state FROM public.group_members WHERE group_id = g AND member_id = m_b;
  PERFORM pg_temp.check(v_ok AND v_state = 'inactive', 'a member can leave');
  PERFORM pg_temp.check((SELECT member_count FROM public.groups WHERE id = g) = 1,
    'member_count drops after leaving');

  PERFORM pg_temp.act_as(u_b);
  v_ok := public.leave_group(g);
  RESET ROLE;
  PERFORM pg_temp.check(NOT v_ok, 'leaving twice returns false');

  -- join_group --------------------------------------------------------------
  PERFORM pg_temp.act_as(u_b);
  v_ok := public.join_group(g);
  RESET ROLE;
  SELECT role || '/' || status INTO v_state FROM public.group_members WHERE group_id = g AND member_id = m_b;
  PERFORM pg_temp.check(v_ok AND v_state = 'member/active', 'a member who left can rejoin');
  PERFORM pg_temp.check((SELECT member_count FROM public.groups WHERE id = g) = 2,
    'member_count rises after rejoining');

  UPDATE public.group_members SET status = 'pending' WHERE group_id = g AND member_id = m_b;
  PERFORM pg_temp.act_as(u_b);
  BEGIN
    PERFORM public.join_group(g);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLERRM;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err LIKE '%awaiting approval%', 'a pending member is not told they joined');

  UPDATE public.group_members SET status = 'suspended' WHERE group_id = g AND member_id = m_b;
  PERFORM pg_temp.act_as(u_b);
  BEGIN
    PERFORM public.join_group(g);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLERRM;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err LIKE '%suspended%', 'a suspended member cannot rejoin');
  UPDATE public.group_members SET status = 'active' WHERE group_id = g AND member_id = m_b;

  -- accept_invitation -------------------------------------------------------
  INSERT INTO public.group_invitations (group_id, invited_by, invited_member_id, token, role)
  VALUES (g, m_a, m_c, 'gm-test-member-invite', 'moderator');

  PERFORM pg_temp.act_as(u_c);
  BEGIN
    PERFORM public.accept_invitation('gm-test-member-invite', m_b);
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLSTATE;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err = '42501', 'cannot accept on behalf of another member');

  PERFORM pg_temp.act_as(u_b);
  BEGIN
    PERFORM public.accept_invitation('gm-test-member-invite');
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLERRM;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err LIKE '%different member%', 'cannot accept an invitation addressed to someone else');

  PERFORM pg_temp.act_as(u_c);
  v_ok := public.accept_invitation('gm-test-member-invite');
  RESET ROLE;
  SELECT role || '/' || status INTO v_state FROM public.group_members WHERE group_id = g AND member_id = m_c;
  PERFORM pg_temp.check(v_ok AND v_state = 'member/active', 'the invitee joins; moderator becomes member');
  PERFORM pg_temp.check(
    (SELECT status FROM public.group_invitations WHERE token = 'gm-test-member-invite') = 'accepted',
    'the invitation is marked accepted');

  INSERT INTO public.group_invitations (group_id, invited_by, invited_email, token, role)
  VALUES (g, m_a, 'someone-else@example.invalid', 'gm-test-email-invite', 'member');
  PERFORM pg_temp.act_as(u_c);
  BEGIN
    PERFORM public.accept_invitation('gm-test-email-invite');
    v_err := NULL;
  EXCEPTION WHEN others THEN v_err := SQLERRM;
  END;
  RESET ROLE;
  PERFORM pg_temp.check(v_err LIKE '%different email%', 'an email invitation must match the caller''s email');

  -- An admin invite from someone who is not a group admin grants member only.
  INSERT INTO public.group_invitations (group_id, invited_by, invited_member_id, token, role)
  VALUES (g, m_b, m_c, 'gm-test-admin-from-member', 'admin');
  PERFORM pg_temp.act_as(u_c);
  PERFORM public.accept_invitation('gm-test-admin-from-member');
  RESET ROLE;
  PERFORM pg_temp.check(
    (SELECT role FROM public.group_members WHERE group_id = g AND member_id = m_c) = 'member',
    'a non-admin inviter cannot grant admin');

  INSERT INTO public.group_invitations (group_id, invited_by, invited_member_id, token, role)
  VALUES (g, m_a, m_c, 'gm-test-admin-from-admin', 'admin');
  PERFORM pg_temp.act_as(u_c);
  PERFORM public.accept_invitation('gm-test-admin-from-admin');
  RESET ROLE;
  PERFORM pg_temp.check(
    (SELECT role FROM public.group_members WHERE group_id = g AND member_id = m_c) = 'admin',
    'a group admin can invite another admin');

  -- With a second admin, the first may leave.
  PERFORM pg_temp.act_as(u_a);
  v_ok := public.leave_group(g);
  RESET ROLE;
  PERFORM pg_temp.check(v_ok, 'an admin can leave once another admin exists');

  RAISE NOTICE 'group membership checks passed';
END $test$;

ROLLBACK;
