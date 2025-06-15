-- Add support for member interests
-- This migration adds a member_interests table to store interests

-- 1. Create member_interests table
CREATE TABLE IF NOT EXISTS member_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, interest)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_interests_member_id ON member_interests(member_id);
CREATE INDEX IF NOT EXISTS idx_member_interests_interest ON member_interests(interest);

-- 3. Enable RLS
ALTER TABLE member_interests ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view member interests" ON member_interests
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own member interests" ON member_interests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_interests.member_id 
      AND members.user_id = auth.uid()
    )
  );

-- 5. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON member_interests TO authenticated;
GRANT SELECT ON member_interests TO anon;

-- 6. Alternatively, add interests as JSONB array to members table
-- This is simpler but less flexible for querying
-- ALTER TABLE members ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;

-- Display confirmation
SELECT 'Member interests table created successfully' as status;