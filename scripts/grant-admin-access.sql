-- Grant admin access to the current user
-- Run this in Supabase SQL Editor

-- First, let's see current user info
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email;

-- Check if member profile exists
SELECT 
    id, name, email, status 
FROM members 
WHERE user_id = auth.uid();

-- Check current roles
SELECT 
    role, created_at 
FROM user_roles 
WHERE user_id = auth.uid();

-- Create member profile if it doesn't exist
INSERT INTO members (user_id, name, email, status, slug)
SELECT 
    auth.uid(),
    COALESCE(split_part(auth.email(), '@', 1), 'admin'),
    auth.email(),
    'published',
    COALESCE(lower(replace(split_part(auth.email(), '@', 1), ' ', '-')), 'admin')
WHERE NOT EXISTS (
    SELECT 1 FROM members WHERE user_id = auth.uid()
);

-- Grant admin role if it doesn't exist
INSERT INTO user_roles (user_id, role)
SELECT auth.uid(), 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
);

-- Verify the setup
SELECT 
    'User Setup Complete' as status,
    m.name as member_name,
    m.email as member_email,
    array_agg(ur.role) as roles
FROM members m
LEFT JOIN user_roles ur ON ur.user_id = m.user_id
WHERE m.user_id = auth.uid()
GROUP BY m.id, m.name, m.email;