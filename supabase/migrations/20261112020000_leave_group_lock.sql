-- Review of #33: the last-admin check in leave_group only locked the caller's
-- own membership row, so two admins leaving at the same moment could each
-- count the other as the remaining admin and leave the group with none.
-- leave_group now locks the group row first, so leaves in one group run one
-- at a time. Same signature and grants as 20261112010000.

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

  -- Serialise leaves per group: without this, two admins leaving at once
  -- could each see the other as the remaining admin.
  PERFORM 1 FROM public.groups WHERE id = p_group_id FOR UPDATE;

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
