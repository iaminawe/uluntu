-- Fix the user profile creation trigger
-- The trigger was trying to insert into an 'email' column that doesn't exist in the members table

-- Update the trigger function to remove the email column reference
CREATE OR REPLACE FUNCTION public.on_auth_user_created_create_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create member profile with draft status (without email column)
  INSERT INTO public.members (user_id, name, status, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'draft', -- Privacy by default
    NOW(),
    NOW()
  );
  
  -- Ensure user has authenticated role
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'authenticated', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger itself doesn't need to be recreated, just the function
-- But let's make sure it exists
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_auth_user_created_create_profile();

-- Add a comment to document the fix
COMMENT ON FUNCTION public.on_auth_user_created_create_profile() IS 'Fixed trigger function that creates member profiles without referencing non-existent email column';