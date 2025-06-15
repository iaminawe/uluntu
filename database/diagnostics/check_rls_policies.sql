-- Check current RLS policies for companies, events, and groups tables
-- This will show all policies currently active on these tables

-- Check if RLS is enabled on the tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'events', 'groups')
ORDER BY tablename;

-- List all policies on these tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'events', 'groups')
ORDER BY tablename, policyname;

-- Check if the is_superadmin function exists
SELECT 
    proname,
    pronargs,
    proargtypes,
    prosecdef
FROM pg_proc
WHERE proname IN ('is_superadmin', 'is_superadmin_direct')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');