/*
  # Create companies table and related tables

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text)
      - `description` (text)
      - `logo` (text)
      - `cover_image` (text)
      - `industry` (text[])
      - `size` (text)
      - `founded` (text)
      - `location` (text)
      - `website` (text)
      - `status` (text)
      - `featured` (boolean)
    - `company_members`
      - `company_id` (uuid, references companies.id)
      - `member_id` (uuid, references members.id)
      - `role` (text)
      - `joined_date` (date)
  2. Security
    - Enable RLS on both tables
    - Add policies for different user roles
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

-- Company members can read their companies regardless of status
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

-- Company members can update their companies
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

-- Company members can manage their company's members
CREATE POLICY "Company members can manage their company's members"
  ON company_members
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = company_members.company_id
      AND cm.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can add themselves to companies
CREATE POLICY "Users can add themselves to companies"
  ON company_members
  FOR INSERT
  WITH CHECK (
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