/*
  # Create members table and related tables

  1. Tables
    - `members` - User profiles
    - `member_skills` - Skills associated with members
  
  2. Security
    - Enable RLS on all tables
    - Add policies for different access levels
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  location TEXT,
  image TEXT,
  website TEXT,
  employment_status TEXT,
  open_to_volunteering BOOLEAN,
  arrived_in_nelson DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false
);

-- Create member_skills table
CREATE TABLE IF NOT EXISTS member_skills (
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  PRIMARY KEY (member_id, skill)
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for members table

-- Anyone can read published members
CREATE POLICY "Anyone can read published members"
  ON members
  FOR SELECT
  USING (status = 'published');

-- Users can read, update, and delete their own profiles
CREATE POLICY "Users can read their own profiles"
  ON members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profiles"
  ON members
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own profiles"
  ON members
  FOR DELETE
  USING (user_id = auth.uid());

-- Authenticated users can create member profiles
CREATE POLICY "Authenticated users can create member profiles"
  ON members
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Superadmins can do anything with members
CREATE POLICY "Superadmins can manage all members"
  ON members
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create policies for member_skills table

-- Anyone can read member skills
CREATE POLICY "Anyone can read member skills"
  ON member_skills
  FOR SELECT
  USING (true);

-- Users can manage their own skills
CREATE POLICY "Users can manage their own skills"
  ON member_skills
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_skills.member_id
      AND members.user_id = auth.uid()
    )
  );

-- Superadmins can do anything with member skills
CREATE POLICY "Superadmins can manage all member skills"
  ON member_skills
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );