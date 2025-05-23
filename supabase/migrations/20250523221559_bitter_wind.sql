/*
  # Create user roles table

  1. Tables
    - `user_roles` - Stores user roles for authorization
  
  2. Security
    - Enable RLS on `user_roles` table
    - Add policies for superadmin access
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('authenticated', 'member', 'superadmin')),
  PRIMARY KEY (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table

-- Superadmins can do anything with user roles
CREATE POLICY "Superadmins can manage all user roles"
  ON user_roles
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'superadmin'
    )
  );

-- Users can read their own roles
CREATE POLICY "Users can read their own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to automatically assign 'authenticated' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'authenticated');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign role on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();