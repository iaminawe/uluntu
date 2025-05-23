/*
  # Create companies table and related tables

  1. Tables
    - `companies` - Company information
    - `company_members` - Relationship between companies and members
  
  2. Security
    - Enable RLS on all tables
    - Add policies for different access levels
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo TEXT NOT NULL,
  cover_image TEXT,
  industry TEXT[] NOT NULL,
  size TEXT NOT NULL,
  founded TEXT NOT NULL,
  location TEXT NOT NULL,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false
);

-- Create company_members table
CREATE TABLE IF NOT EXISTS company_members (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  role TEXT,
  joined_date DATE,
  PRIMARY KEY (company_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table

-- Anyone can read published companies
CREATE POLICY "Anyone can read published companies"
  ON companies
  FOR SELECT
  USING (status = 'published');

-- Company members can read, update, and delete their companies
CREATE POLICY "Company members can read their companies"
  ON companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = companies.id
      AND company_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Company members can update their companies"
  ON companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = companies.id
      AND company_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Company members can delete their companies"
  ON companies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = companies.id
      AND company_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Authenticated users can create companies
CREATE POLICY "Authenticated users can create companies"
  ON companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Superadmins can do anything with companies
CREATE POLICY "Superadmins can manage all companies"
  ON companies
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create policies for company_members table

-- Anyone can read company members
CREATE POLICY "Anyone can read company members"
  ON company_members
  FOR SELECT
  USING (true);

-- Company members can manage their own company memberships
CREATE POLICY "Company members can manage their own company memberships"
  ON company_members
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Superadmins can do anything with company members
CREATE POLICY "Superadmins can manage all company members"
  ON company_members
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );