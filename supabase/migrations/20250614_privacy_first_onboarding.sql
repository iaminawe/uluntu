-- Privacy-first onboarding: Set new user profiles to 'draft' by default
-- This ensures users have control over their visibility from the start
-- Migration Date: 2025-06-14
-- Purpose: Implement privacy-first user onboarding

-- Update the handle_new_user_profile function to set status as 'draft'
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.members (user_id, name, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New Member'), 'draft')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update the create_member_profile function to also default to 'draft'
CREATE OR REPLACE FUNCTION public.create_member_profile(
  name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  name_to_set text;
BEGIN
  -- Get the name from parameter or user metadata
  name_to_set := COALESCE(
    name, 
    auth.jwt() ->> 'user_metadata' ->> 'name',
    'New Member'
  );
  
  -- Insert member profile with draft status for privacy
  INSERT INTO members (user_id, name, status)
  VALUES (auth.uid(), name_to_set, 'draft'::text)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Comment explaining the privacy-first approach
COMMENT ON FUNCTION public.handle_new_user_profile() IS 
'Creates member profiles with draft status by default for privacy-first onboarding. Users must explicitly choose to make their profile public.';

COMMENT ON FUNCTION public.create_member_profile(text) IS 
'Creates member profiles with draft status by default. Users can update their privacy settings during onboarding or in profile settings.';