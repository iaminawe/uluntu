-- SQL script to assign the 'authenticated' role to the user
-- Run this in your Supabase SQL Editor or database client

-- First, check if the user already has roles
SELECT 
    ur.user_id,
    ur.role,
    au.email
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.user_id = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';

-- If no results, then assign the authenticated role
INSERT INTO user_roles (user_id, role)
VALUES ('54fd6d34-5d30-4ad0-9c53-fc24aa0412b8', 'authenticated')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the assignment
SELECT 
    ur.user_id,
    ur.role,
    au.email,
    ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.user_id = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8'
ORDER BY ur.created_at;