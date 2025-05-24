/*
  # Create user roles table

  1. New Tables
    - `user_roles`
      - `user_id` (uuid, references auth.users.id)
      - `role` (text)
  2. Security
    - Enable RLS on `user_roles` table
    - Add policies for superadmins to manage all roles
    - Add policies for users to read their own roles
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  PRIMARY KEY (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Superadmins can do anything with roles
CREATE POLICY "Superadmins can manage all roles"
  ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Users can read their own roles
CREATE POLICY "Users can read their own roles"
  ON user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Insert initial superadmin (this would be replaced with your actual admin user ID in production)
-- This is just a placeholder for demonstration
-- Commented out to avoid foreign key constraint error during initial setup
-- INSERT INTO user_roles (user_id, role)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'superadmin')
-- ON CONFLICT (user_id, role) DO NOTHING;