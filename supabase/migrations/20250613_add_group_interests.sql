/*
  # Add group interests/tags support

  1. New Tables
    - `group_interests`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups.id)
      - `interest` (text)
      - `created_at` (timestamp)
      - Unique constraint on (group_id, interest)

  2. Security
    - Enable RLS on `group_interests` table
    - Add policies for group members to manage interests
*/

-- Create group_interests table for storing interests/hobbies/goals
CREATE TABLE IF NOT EXISTS group_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Ensure each interest is unique per group
  UNIQUE(group_id, interest)
);

-- Add index for better query performance
CREATE INDEX idx_group_interests_group_id ON group_interests(group_id);
CREATE INDEX idx_group_interests_interest ON group_interests(interest);

-- Enable Row Level Security
ALTER TABLE group_interests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read group interests for visible groups
CREATE POLICY "Anyone can read group interests for visible groups"
  ON group_interests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_interests.group_id
      AND groups.status = 'published'
      AND (
        groups.visibility IN ('open', 'closed') OR
        -- For secret groups, only members can see interests
        (groups.visibility = 'secret' AND EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.group_id = groups.id
          AND group_members.member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
          )
        ))
      )
    )
  );

-- Policy: Group admins can manage interests
CREATE POLICY "Group admins can manage group interests"
  ON group_interests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_interests.group_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Authenticated users can add interests when creating a group
CREATE POLICY "Users can add interests to groups they create"
  ON group_interests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_interests.group_id
      AND groups.created_by IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Add comment for documentation
COMMENT ON TABLE group_interests IS 'Stores interests, hobbies, and goals associated with groups';
COMMENT ON COLUMN group_interests.interest IS 'A single interest, hobby, or goal tag for the group';

-- Create a view to get groups with their interests aggregated
CREATE OR REPLACE VIEW groups_with_interests AS
SELECT 
  g.*,
  COALESCE(
    array_agg(
      DISTINCT gi.interest 
      ORDER BY gi.interest
    ) FILTER (WHERE gi.interest IS NOT NULL), 
    ARRAY[]::text[]
  ) as interests
FROM groups g
LEFT JOIN group_interests gi ON g.id = gi.group_id
GROUP BY g.id;