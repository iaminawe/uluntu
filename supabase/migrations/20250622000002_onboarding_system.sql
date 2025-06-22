-- Onboarding System Migration
-- Adds onboarding tracking fields to members table and ensures privacy-by-default

-- Add onboarding tracking columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 1 CHECK (onboarding_current_step >= 1 AND onboarding_current_step <= 5),
ADD COLUMN IF NOT EXISTS onboarding_skipped_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "profileVisibility": "members",
  "showEmail": false,
  "showPhone": false,
  "showLocation": true,
  "allowMessages": true,
  "allowConnectionRequests": true
}'::jsonb;

-- Create index for efficient directory queries
CREATE INDEX IF NOT EXISTS idx_members_status_published ON members(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_members_onboarding_completed ON members(onboarding_completed_at) WHERE onboarding_completed_at IS NOT NULL;

-- Update existing members to have completed onboarding (for backwards compatibility)
-- Only do this for members that don't have a status set
UPDATE members 
SET 
  status = COALESCE(status, 'published'),
  onboarding_completed_at = COALESCE(onboarding_completed_at, created_at),
  profile_completion_percentage = 100
WHERE 
  created_at < NOW() 
  AND onboarding_completed_at IS NULL;

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(member_id UUID)
RETURNS INTEGER AS $$
DECLARE
  member_record RECORD;
  completion_score INTEGER := 0;
  total_fields INTEGER := 10; -- Total possible fields
BEGIN
  SELECT * INTO member_record FROM members WHERE id = member_id;
  
  -- Basic fields (40%)
  IF member_record.name IS NOT NULL AND member_record.name != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF member_record.title IS NOT NULL AND member_record.title != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF member_record.bio IS NOT NULL AND LENGTH(member_record.bio) > 50 THEN
    completion_score := completion_score + 20;
  END IF;
  
  -- Professional fields (30%)
  IF member_record.employment_status IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF member_record.company IS NOT NULL AND member_record.company != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM member_skills WHERE member_id = member_record.id LIMIT 1
  ) THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Additional fields (30%)
  IF member_record.location IS NOT NULL AND member_record.location != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF member_record.image IS NOT NULL AND member_record.image != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF member_record.website IS NOT NULL AND member_record.website != '' THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF member_record.social IS NOT NULL AND jsonb_array_length(member_record.social) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  RETURN LEAST(completion_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS update_member_profile_completion ON members;
CREATE TRIGGER update_member_profile_completion
  BEFORE INSERT OR UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Update RLS policies to respect member status
-- Drop existing select policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON members;

-- Create new policy that respects status
CREATE POLICY "Published profiles are viewable by everyone" ON members
  FOR SELECT
  USING (
    status = 'published' 
    OR auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Members can always update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON members;
CREATE POLICY "Users can update own profile" ON members
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON COLUMN members.status IS 'Member visibility status: draft (private), published (public), suspended (hidden)';
COMMENT ON COLUMN members.onboarding_completed_at IS 'Timestamp when user completed onboarding wizard';
COMMENT ON COLUMN members.onboarding_current_step IS 'Current step in onboarding wizard (1-5)';
COMMENT ON COLUMN members.onboarding_skipped_steps IS 'Array of step numbers that were skipped';
COMMENT ON COLUMN members.profile_completion_percentage IS 'Calculated percentage of profile completeness';
COMMENT ON COLUMN members.privacy_settings IS 'JSON object containing privacy preferences';

-- Create function to publish member profile
CREATE OR REPLACE FUNCTION publish_member_profile(member_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE members 
  SET status = 'published'
  WHERE id = member_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unpublish member profile
CREATE OR REPLACE FUNCTION unpublish_member_profile(member_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE members 
  SET status = 'draft'
  WHERE id = member_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION publish_member_profile TO authenticated;
GRANT EXECUTE ON FUNCTION unpublish_member_profile TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_profile_completion TO authenticated;

-- Update the existing trigger to ensure new users get authenticated role
CREATE OR REPLACE FUNCTION public.on_auth_user_created_create_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create member profile with draft status
  INSERT INTO public.members (user_id, name, email, status, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
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

-- Recreate trigger if it doesn't exist with the correct function
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_auth_user_created_create_profile();