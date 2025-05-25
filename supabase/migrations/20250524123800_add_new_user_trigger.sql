-- Function to automatically assign the 'authenticated' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- Ensure 'public' is in search_path if app_role is not schema-qualified in the INSERT
-- For example, by using SET search_path = public; at the top of the function body,
-- or by schema-qualifying types like public.app_role.
AS $$
BEGIN
  -- Assign the 'authenticated' role by default to the new user
  -- Explicitly casting to public.app_role is a good practice for clarity and to avoid ambiguity,
  -- especially in SECURITY DEFINER functions where search_path might be minimal.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'authenticated'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user after a new user is inserted into auth.users
-- Ensure this trigger name is unique if you have other triggers on auth.users
CREATE TRIGGER on_auth_user_created_assign_default_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Grant necessary permissions if your setup requires it.
-- Supabase typically handles permissions for its internal roles.
-- However, if you manage roles/permissions strictly, you might need:
-- GRANT USAGE ON SCHEMA public TO supabase_auth_admin; -- Or the role that owns/manages auth
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
