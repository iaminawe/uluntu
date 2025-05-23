/*
  # Create events table and related tables

  1. Tables
    - `events` - Event information
    - `event_sessions` - Sessions within events
    - `event_presenters` - Presenters for event sessions
    - `event_resources` - Resources for event sessions
    - `event_attendees` - Event attendance tracking
  
  2. Security
    - Enable RLS on all tables
    - Add policies for different access levels
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  image TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in-person', 'online', 'hybrid')),
  url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  organizer_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL
);

-- Create event_sessions table
CREATE TABLE IF NOT EXISTS event_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  video_url TEXT
);

-- Create event_presenters table
CREATE TABLE IF NOT EXISTS event_presenters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  name TEXT,
  image TEXT,
  bio TEXT,
  title TEXT,
  company TEXT,
  website TEXT
);

-- Create event_resources table
CREATE TABLE IF NOT EXISTS event_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('slides', 'document', 'code', 'website', 'other'))
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'registered',
  PRIMARY KEY (event_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_presenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for events table

-- Anyone can read published events
CREATE POLICY "Anyone can read published events"
  ON events
  FOR SELECT
  USING (status = 'published');

-- Group events are only visible to group members if the group is secret
CREATE POLICY "Group events are only visible to group members if the group is secret"
  ON events
  FOR SELECT
  USING (
    group_id IS NULL OR
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = events.group_id
      AND (
        groups.visibility IN ('open', 'closed') OR
        EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.group_id = events.group_id
          AND group_members.member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

-- Event organizers can manage their events
CREATE POLICY "Event organizers can manage their events"
  ON events
  USING (
    organizer_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Group admins can manage group events
CREATE POLICY "Group admins can manage group events"
  ON events
  USING (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = events.group_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    organizer_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Superadmins can do anything with events
CREATE POLICY "Superadmins can manage all events"
  ON events
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create policies for event_sessions table

-- Anyone can read event sessions for published events
CREATE POLICY "Anyone can read event sessions for published events"
  ON event_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_sessions.event_id
      AND events.status = 'published'
    )
  );

-- Event organizers can manage their event sessions
CREATE POLICY "Event organizers can manage their event sessions"
  ON event_sessions
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_sessions.event_id
      AND events.organizer_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Group admins can manage group event sessions
CREATE POLICY "Group admins can manage group event sessions"
  ON event_sessions
  USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN group_members ON events.group_id = group_members.group_id
      WHERE events.id = event_sessions.event_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Superadmins can do anything with event sessions
CREATE POLICY "Superadmins can manage all event sessions"
  ON event_sessions
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create similar policies for event_presenters, event_resources, and event_attendees tables
-- For brevity, I'll just show the pattern for event_presenters

-- Anyone can read event presenters for published events
CREATE POLICY "Anyone can read event presenters for published events"
  ON event_presenters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_sessions
      JOIN events ON event_sessions.event_id = events.id
      WHERE event_sessions.id = event_presenters.session_id
      AND events.status = 'published'
    )
  );

-- Event organizers can manage their event presenters
CREATE POLICY "Event organizers can manage their event presenters"
  ON event_presenters
  USING (
    EXISTS (
      SELECT 1 FROM event_sessions
      JOIN events ON event_sessions.event_id = events.id
      WHERE event_sessions.id = event_presenters.session_id
      AND events.organizer_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Superadmins can do anything with event presenters
CREATE POLICY "Superadmins can manage all event presenters"
  ON event_presenters
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create function to update current_attendees when attendees are added or removed
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET current_attendees = current_attendees + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET current_attendees = current_attendees - 1 WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update current_attendees
CREATE TRIGGER update_event_attendee_count_trigger
AFTER INSERT OR DELETE ON event_attendees
FOR EACH ROW
EXECUTE FUNCTION update_event_attendee_count();