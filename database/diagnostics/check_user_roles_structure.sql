-- Check the structure of the user_roles table
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- Check if there are any existing roles
SELECT DISTINCT role FROM user_roles;

-- Check if app_role type exists
SELECT typname 
FROM pg_type 
WHERE typname = 'app_role';

-- Simple insert without type casting
-- Replace with your actual user_id
INSERT INTO user_roles (user_id, role)
VALUES ('54fd6d34-5d30-4ad0-9c53-fc24aa0412b8', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify it worked
SELECT * FROM user_roles WHERE user_id = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';