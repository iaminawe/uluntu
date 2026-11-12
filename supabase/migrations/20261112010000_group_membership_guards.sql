-- Follow-ups to 20261112000000 from the review of #32:
--   join_group:  a pending membership returned true with nothing changed, so
--                the caller was told they had joined. It now raises, like the
--                suspended case.
--   leave_group: the only active admin could leave a group that still has
--                members, leaving nobody able to manage it. They must make
--                someone else an admin first. A sole member may still leave.
-- Checks for both functions are in supabase/tests/group_membership_functions.sql.

CREATE OR REPLACE FUNCTION public.join_group(
  p_group_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_role text DEFAULT 'member'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_member_id uuid;
  v_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_user_id IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot add other users to a group';
  END IF;

  SELECT id INTO v_member_id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id
      AND status = 'published'
      AND visibility IN ('open', 'closed')
  ) THEN
    RAISE EXCEPTION 'Group not found or not joinable';
  END IF;

  SELECT status INTO v_status
  FROM public.group_members
  WHERE group_id = p_group_id AND member_id = v_member_id
  FOR UPDATE;

  IF FOUND THEN
    -- Older rows may have a NULL status, which earlier code treated as active.
    IF v_status IS NULL OR v_status = 'active' THEN
      RETURN true;
    ELSIF v_status = 'suspended' THEN
      RAISE EXCEPTION 'Membership is suspended';
    ELSIF v_status = 'pending' THEN
      RAISE EXCEPTION 'Membership request is awaiting approval';
    END IF;
    -- Rejoining after leaving.
    UPDATE public.group_members
    SET status = 'active', role = 'member', joined_at = now(), left_at = NULL
    WHERE group_id = p_group_id AND member_id = v_member_id;
  ELSE
    INSERT INTO public.group_members (group_id, member_id, role, status, joined_at)
    VALUES (p_group_id, v_member_id, 'member', 'active', now());
  END IF;

  PERFORM public.refresh_group_member_count(p_group_id);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.join_group(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group(uuid, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.leave_group(
  p_group_id uuid,
  p_member_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_member_id uuid;
  v_member_id uuid;
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_caller_member_id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
  v_member_id := coalesce(p_member_id, v_caller_member_id);

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;
  IF v_member_id IS DISTINCT FROM v_caller_member_id AND NOT public.is_site_admin() THEN
    RAISE EXCEPTION 'Cannot remove other members from a group'
      USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_role
  FROM public.group_members
  WHERE group_id = p_group_id AND member_id = v_member_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_role = 'admin'
     AND NOT EXISTS (
       SELECT 1 FROM public.group_members
       WHERE group_id = p_group_id AND member_id <> v_member_id
         AND status = 'active' AND role = 'admin'
     )
     AND EXISTS (
       SELECT 1 FROM public.group_members
       WHERE group_id = p_group_id AND member_id <> v_member_id
         AND status = 'active'
     )
  THEN
    RAISE EXCEPTION 'Make another member an admin before leaving this group';
  END IF;

  UPDATE public.group_members
  SET status = 'inactive', left_at = now()
  WHERE group_id = p_group_id AND member_id = v_member_id;

  PERFORM public.refresh_group_member_count(p_group_id);

  INSERT INTO public.group_activities (group_id, actor_id, action)
  VALUES (p_group_id, v_member_id, 'member_left');

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.leave_group(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_group(uuid, uuid) TO authenticated;
