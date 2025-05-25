-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;

-- Create a function to handle new user creation and profile generation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.members (user_id, name, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New Member'), 'published')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create a trigger to automatically create a member profile when a user is created
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_profile() TO service_role;
