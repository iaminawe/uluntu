-- Add a UNIQUE constraint to user_id in public.members if it doesn't exist
-- This ensures a user can only have one profile in the members table.
-- Adjust if this assumption is incorrect.
ALTER TABLE public.members
ADD CONSTRAINT members_user_id_unique UNIQUE (user_id);

-- Function to create a member profile, callable via RPC
-- This function runs with the privileges of the definer, bypassing client RLS for the insert itself,
-- but still uses auth.uid() to correctly associate the profile.
CREATE OR REPLACE FUNCTION public.create_member_profile(name_to_set TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.members (user_id, name, status)
  VALUES (auth.uid(), name_to_set, 'published'::text) -- Ensure 'published' matches the type of 'status' column if it's an enum
  ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name; -- Example: if profile exists, update name. Or DO NOTHING.
END;
$$;

-- Grant execute permission to the 'authenticated' role so logged-in users can call it.
GRANT EXECUTE ON FUNCTION public.create_member_profile(TEXT) TO authenticated;
