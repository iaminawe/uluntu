-- Final fix for user profile creation trigger
-- This ensures the trigger works with the actual members table structure

-- Drop existing trigger and function to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
DROP FUNCTION IF EXISTS public.on_auth_user_created_create_profile();

-- Create the corrected trigger function that matches the actual members table structure
CREATE OR REPLACE FUNCTION public.on_auth_user_created_create_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create member profile with draft status
  -- Note: members table does NOT have an email column
  INSERT INTO public.members (
    user_id, 
    name, 
    status, 
    created_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1) -- Use email prefix as fallback name
    ),
    'draft', -- Privacy by default
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate profiles
  
  -- Ensure user has authenticated role
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'authenticated', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_auth_user_created_create_profile();

-- Add helpful comment
COMMENT ON FUNCTION public.on_auth_user_created_create_profile() IS 
  'Creates member profile after user signup. Fixed to work with actual members table structure (no email column).';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.on_auth_user_created_create_profile() TO service_role;