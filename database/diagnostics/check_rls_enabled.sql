-- Check if RLS is actually enabled on the tables
-- Sometimes RLS policies exist but RLS itself is disabled

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity THEN 'RLS is ENABLED - policies will be enforced'
        ELSE 'RLS is DISABLED - policies exist but are NOT enforced!'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'events', 'groups')
ORDER BY tablename;

-- If RLS is disabled, enable it:
-- ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Check what policies currently exist
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual as using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('companies', 'events')
ORDER BY tablename, policyname;

-- Test if we can query the tables
SELECT 'Companies test' as test, COUNT(*) as count FROM public.companies;
SELECT 'Events test' as test, COUNT(*) as count FROM public.events WHERE status = 'published';

-- If RLS needs to be enabled, uncomment and run these:
/*
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
*/