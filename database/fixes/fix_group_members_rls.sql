-- Fix infinite recursion in group_members table

-- Drop all policies on group_members table
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT polname 
        FROM pg_policy p
        JOIN pg_class c ON c.oid = p.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'group_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', pol.polname);
        RAISE NOTICE 'Dropped policy: %', pol.polname;
    END LOOP;
END $$;

-- Create simple policy for group_members
CREATE POLICY "public_can_read_group_members"
    ON public.group_members
    FOR SELECT
    USING (true);

-- Test that we can now query events with joins
SELECT 'Testing events with joins...' as test, COUNT(*) as count
FROM events e
LEFT JOIN event_sessions es ON es.event_id = e.id
WHERE e.status = 'published';

-- Check what policies exist now
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'group_members';