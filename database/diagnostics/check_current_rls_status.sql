-- Check current RLS status and policies

-- 1. Check if RLS is enabled on the tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'events', 'groups')
ORDER BY tablename;

-- 2. List all current policies on these tables
SELECT 
    tablename,
    policyname,
    cmd as "Operation",
    permissive,
    roles,
    qual as "USING clause",
    with_check as "WITH CHECK clause"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('companies', 'events', 'groups')
ORDER BY tablename, policyname;

-- 3. Test queries to see if they work
-- Test public read access
SELECT 'Companies count:' as test, COUNT(*) as count FROM public.companies;
SELECT 'Published events count:' as test, COUNT(*) as count FROM public.events WHERE status = 'published';
SELECT 'Published groups count:' as test, COUNT(*) as count FROM public.groups WHERE visibility IN ('open', 'closed') AND status = 'published';

-- 4. Check if the is_superadmin function exists
SELECT 
    proname as function_name,
    proargtypes,
    prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'is_superadmin' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 5. Check for any error-causing policies
-- Look for policies that might reference non-existent tables/columns
SELECT 
    tablename,
    policyname,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('companies', 'events', 'groups')
AND (
    qual LIKE '%company_members%' 
    OR qual LIKE '%user_roles%'
    OR qual LIKE '%is_superadmin%'
);