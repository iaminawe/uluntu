-- Create trigger function to manage group_member role assignment
CREATE OR REPLACE FUNCTION public.handle_group_membership_role()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When user joins a group, assign group_member role if they don't have it
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.member_id, 'group_member', NOW())
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- When user leaves a group, check if they're still in any other groups
    -- If not, remove the group_member role
    IF NOT EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE member_id = OLD.member_id 
      AND group_id != OLD.group_id
    ) THEN
      DELETE FROM public.user_roles 
      WHERE user_id = OLD.member_id 
      AND role = 'group_member';
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for group membership changes
DROP TRIGGER IF EXISTS handle_group_join ON public.group_members;
CREATE TRIGGER handle_group_join
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_membership_role();

DROP TRIGGER IF EXISTS handle_group_leave ON public.group_members;
CREATE TRIGGER handle_group_leave
  AFTER DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_membership_role();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_group_membership_role TO authenticated;

-- Create function to assign user to group with role management
CREATE OR REPLACE FUNCTION public.join_group(p_group_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  group_exists BOOLEAN;
  already_member BOOLEAN;
BEGIN
  -- Check if group exists and is joinable
  SELECT EXISTS(
    SELECT 1 FROM public.groups 
    WHERE id = p_group_id 
    AND status = 'published'
    AND visibility IN ('open', 'closed')
  ) INTO group_exists;
  
  IF NOT group_exists THEN
    RAISE EXCEPTION 'Group not found or not joinable';
  END IF;
  
  -- Check if user is already a member
  SELECT EXISTS(
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id 
    AND member_id = p_user_id
  ) INTO already_member;
  
  IF already_member THEN
    RETURN TRUE; -- Already a member, consider it successful
  END IF;
  
  -- Add user to group (trigger will handle role assignment)
  INSERT INTO public.group_members (group_id, member_id, role, joined_date)
  VALUES (p_group_id, p_user_id, 'member', NOW());
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove user from group with role management
CREATE OR REPLACE FUNCTION public.leave_group(p_group_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove user from group (trigger will handle role removal)
  DELETE FROM public.group_members 
  WHERE group_id = p_group_id 
  AND member_id = p_user_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.join_group TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_group TO authenticated;

-- Create admin function to bulk assign users to groups
CREATE OR REPLACE FUNCTION public.admin_bulk_assign_group_members(
  p_group_id UUID,
  p_user_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  inserted_count INTEGER := 0;
  user_id UUID;
BEGIN
  -- Check if user has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;
  
  -- Insert each user into the group
  FOREACH user_id IN ARRAY p_user_ids LOOP
    BEGIN
      INSERT INTO public.group_members (group_id, member_id, role, joined_date)
      VALUES (p_group_id, user_id, 'member', NOW())
      ON CONFLICT (group_id, member_id) DO NOTHING;
      
      IF FOUND THEN
        inserted_count := inserted_count + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Continue with next user if one fails
        CONTINUE;
    END;
  END LOOP;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_bulk_assign_group_members TO authenticated;

-- Ensure existing group members have the group_member role
-- This is a one-time data migration for existing data
DO $$
DECLARE
  member_record RECORD;
BEGIN
  FOR member_record IN 
    SELECT DISTINCT member_id FROM public.group_members 
  LOOP
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (member_record.member_id, 'group_member', NOW())
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_group_membership_role() IS 'Automatically manages group_member role assignment when users join/leave groups';
COMMENT ON FUNCTION public.join_group(UUID, UUID) IS 'Safely joins a user to a group with proper role assignment';
COMMENT ON FUNCTION public.leave_group(UUID, UUID) IS 'Safely removes a user from a group with proper role cleanup';
COMMENT ON FUNCTION public.admin_bulk_assign_group_members(UUID, UUID[]) IS 'Admin function to bulk assign multiple users to a group';