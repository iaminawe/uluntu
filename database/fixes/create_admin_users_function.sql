-- Create a function to get users with their roles for admin dashboard
-- This function uses security definer to access auth.users table

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
    ARRAY_AGG(ur.role) as roles
  FROM auth.users au
  LEFT JOIN public.members m ON au.id = m.user_id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = au.id
  )
  GROUP BY au.id, au.email, m.name, au.created_at, au.last_sign_in_at
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;

-- Create RLS policy to restrict access to admin users only
CREATE POLICY "Admin users can call get_admin_users"
ON auth.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'superadmin')
  )
);