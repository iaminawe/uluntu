-- Comprehensive migration for member profiles
-- This migration adds missing columns and migrates existing data

-- 1. Add company column if it doesn't exist
ALTER TABLE members ADD COLUMN IF NOT EXISTS company TEXT;

-- 2. Add social column as JSONB to store all social links
ALTER TABLE members ADD COLUMN IF NOT EXISTS social JSONB;

-- 3. Migrate existing website data to social JSON column
UPDATE members 
SET social = CASE 
  WHEN website IS NOT NULL AND website != '' 
  THEN jsonb_build_object('website', website)
  ELSE NULL
END
WHERE social IS NULL;

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_company ON members(company);
CREATE INDEX IF NOT EXISTS idx_members_social ON members USING gin(social);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- 5. Update RLS policies to include new columns
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view published members" ON members;
DROP POLICY IF EXISTS "Users can update their own member profile" ON members;
DROP POLICY IF EXISTS "Users can insert their own member profile" ON members;

-- Create new policies with proper permissions
CREATE POLICY "Users can view published members" ON members
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can update their own member profile" ON members
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own member profile" ON members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant proper permissions
GRANT SELECT, INSERT, UPDATE ON members TO authenticated;
GRANT SELECT ON members TO anon;

-- 7. Ensure member_skills table has proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON member_skills TO authenticated;

-- 8. Add RLS policies for member_skills
ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view member skills" ON member_skills;
DROP POLICY IF EXISTS "Users can manage their own member skills" ON member_skills;

CREATE POLICY "Users can view member skills" ON member_skills
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own member skills" ON member_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_skills.member_id 
      AND members.user_id = auth.uid()
    )
  );

-- 9. Display current state for verification
SELECT 
  COUNT(*) as total_members,
  COUNT(company) as members_with_company,
  COUNT(social) as members_with_social,
  COUNT(DISTINCT user_id) as unique_users
FROM members;