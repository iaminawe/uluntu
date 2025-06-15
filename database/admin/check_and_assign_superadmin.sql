-- Check and assign superadmin role
-- Run this in Supabase SQL Editor

-- First, let's see your current user and roles
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;

-- To assign superadmin role to your user, replace 'your-email@example.com' with your actual email
-- Step 1: Find your user ID
-- Step 2: Insert superadmin role if it doesn't exist

-- Example (replace with your email):
/*
INSERT INTO user_roles (user_id, role)
SELECT id, 'superadmin'::app_role
FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- Or if you know your user ID, use this format:
/*
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'superadmin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- Check if the role was added successfully
/*
SELECT 
  u.email,
  ur.role
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'your-email@example.com';
*/