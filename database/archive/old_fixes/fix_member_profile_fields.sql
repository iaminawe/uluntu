-- Add missing columns to members table if they don't exist
-- This will help store company and social links properly

-- Add company column if it doesn't exist
ALTER TABLE members ADD COLUMN IF NOT EXISTS company TEXT;

-- Add social column to store JSON data for social links
-- This will store linkedin, twitter, github, etc.
ALTER TABLE members ADD COLUMN IF NOT EXISTS social JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_company ON members(company);
CREATE INDEX IF NOT EXISTS idx_members_social ON members USING gin(social);

-- If you want to migrate existing website data to the social JSON column
-- UPDATE members 
-- SET social = jsonb_build_object('website', website)
-- WHERE website IS NOT NULL AND social IS NULL;

-- Grant permissions for the new columns
GRANT SELECT, INSERT, UPDATE ON members TO authenticated;
GRANT SELECT ON members TO anon;