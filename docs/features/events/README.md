# Events System Documentation

## Overview

The Uluntu features a comprehensive events system with support for:
- Multi-day conferences and workshops
- Event sessions with schedules
- Speaker/presenter profiles
- Session resources (slides, code, documents)
- Video recordings for online/hybrid events
- Attendee registration tracking

## Database Schema

### Core Tables

#### `events`
- `id` (UUID): Primary key
- `title` (TEXT): Event name
- `slug` (VARCHAR): URL-friendly identifier
- `description` (TEXT): Full event description
- `date` (TIMESTAMPTZ): Start date/time
- `end_date` (TIMESTAMPTZ): End date/time
- `location` (TEXT): General location
- `address` (TEXT): Specific street address
- `latitude`, `longitude` (NUMERIC): Coordinates
- `image` (TEXT): Event image URL
- `type` (TEXT): 'in-person' | 'online' | 'hybrid'
- `url` (TEXT): External event URL
- `status` (TEXT): 'draft' | 'published' | 'archived'
- `featured` (BOOLEAN): Featured event flag
- `organizer_id` (UUID): References members table
- `max_attendees` (INTEGER): Maximum capacity
- `current_attendees` (INTEGER): Current registration count
- `group_id` (UUID): Optional associated group

#### `event_sessions`
- `id` (UUID): Primary key
- `event_id` (UUID): References events table
- `title` (TEXT): Session title
- `description` (TEXT): Session description
- `start_time` (TIMESTAMPTZ): Session start
- `end_time` (TIMESTAMPTZ): Session end
- `video_url` (TEXT): Recording URL

#### `event_presenters`
- `id` (UUID): Primary key
- `session_id` (UUID): References event_sessions
- `member_id` (UUID): Optional reference to members table
- `name` (TEXT): Presenter name (for external speakers)
- `image` (TEXT): Presenter photo URL
- `bio` (TEXT): Presenter biography
- `title` (TEXT): Job title
- `company` (TEXT): Company name
- `website` (TEXT): Personal website

#### `event_resources`
- `id` (UUID): Primary key
- `session_id` (UUID): References event_sessions
- `title` (TEXT): Resource title
- `url` (TEXT): Resource URL
- `type` (TEXT): 'slides' | 'document' | 'code' | 'website' | 'other'

#### `event_attendees`
- `event_id` (UUID): References events
- `member_id` (UUID): References members
- `registered_at` (TIMESTAMPTZ): Registration timestamp
- `status` (TEXT): 'registered' | 'waitlisted' | 'cancelled'

## Frontend Components

### EventCard (`/src/features/events/components/EventsList/EventCard.tsx`)
Displays event summary in list views with:
- Event image and type badge
- Title, date, location
- Brief description
- Organizer info
- Attendee count

### EventSessions (`/src/pages/EventDetailPage/EventSessions.tsx`)
Renders full session schedule with:
- Session times and descriptions
- Presenter profiles with bios
- Embedded videos for recordings
- Downloadable resources
- Icons for resource types

## API Endpoints

### Get All Events
```typescript
eventsApi.getAll(filters?: {
  search?: string;
  types?: string[];
  dateRange?: string;
})
```
Returns events with sessions, presenters, and resources.

### Get Event by ID
```typescript
eventsApi.getById(id: string)
```
Returns complete event details including all nested data.

## Data Seeding

### Apply Comprehensive Event Data
```bash
# Start Supabase first
npx supabase start

# Run the seed script
./scripts/seed-events.sh

# Or manually apply
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  -f database/seeds/09_comprehensive_events_with_sessions.sql
```

### Sample Data Includes
- **10 Events**: Conferences, workshops, hackathons, pitch nights
- **29 Sessions**: Keynotes, workshops, panels, presentations
- **40+ Presenters**: Mix of community members and external speakers
- **20+ Resources**: Slides, code repos, documents, websites
- **Sample Registrations**: Attendee relationships

## Event Types

### In-Person Events
- Physical location with address
- Optional coordinates for mapping
- Capacity limits

### Online Events
- Virtual via platforms (Zoom, etc.)
- Session recordings available
- No location constraints

### Hybrid Events
- Both physical and virtual attendance
- Live streaming capabilities
- Recording for later viewing

## Features

### Session Management
- Multi-track conference support
- Time-based scheduling
- Speaker assignments
- Resource attachments

### Presenter Profiles
- Link to member profiles when applicable
- External speaker information
- Professional details (title, company, bio)
- Personal websites

### Resources
- Type-specific icons
- Direct download links
- Multiple resources per session
- Various formats supported

### Video Integration
- YouTube/Vimeo embedding
- Automatic URL conversion
- Responsive players
- Recording archives

## URL Structure

Events use slugs for SEO-friendly URLs:
```
/events/ai-machine-learning-summit-2025
/events/startup-pitch-night-q3-2025
/events/hackathon-tech-for-social-good
```

## Best Practices

1. **Always include slugs** for new events
2. **Link presenters to members** when they exist in the system
3. **Add session resources** for better attendee value
4. **Use proper UUIDs** (not custom formats)
5. **Set appropriate event types** (in-person/online/hybrid)
6. **Include coordinates** for in-person events when possible
7. **Add video URLs** for recorded sessions

## Troubleshooting

### Events Not Displaying
1. Check event status is 'published'
2. Verify organizer_id references valid member
3. Ensure dates are properly formatted
4. Check RLS policies allow public read

### Sessions Not Loading
1. Verify event_sessions foreign key to events
2. Check session times are within event date range
3. Ensure presenters have required fields

### Missing Organizer Info
1. Verify members table has organizer record
2. Check API includes member join
3. Ensure adapter handles organizer properly

## Future Enhancements

- [ ] Registration management UI
- [ ] Waitlist functionality
- [ ] Calendar exports (iCal)
- [ ] Email reminders
- [ ] Ticket/payment integration
- [ ] Virtual event platform integrations
- [ ] QR code check-in
- [ ] Post-event surveys