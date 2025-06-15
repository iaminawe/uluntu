-- Step 1: Check your current user info and roles
-- Run this query first to see your user ID and current roles
SELECT 
  u.id as user_id,
  u.email,
  ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = auth.email();  -- This gets your currently logged in email

-- Step 2: After you see your user_id above, uncomment and run this to assign superadmin role
-- Replace 'your-user-id-here' with the actual user_id from step 1
/*
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'superadmin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- Step 3: Verify the role was added
-- Run this after step 2 to confirm
/*
SELECT 
  u.id as user_id,
  u.email,
  ur.role
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE u.id = 'your-user-id-here';
*/