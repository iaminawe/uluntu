-- Remove problematic RLS policies and create simple ones
-- This script removes any policies that might cause infinite recursion

-- STEP 1: Drop ALL existing policies on companies and events
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on companies
    FOR pol IN 
        SELECT polname 
        FROM pg_policy p
        JOIN pg_class c ON c.oid = p.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'companies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', pol.polname);
    END LOOP;
    
    -- Drop all policies on events
    FOR pol IN 
        SELECT polname 
        FROM pg_policy p
        JOIN pg_class c ON c.oid = p.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'events'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.events', pol.polname);
    END LOOP;
END $$;

-- STEP 2: Create minimal, simple policies that won't cause recursion

-- COMPANIES - Just allow everyone to read
CREATE POLICY "anyone_can_read_companies"
    ON public.companies
    FOR SELECT
    USING (true);

-- EVENTS - Allow reading published events only
CREATE POLICY "anyone_can_read_published_events"
    ON public.events
    FOR SELECT
    USING (status = 'published');

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
AND c.relname IN ('companies', 'events')
ORDER BY c.relname, pol.polname;

-- STEP 4: Test the queries
SELECT 'Testing companies query:' as test, COUNT(*) as count FROM public.companies;
SELECT 'Testing events query:' as test, COUNT(*) as count FROM public.events WHERE status = 'published';