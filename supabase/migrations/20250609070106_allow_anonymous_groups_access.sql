-- Allow anonymous users to read published open groups
-- This fixes the issue where groups are not visible when users are not authenticated

-- Update the existing policy to allow anonymous access to open groups
DROP POLICY IF EXISTS "Anyone can read published open and closed groups" ON public.groups;

CREATE POLICY "Anyone can read published open and closed groups"
  ON public.groups
  FOR SELECT
  USING (
    status = 'published' AND 
    (visibility = 'open' OR (auth.role() = 'authenticated' AND visibility = 'closed'))
  );

-- Add a separate policy for anonymous users to read open groups only
CREATE POLICY "Anonymous users can read published open groups"
  ON public.groups
  FOR SELECT
  TO anon
  USING (
    status = 'published' AND 
    visibility = 'open'
  );