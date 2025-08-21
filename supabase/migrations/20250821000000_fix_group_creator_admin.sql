-- ================================================================
-- FIX GROUP CREATOR ADMIN ROLE ASSIGNMENT
-- ================================================================
-- This migration ensures that when a group is created, the creator
-- is automatically added as an admin member of the group

-- First, find and drop ALL existing versions of the functions
-- We query the pg_proc table to find all overloaded versions
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Drop all versions of change_member_role
    FOR func_record IN 
        SELECT pg_get_function_identity_arguments(oid) as args 
        FROM pg_proc 
        WHERE proname = 'change_member_role' 
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.change_member_role(%s) CASCADE', func_record.args);
    END LOOP;
    
    -- Drop all versions of join_group
    FOR func_record IN 
        SELECT pg_get_function_identity_arguments(oid) as args 
        FROM pg_proc 
        WHERE proname = 'join_group' 
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.join_group(%s) CASCADE', func_record.args);
    END LOOP;
    
    -- Drop all versions of is_group_admin
    FOR func_record IN 
        SELECT pg_get_function_identity_arguments(oid) as args 
        FROM pg_proc 
        WHERE proname = 'is_group_admin' 
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.is_group_admin(%s) CASCADE', func_record.args);
    END LOOP;
    
    -- Drop all versions of create_group_with_admin
    FOR func_record IN 
        SELECT pg_get_function_identity_arguments(oid) as args 
        FROM pg_proc 
        WHERE proname = 'create_group_with_admin' 
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.create_group_with_admin(%s) CASCADE', func_record.args);
    END LOOP;
END $$;

-- Create or replace the function to handle group creation
CREATE OR REPLACE FUNCTION public.handle_group_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new group is created, automatically add the creator as admin
  IF NEW.created_by IS NOT NULL THEN
    -- Check if the member exists before inserting
    IF EXISTS (SELECT 1 FROM public.members WHERE id = NEW.created_by) THEN
      INSERT INTO public.group_members (
        group_id,
        member_id,
        role,
        status,
        joined_at
      ) VALUES (
        NEW.id,
        NEW.created_by,
        'admin',
        'active',
        NOW()
      ) ON CONFLICT (group_id, member_id) DO UPDATE
      SET role = 'admin', status = 'active';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_group_created ON public.groups;

-- Create the trigger for group creation
CREATE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_creation();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_group_creation TO authenticated;

-- ================================================================
-- CREATE FUNCTION TO PROPERLY CREATE A GROUP WITH CREATOR AS ADMIN
-- ================================================================
CREATE OR REPLACE FUNCTION public.create_group_with_admin(
  p_name TEXT,
  p_description TEXT,
  p_visibility TEXT DEFAULT 'open',
  p_hero_image TEXT DEFAULT '',
  p_slug TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
  v_member_id UUID;
  v_final_slug TEXT;
BEGIN
  -- Get the member_id for the current user
  SELECT id INTO v_member_id
  FROM public.members
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;
  
  -- Generate slug if not provided
  IF p_slug IS NULL OR p_slug = '' THEN
    v_final_slug := LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(p_name, '[^a-zA-Z0-9\s\-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    ));
  ELSE
    v_final_slug := p_slug;
  END IF;
  
  -- Create the group
  INSERT INTO public.groups (
    name,
    slug,
    description,
    visibility,
    hero_image,
    status,
    created_by,
    created_at
  ) VALUES (
    p_name,
    v_final_slug,
    p_description,
    p_visibility,
    p_hero_image,
    'published',
    v_member_id,
    NOW()
  ) RETURNING id INTO v_group_id;
  
  -- The trigger will automatically add the creator as admin
  -- But we ensure it here as well for safety
  INSERT INTO public.group_members (
    group_id,
    member_id,
    role,
    status,
    joined_at
  ) VALUES (
    v_group_id,
    v_member_id,
    'admin',
    'active',
    NOW()
  ) ON CONFLICT (group_id, member_id) DO UPDATE
  SET role = 'admin', status = 'active';
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_group_with_admin TO authenticated;

-- ================================================================
-- CREATE NEW JOIN_GROUP FUNCTION TO HANDLE ROLES PROPERLY
-- ================================================================
CREATE OR REPLACE FUNCTION public.join_group(
  p_group_id UUID,
  p_user_id UUID DEFAULT auth.uid(),
  p_role TEXT DEFAULT 'member'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_group_exists BOOLEAN;
  v_already_member BOOLEAN;
  v_member_id UUID;
BEGIN
  -- Get the member_id for the user
  SELECT id INTO v_member_id
  FROM public.members
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;
  
  -- Check if group exists and is joinable
  SELECT EXISTS(
    SELECT 1 FROM public.groups 
    WHERE id = p_group_id 
    AND status = 'published'
    AND visibility IN ('open', 'closed')
  ) INTO v_group_exists;
  
  IF NOT v_group_exists THEN
    RAISE EXCEPTION 'Group not found or not joinable';
  END IF;
  
  -- Check if user is already a member
  SELECT EXISTS(
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id 
    AND member_id = v_member_id
  ) INTO v_already_member;
  
  IF v_already_member THEN
    RETURN TRUE; -- Already a member
  END IF;
  
  -- Add user to group with specified role (default: member)
  INSERT INTO public.group_members (
    group_id,
    member_id,
    role,
    status,
    joined_at
  ) VALUES (
    p_group_id,
    v_member_id,
    p_role,
    'active',
    NOW()
  );
  
  -- Update member count
  UPDATE public.groups 
  SET member_count = (
    SELECT COUNT(*) FROM public.group_members 
    WHERE group_id = p_group_id AND status = 'active'
  )
  WHERE id = p_group_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.join_group TO authenticated;

-- ================================================================
-- CREATE FUNCTION TO CHANGE MEMBER ROLE (ADMIN ONLY)
-- ================================================================
CREATE OR REPLACE FUNCTION public.change_member_role(
  p_group_id UUID,
  p_member_id UUID,
  p_new_role TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_current_user_member_id UUID;
BEGIN
  -- Get the current user's member_id
  SELECT id INTO v_current_user_member_id
  FROM public.members
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Check if current user is an admin of the group
  SELECT EXISTS(
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id 
    AND member_id = v_current_user_member_id
    AND role = 'admin'
    AND status = 'active'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only group admins can change member roles';
  END IF;
  
  -- Validate role
  IF p_new_role NOT IN ('admin', 'moderator', 'member') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, moderator, or member';
  END IF;
  
  -- Update the member's role
  UPDATE public.group_members
  SET role = p_new_role,
      updated_at = NOW()
  WHERE group_id = p_group_id
  AND member_id = p_member_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.change_member_role TO authenticated;

-- ================================================================
-- CREATE FUNCTION TO CHECK IF USER IS GROUP ADMIN
-- ================================================================
CREATE OR REPLACE FUNCTION public.is_group_admin(
  p_group_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  v_member_id UUID;
BEGIN
  -- Get the member_id for the user
  SELECT id INTO v_member_id
  FROM public.members
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF v_member_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is an admin of the group
  RETURN EXISTS(
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id 
    AND member_id = v_member_id
    AND role = 'admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_group_admin TO authenticated;

-- ================================================================
-- FIX EXISTING GROUPS WITHOUT ADMINS
-- ================================================================
-- For any existing groups without an admin, make the creator an admin
-- or the first member if no creator is set
DO $$
DECLARE
  v_group RECORD;
  v_admin_exists BOOLEAN;
  v_member_to_promote UUID;
BEGIN
  FOR v_group IN 
    SELECT id, created_by FROM public.groups
  LOOP
    -- Check if group has any admin
    SELECT EXISTS(
      SELECT 1 FROM public.group_members
      WHERE group_id = v_group.id
      AND role = 'admin'
      AND status = 'active'
    ) INTO v_admin_exists;
    
    IF NOT v_admin_exists THEN
      -- Try to use creator first
      IF v_group.created_by IS NOT NULL THEN
        v_member_to_promote := v_group.created_by;
      ELSE
        -- Otherwise use the first member
        SELECT member_id INTO v_member_to_promote
        FROM public.group_members
        WHERE group_id = v_group.id
        AND status = 'active'
        ORDER BY joined_at
        LIMIT 1;
      END IF;
      
      -- Promote to admin if we found someone
      IF v_member_to_promote IS NOT NULL THEN
        -- First check if the member exists
        IF EXISTS (SELECT 1 FROM public.members WHERE id = v_member_to_promote) THEN
          -- Check if they're already a member of the group
          IF EXISTS (SELECT 1 FROM public.group_members WHERE group_id = v_group.id AND member_id = v_member_to_promote) THEN
            -- Update their role
            UPDATE public.group_members
            SET role = 'admin'
            WHERE group_id = v_group.id
            AND member_id = v_member_to_promote;
          ELSE
            -- Add them as admin
            INSERT INTO public.group_members (group_id, member_id, role, status, joined_at)
            VALUES (v_group.id, v_member_to_promote, 'admin', 'active', NOW())
            ON CONFLICT (group_id, member_id) DO UPDATE
            SET role = 'admin';
          END IF;
        END IF;
      END IF;
    END IF;
  END LOOP;
END $$;

-- ================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ================================================================
COMMENT ON FUNCTION public.create_group_with_admin IS 
'Creates a new group and automatically assigns the creator as admin';

COMMENT ON FUNCTION public.join_group IS 
'Adds a user to a group with specified role (default: member)';

COMMENT ON FUNCTION public.change_member_role IS 
'Changes a member role in a group (admin only)';

COMMENT ON FUNCTION public.is_group_admin IS 
'Checks if a user is an admin of a specific group';

COMMENT ON TRIGGER on_group_created ON public.groups IS 
'Automatically adds group creator as admin when group is created';