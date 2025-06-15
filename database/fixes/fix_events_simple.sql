-- Simple fix for events RLS policies

-- Drop all existing policies on events table
DROP POLICY IF EXISTS "anyone_can_read_published_events" ON public.events;
DROP POLICY IF EXISTS "authenticated_users_can_read_all_events" ON public.events;
DROP POLICY IF EXISTS "authenticated_can_read_all_events" ON public.events;
DROP POLICY IF EXISTS "public_can_read_published_events" ON public.events;

-- Create a single simple policy for events
CREATE POLICY "public_read_published_events"
    ON public.events
    FOR SELECT
    USING (status = 'published');

-- Check if event_sessions table exists and add a simple policy
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_sessions') THEN
        -- Drop any existing policies
        EXECUTE 'DROP POLICY IF EXISTS "anyone_can_read_event_sessions" ON public.event_sessions';
        EXECUTE 'DROP POLICY IF EXISTS "public_read_event_sessions" ON public.event_sessions';
        
        -- Create a simple policy that allows reading all event_sessions
        -- (the join with events will filter to only published events anyway)
        EXECUTE 'CREATE POLICY "public_read_event_sessions"
            ON public.event_sessions
            FOR SELECT
            USING (true)';
    END IF;
END $$;

-- Test the query
SELECT 'Testing events query...' as info, COUNT(*) as count 
FROM events 
WHERE status = 'published';

-- Show current policies
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('events', 'event_sessions')
ORDER BY tablename, policyname;