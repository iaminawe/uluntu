-- First, let's check what role values are available in the user_roles table
-- This will show us all distinct roles currently in the database
SELECT DISTINCT role FROM user_roles;

-- Check if your user already has any roles
SELECT * FROM user_roles WHERE user_id = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';

-- Try different approaches to insert superadmin role
-- Approach 1: Direct insert without type casting
INSERT INTO user_roles (user_id, role)
VALUES ('54fd6d34-5d30-4ad0-9c53-fc24aa0412b8', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;

-- If the above fails, try these alternatives:

-- Approach 2: If role column is an enum, try finding the exact enum value
-- First check what enum values exist:
/*
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'app_role' OR typname = 'user_role'
);
*/

-- Approach 3: If role is just text, ensure superadmin exists as a valid value
-- You might need to check constraints on the role column
/*
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'user_roles'::regclass;
*/

-- Verify the role was added
SELECT 
  u.id as user_id,
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.id = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';

-- If superadmin doesn't exist as a valid role value, you might need to:
-- 1. Add it to the enum type (if using enum)
-- 2. Update any check constraints (if using text with constraints)
-- 3. Use an existing role like 'admin' instead