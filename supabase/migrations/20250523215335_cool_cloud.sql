/*
  # Create resources table and related tables

  1. New Tables
    - `resources`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text)
      - `description` (text)
      - `type` (text)
      - `url` (text)
      - `image` (text)
      - `status` (text)
      - `featured` (boolean)
      - `contributor_id` (uuid, references members.id)
      - `group_id` (uuid, references groups.id)
    - `resource_tags`
      - `resource_id` (uuid, references resources.id)
      - `tag` (text)
  2. Security
    - Enable RLS on both tables
    - Add policies for different user roles
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  contributor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL
);

-- Create resource_tags table
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (resource_id, tag)
);

-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for resources table

-- Anyone can read published resources that aren't associated with a group
CREATE POLICY "Anyone can read published resources without group"
  ON resources
  FOR SELECT
  USING (
    status = 'published' AND
    (group_id IS NULL)
  );

-- Anyone can read published resources associated with open or closed groups
CREATE POLICY "Anyone can read published resources for open or closed groups"
  ON resources
  FOR SELECT
  USING (
    status = 'published' AND
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = resources.group_id
      AND groups.visibility IN ('open', 'closed')
    )
  );

-- Group members can read resources associated with their groups
CREATE POLICY "Group members can read resources for their groups"
  ON resources
  FOR SELECT
  USING (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = resources.group_id
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Contributors can read, update, and delete their own resources
CREATE POLICY "Contributors can read their own resources"
  ON resources
  FOR SELECT
  USING (
    contributor_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can update their own resources"
  ON resources
  FOR UPDATE
  USING (
    contributor_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can delete their own resources"
  ON resources
  FOR DELETE
  USING (
    contributor_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can create resources
CREATE POLICY "Authenticated users can create resources"
  ON resources
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    contributor_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Superadmins can do anything with resources
CREATE POLICY "Superadmins can manage all resources"
  ON resources
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create policies for resource_tags table

-- Anyone can read resource tags
CREATE POLICY "Anyone can read resource tags"
  ON resource_tags
  FOR SELECT
  USING (true);

-- Contributors can manage tags for their own resources
CREATE POLICY "Contributors can manage tags for their own resources"
  ON resource_tags
  USING (
    EXISTS (
      SELECT 1 FROM resources
      WHERE resources.id = resource_tags.resource_id
      AND resources.contributor_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Superadmins can do anything with resource tags
CREATE POLICY "Superadmins can manage all resource tags"
  ON resource_tags
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );