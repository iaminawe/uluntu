-- Diagnostic script to identify RLS issues

-- 1. First, let's check what's actually causing the errors
-- Run simple test queries to isolate the problem

-- Test 1: Can we query companies table at all?
BEGIN;
SELECT 'Test 1: Basic companies query' as test;
SELECT COUNT(*) FROM public.companies;
ROLLBACK;

-- Test 2: Can we query events table at all?
BEGIN;
SELECT 'Test 2: Basic events query' as test;
SELECT COUNT(*) FROM public.events;
ROLLBACK;

-- Test 3: Check if the issue is with specific policies
-- Temporarily disable RLS to test
BEGIN;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
SELECT 'Test 3: Query with RLS disabled' as test;
SELECT COUNT(*) as companies_count FROM public.companies;
SELECT COUNT(*) as events_count FROM public.events;
-- Re-enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ROLLBACK;

-- 2. Check for circular dependencies in policies
SELECT 
    n.nspname as schema,
    c.relname as table,
    pol.polname as policy,
    CASE pol.polcmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
    END as operation,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relname IN ('companies', 'events', 'groups', 'user_roles')
ORDER BY c.relname, pol.polname;

-- 3. Check if is_superadmin function exists and what it does
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' 
AND p.proname = 'is_superadmin';

-- 4. Check user_roles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 5. Look for any policies that might be causing infinite recursion
-- This query shows all policies that reference other tables
WITH policy_dependencies AS (
    SELECT 
        c.relname as table_name,
        pol.polname as policy_name,
        pg_get_expr(pol.polqual, pol.polrelid) as using_clause,
        pg_get_expr(pol.polwithcheck, pol.polrelid) as check_clause
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
)
SELECT 
    table_name,
    policy_name,
    using_clause,
    check_clause,
    CASE 
        WHEN using_clause LIKE '%user_roles%' THEN 'References user_roles'
        WHEN using_clause LIKE '%is_superadmin%' THEN 'Uses is_superadmin function'
        WHEN using_clause LIKE '%auth.uid()%' THEN 'Uses auth.uid()'
        ELSE 'No special references'
    END as dependency_type
FROM policy_dependencies
WHERE table_name IN ('companies', 'events', 'groups', 'user_roles')
ORDER BY table_name, policy_name;