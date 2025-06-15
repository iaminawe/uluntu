-- Fix infinite recursion in groups table RLS policies

-- STEP 1: Drop ALL existing policies on groups table
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on groups
    FOR pol IN 
        SELECT polname 
        FROM pg_policy p
        JOIN pg_class c ON c.oid = p.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'groups'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.groups', pol.polname);
        RAISE NOTICE 'Dropped policy: %', pol.polname;
    END LOOP;
END $$;

-- STEP 2: Create simple, non-recursive policies for groups

-- Allow everyone to read published open/closed groups
CREATE POLICY "anyone_can_read_published_groups"
    ON public.groups
    FOR SELECT
    USING (
        status = 'published' 
        AND visibility IN ('open', 'closed')
    );

-- STEP 3: Verify the new policies
SELECT 
    c.relname as table_name,
    pol.polname as policy_name,
    CASE pol.polcmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
    END as operation,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relname = 'groups'
ORDER BY pol.polname;

-- STEP 4: Test the query
SELECT 'Testing groups query:' as test, COUNT(*) as count 
FROM public.groups 
WHERE status = 'published' 
AND visibility IN ('open', 'closed');

-- STEP 5: Show sample data
SELECT id, name, visibility, status 
FROM public.groups 
WHERE status = 'published' 
AND visibility IN ('open', 'closed')
LIMIT 5;