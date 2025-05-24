/*
  # Create groups table and related tables

  1. Tables
    - `groups` - Group information
    - `group_members` - Relationship between groups and members
  
  2. Security
    - Enable RLS on all tables
    - Add policies for different access levels
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  hero_image TEXT NOT NULL,
  cover_image TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('open', 'closed', 'secret')),
  member_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_date DATE NOT NULL,
  PRIMARY KEY (group_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for groups table

-- Anyone can read published open and closed groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Anyone can read published open and closed groups"
--   ON groups
--   FOR SELECT
--   USING (
--     status = 'published' AND
--     visibility IN ('open', 'closed')
--   );

-- Group members can read their groups regardless of visibility (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Group members can read their groups"
--   ON groups
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM group_members
--       WHERE group_members.group_id = groups.id
--       AND group_members.member_id IN (
--         SELECT id FROM members WHERE user_id = auth.uid()
--       )
--     )
--   );

-- Group admins can update and delete their groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Group admins can update their groups"
--   ON groups
--   FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM group_members
--       WHERE group_members.group_id = groups.id
--       AND group_members.role = 'admin'
--       AND group_members.member_id IN (
--         SELECT id FROM members WHERE user_id = auth.uid()
--       )
--     )
--   );

-- This policy is already created in a previous migration
-- CREATE POLICY "Group admins can delete their groups"
--   ON groups
--   FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM group_members
--       WHERE group_members.group_id = groups.id
--       AND group_members.role = 'admin'
--       AND group_members.member_id IN (
--         SELECT id FROM members WHERE user_id = auth.uid()
--       )
--     )
--   );

-- Authenticated users can create groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Authenticated users can create groups"
--   ON groups
--   FOR INSERT
--   WITH CHECK (auth.uid() IS NOT NULL);

-- Superadmins can do anything with groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Superadmins can manage all groups"
--   ON groups
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'superadmin'
--     )
--   );

-- Create policies for group_members table

-- Anyone can read group members for open and closed groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Anyone can read group members for open and closed groups"
--   ON group_members
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM groups
--       WHERE groups.id = group_members.group_id
--       AND groups.visibility IN ('open', 'closed')
--     )
--   );

-- Group members can read members of their groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Group members can read members of their groups"
--   ON group_members
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM group_members AS gm
--       WHERE gm.group_id = group_members.group_id
--       AND gm.member_id IN (
--         SELECT id FROM members WHERE user_id = auth.uid()
--       )
--     )
--   );

-- Group admins can manage group members (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Group admins can manage group members"
--   ON group_members
--   USING (
--     EXISTS (
--       SELECT 1 FROM group_members AS gm
--       WHERE gm.group_id = group_members.group_id
--       AND gm.role = 'admin'
--       AND gm.member_id IN (
--         SELECT id FROM members WHERE user_id = auth.uid()
--       )
--     )
--   );

-- Members can join open groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Members can join open groups"
--   ON group_members
--   FOR INSERT
--   WITH CHECK (
--     auth.uid() IS NOT NULL AND
--     EXISTS (
--       SELECT 1 FROM groups
--       WHERE groups.id = group_members.group_id
--       AND groups.visibility = 'open'
--     ) AND
--     group_members.member_id IN (
--       SELECT id FROM members WHERE user_id = auth.uid()
--     )
--   );

-- Members can leave groups (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Members can leave groups"
--   ON group_members
--   FOR DELETE
--   USING (
--     group_members.member_id IN (
--       SELECT id FROM members WHERE user_id = auth.uid()
--     )
--   );

-- Superadmins can do anything with group members (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Superadmins can manage all group members"
--   ON group_members
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'superadmin'
--     )
--   );

-- Create function to update member_count when members are added or removed (commented out to avoid duplicate function error)
-- This function is already created in a previous migration
-- CREATE OR REPLACE FUNCTION update_group_member_count()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF TG_OP = 'INSERT' THEN
--     UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
--   ELSIF TG_OP = 'DELETE' THEN
--     UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
--   END IF;
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- Create trigger to update member_count (commented out to avoid duplicate trigger error)
-- This trigger is already created in a previous migration
-- CREATE TRIGGER update_group_member_count_trigger
-- AFTER INSERT OR DELETE ON group_members
-- FOR EACH ROW
-- EXECUTE FUNCTION update_group_member_count();