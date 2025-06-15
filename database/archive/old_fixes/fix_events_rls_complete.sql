-- Fix RLS policies for events and related tables

-- First, drop all existing policies on events table to start fresh
DO $$
DECLARE
    pol RECORD;
BEGIN
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

-- Create simple policies for events table
CREATE POLICY "anyone_can_read_published_events"
    ON public.events
    FOR SELECT
    USING (status = 'published');

-- Check if event_sessions table exists and add policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_sessions') THEN
        -- Drop existing policies
        FOR pol IN 
            SELECT polname 
            FROM pg_policy p
            JOIN pg_class c ON c.oid = p.polrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = 'event_sessions'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.event_sessions', pol.polname);
        END LOOP;
        
        -- Create policy for event_sessions
        EXECUTE 'CREATE POLICY "anyone_can_read_event_sessions"
            ON public.event_sessions
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.events 
                    WHERE events.id = event_sessions.event_id 
                    AND events.status = ''published''
                )
            )';
    END IF;
END $$;

-- Also check for event_presenters table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_presenters') THEN
        -- Drop existing policies
        FOR pol IN 
            SELECT polname 
            FROM pg_policy p
            JOIN pg_class c ON c.oid = p.polrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = 'event_presenters'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.event_presenters', pol.polname);
        END LOOP;
        
        -- Create policy for event_presenters
        EXECUTE 'CREATE POLICY "anyone_can_read_event_presenters"
            ON public.event_presenters
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.events 
                    WHERE events.id = event_presenters.event_id 
                    AND events.status = ''published''
                )
            )';
    END IF;
END $$;

-- Test the events query that was failing
SELECT 
    'Testing events with joins...' as test,
    COUNT(*) as event_count
FROM events e
LEFT JOIN event_sessions es ON es.event_id = e.id
WHERE e.status = 'published';

-- Check what policies exist now
SELECT 
    tablename,
    policyname,
    cmd,
    pg_get_expr(pol.polqual, pol.polrelid) as using_clause
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relname IN ('events', 'event_sessions', 'event_presenters')
ORDER BY tablename, policyname;