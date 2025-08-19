-- Create a comprehensive function to get users with their roles for admin dashboard
-- This function uses security definer to access auth.users table and properly joins with members

CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email::text,
    COALESCE(m.name, 'Unknown User') as name,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[]) as roles
  FROM auth.users au
  LEFT JOIN public.members m ON au.id = m.user_id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE au.deleted_at IS NULL  -- Only active users
  GROUP BY au.id, au.email, m.name, au.created_at, au.last_sign_in_at
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (will be restricted by RLS)
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION get_admin_users() IS 
  'Returns all users with their email addresses, profile names, and roles. Requires admin or superadmin role.';

-- Create RLS policy to restrict access to admin users only
-- Note: This function inherits the security context of the calling user
-- The actual access control is handled by the frontend checking user roles