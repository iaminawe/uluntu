-- Fix the group membership functions so leave, rejoin and invitations work and
-- only act on the caller's own membership.
--
--   leave_group:       trusted p_member_id, so any signed-in user could mark
--                      any other member as having left any group. It now acts
--                      on the caller's membership (site admins may name one).
--   join_group:        returned true for any existing row, so a member who had
--                      left could never become active again. It now
--                      reactivates an inactive membership.
--   accept_invitation: called join_group with a member id where join_group
--                      expects the caller's auth user id, so every accept
--                      raised. It now creates the membership itself and checks
--                      that the invitation is addressed to the caller.
--
-- group_members.member_count is recomputed from active rows each time, because
-- the count trigger only fires on INSERT/DELETE and leaving is a soft update.
-- Depends on public.is_site_admin() from 20261108000000.

-- ---------------------------------------------------------------------------
-- Shared helper: recompute a group's active member count.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refresh_group_member_count(p_group_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.groups
  SET member_count = (
    SELECT count(*) FROM public.group_members
    WHERE group_id = p_group_id AND status = 'active'
  )
  WHERE id = p_group_id;
$$;

REVOKE ALL ON FUNCTION public.refresh_group_member_count(uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- join_group: same signature and checks as 20261108000000, plus rejoining.
-- ---------------------------------------------------------------------------
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
    IF v_status = 'suspended' THEN
      RAISE EXCEPTION 'Membership is suspended';
    END IF;
    IF v_status IS DISTINCT FROM 'inactive' THEN
      RETURN true;
    END IF;
    -- Rejoining after leaving: back to an ordinary active member.
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

-- ---------------------------------------------------------------------------
-- leave_group: p_member_id becomes optional and must be the caller's own
-- membership unless the caller is a site admin.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.leave_group(uuid, uuid);

CREATE FUNCTION public.leave_group(
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

  UPDATE public.group_members
  SET status = 'inactive', left_at = now()
  WHERE group_id = p_group_id
    AND member_id = v_member_id
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  PERFORM public.refresh_group_member_count(p_group_id);

  INSERT INTO public.group_activities (group_id, actor_id, action)
  VALUES (p_group_id, v_member_id, 'member_left');

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.leave_group(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_group(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- accept_invitation: p_member_id becomes optional and must be the caller's.
-- Invitations to a member must name the caller; email invitations must match
-- the caller's confirmed email. The admin role is only granted if the inviter
-- is still an active admin of the group (the inviter can edit the row).
-- group_members.role only allows admin|member, so anything else is 'member'.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.accept_invitation(text, uuid);

CREATE FUNCTION public.accept_invitation(
  p_token text,
  p_member_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_member_id uuid;
  v_email text;
  v_invitation public.group_invitations%ROWTYPE;
  v_role text := 'member';
  v_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_member_id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;
  IF p_member_id IS NOT NULL AND p_member_id <> v_member_id THEN
    RAISE EXCEPTION 'Cannot accept an invitation for another member'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_invitation
  FROM public.group_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  IF v_invitation.invited_member_id IS NOT NULL THEN
    IF v_invitation.invited_member_id <> v_member_id THEN
      RAISE EXCEPTION 'Invitation is for a different member';
    END IF;
  ELSE
    SELECT lower(email) INTO v_email
    FROM auth.users
    WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL;
    IF v_email IS NULL OR v_email <> lower(coalesce(v_invitation.invited_email, '')) THEN
      RAISE EXCEPTION 'Invitation is for a different email address';
    END IF;
  END IF;

  IF v_invitation.role = 'admin' AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_invitation.group_id
      AND member_id = v_invitation.invited_by
      AND role = 'admin'
      AND status = 'active'
  ) THEN
    v_role := 'admin';
  END IF;

  SELECT status INTO v_status
  FROM public.group_members
  WHERE group_id = v_invitation.group_id AND member_id = v_member_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_status = 'suspended' THEN
      RAISE EXCEPTION 'Membership is suspended';
    END IF;
    UPDATE public.group_members
    SET status = 'active',
        left_at = NULL,
        joined_at = CASE WHEN v_status = 'active' THEN joined_at ELSE now() END,
        role = CASE WHEN v_role = 'admin' THEN 'admin' ELSE role END
    WHERE group_id = v_invitation.group_id AND member_id = v_member_id;
  ELSE
    INSERT INTO public.group_members (group_id, member_id, role, status, joined_at)
    VALUES (v_invitation.group_id, v_member_id, v_role, 'active', now());
  END IF;

  UPDATE public.group_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;

  PERFORM public.refresh_group_member_count(v_invitation.group_id);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text, uuid) TO authenticated;
