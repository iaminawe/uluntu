/*
  # Create opportunities table

  1. Tables
    - `opportunities` - Job postings and other opportunities
  
  2. Security
    - Enable RLS on all tables
    - Add policies for different access levels
*/

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  remote BOOLEAN NOT NULL DEFAULT false,
  compensation TEXT,
  deadline DATE,
  contact_email TEXT NOT NULL,
  website TEXT,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  organization TEXT NOT NULL,
  posted_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[]
);

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for opportunities table

-- Anyone can read published opportunities
CREATE POLICY "Anyone can read published opportunities"
  ON opportunities
  FOR SELECT
  USING (status = 'published');

-- Posters can read, update, and delete their own opportunities
CREATE POLICY "Posters can read their own opportunities"
  ON opportunities
  FOR SELECT
  USING (
    posted_by IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Posters can update their own opportunities"
  ON opportunities
  FOR UPDATE
  USING (
    posted_by IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Posters can delete their own opportunities"
  ON opportunities
  FOR DELETE
  USING (
    posted_by IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can create opportunities
CREATE POLICY "Authenticated users can create opportunities"
  ON opportunities
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    posted_by IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Superadmins can do anything with opportunities
CREATE POLICY "Superadmins can manage all opportunities"
  ON opportunities
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );