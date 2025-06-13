import { Database } from '../types/supabase';
import { Event as FrontendEvent, EventSession } from '../types'; // Assuming EventSession is defined in ../types
import { ContentStatus } from '../types/common';
// We might need Member type if we strongly type the organizer from 'members' table
// import { Member as FrontendMember } from '../types'; 

type SupabaseEvent = Database['public']['Tables']['events']['Row'];
type SupabaseMember = Database['public']['Tables']['members']['Row']; // For organizer
// Assuming event_sessions table exists and has a Row type
type SupabaseEventSession = Database['public']['Tables']['event_sessions']['Row']; 

// Placeholder for adapting event sessions if needed
// This would need its own detailed adapter if structures differ significantly
function adaptEventSessionsFromSupabase(sessions: SupabaseEventSession[]): EventSession[] {
  return sessions.map(session => ({
    id: session.id,
    title: session.title,
    description: session.description || '', // EventSession.description is string
    startTime: session.start_time, // Map to startTime
    endTime: session.end_time,     // Map to endTime
    presenters: [], // Default to empty array as presenters are not directly on SupabaseEventSession
    videoUrl: session.video_url || undefined, // video_url is string | null in Supabase
    resources: [], // Default to empty array, map if SupabaseEventSession has resources
  }));
}

export function adaptEventFromDatabase(
  dbEvent: SupabaseEvent & { 
    members?: Partial<Pick<SupabaseMember, 'id' | 'name' | 'image'>>; // Organizer from joined members table
    event_sessions?: SupabaseEventSession[]; // Joined event_sessions
  }
): FrontendEvent {
  // First, ensure dbEvent is valid
  if (!dbEvent) {
    console.error('Invalid dbEvent passed to adaptEventFromDatabase:', dbEvent);
    // Return a minimal valid event to prevent crashes
    return {
      id: 'error-event-id',
      title: 'Error Loading Event',
      description: 'There was an error loading this event.',
      date: new Date().toISOString(),
      location: 'Unknown',
      image: '/placeholder-event.jpg',
      organizer: {
        id: 'error-organizer-id',
        name: 'Unknown Organizer',
        image: '/placeholder-avatar.png'
      },
      type: 'in-person',
      status: 'draft',
      featured: false,
      created_at: new Date().toISOString(),
    } as FrontendEvent;
  }
  
  const defaultOrganizer = {
    id: dbEvent.organizer_id || 'default-organizer-id', // Fallback if organizer_id is null
    name: 'Unknown Organizer',
    image: '/placeholder-avatar.png',
  };

  let organizer: FrontendEvent['organizer'] = defaultOrganizer;

  // Handle organizer data more robustly
  try {
    if (dbEvent.members) { // if members data is joined (for organizer)
      organizer = {
        id: dbEvent.members.id || dbEvent.organizer_id || 'member-organizer-id', // Prefer member.id, fallback to organizer_id
        name: dbEvent.members.name || 'Organizer Name',
        image: dbEvent.members.image || '/placeholder-avatar.png',
      };
    } else if (dbEvent.organizer_id) {
      // If only organizer_id is present, we can't fill name/image without another query
      organizer = {
        id: dbEvent.organizer_id,
        name: 'Organizer (Details Pending)', // Indicate that full details aren't loaded
        image: '/placeholder-avatar.png',
      };
    }
  } catch (error) {
    console.error('Error processing organizer data:', error);
    // Keep the default organizer if there's an error
  }

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    date: dbEvent.date,
    endDate: dbEvent.end_date || undefined,
    location: dbEvent.location || '',
    address: dbEvent.address || undefined,
    latitude: undefined, // Not in SupabaseEvent
    longitude: undefined, // Not in SupabaseEvent
    image: dbEvent.image || '/placeholder-event.jpg', // Default placeholder
    organizer: organizer,
    attendees: dbEvent.current_attendees || 0, // FrontendEvent.attendees is number | undefined
    max_attendees: dbEvent.max_attendees,      // FrontendEvent.max_attendees is number | null | undefined
    current_attendees: dbEvent.current_attendees, // FrontendEvent.current_attendees is number | null | undefined
    type: dbEvent.type as FrontendEvent['type'], // Cast, ensure values align
    url: dbEvent.url || undefined,
    group_id: dbEvent.group_id || undefined,
    sessions: dbEvent.event_sessions ? adaptEventSessionsFromSupabase(dbEvent.event_sessions) : [],
    status: dbEvent.status as ContentStatus, // Cast to ContentStatus
    featured: dbEvent.featured || false,
    created_at: dbEvent.created_at,
  };
}

type SupabaseEventInsert = Database['public']['Tables']['events']['Insert'];
type SupabaseEventUpdate = Database['public']['Tables']['events']['Update'];

export function adaptEventToSupabaseInsert(
  event: Partial<Omit<FrontendEvent, 'id' | 'created_at' | 'organizer' | 'sessions' | 'attendees' | 'current_attendees' | 'max_attendees'>> & 
         { organizer_id?: string; group_id?: string; current_attendees?: number; max_attendees?: number }
): SupabaseEventInsert {

  if (!event.title) throw new Error("Event title is required for insert.");
  if (!event.date) throw new Error("Event date is required for insert.");
  if (!event.description) throw new Error("Event description is required for insert.");
  if (!event.location) throw new Error("Event location is required for insert.");
  if (!event.image) throw new Error("Event image is required for insert.");
  if (!event.organizer_id) throw new Error("Event organizer_id is required for insert.");

  return {
    title: event.title, // Non-nullable
    description: event.description, // Non-nullable
    date: event.date, // Non-nullable
    location: event.location, // Non-nullable
    image: event.image, // Non-nullable
    organizer_id: event.organizer_id, // Non-nullable
    end_date: event.endDate === undefined ? null : event.endDate, 
    address: event.address === undefined ? null : event.address, 
    type: event.type || 'in-person', 
    url: event.url === undefined ? null : event.url, 
    max_attendees: event.max_attendees === undefined ? null : event.max_attendees, 
    current_attendees: event.current_attendees === undefined ? null : event.current_attendees, 
    group_id: event.group_id === undefined ? null : event.group_id, 
    status: event.status || 'draft', 
    featured: event.featured || false, 
  };
}

export function adaptEventToSupabaseUpdate(
  event: Partial<FrontendEvent> & { organizer_id?: string } 
): Partial<SupabaseEventUpdate> {
  const updateData: Partial<SupabaseEventUpdate> = {};

  if (event.title !== undefined) updateData.title = event.title;
  if (event.description !== undefined) updateData.description = event.description;
  if (event.date !== undefined) updateData.date = event.date;
  if (event.endDate !== undefined) updateData.end_date = event.endDate;
  if (event.location !== undefined) updateData.location = event.location;
  if (event.address !== undefined) updateData.address = event.address;
  if (event.image !== undefined) updateData.image = event.image;
  if (event.type !== undefined) updateData.type = event.type;
  if (event.url !== undefined) updateData.url = event.url;
  if (event.max_attendees !== undefined) updateData.max_attendees = event.max_attendees;
  if (event.current_attendees !== undefined) updateData.current_attendees = event.current_attendees;
  
  if (event.organizer_id !== undefined) {
    updateData.organizer_id = event.organizer_id;
  } else if (event.organizer && event.organizer.id !== undefined) {
    updateData.organizer_id = event.organizer.id;
  }
  
  if (event.group_id !== undefined) updateData.group_id = event.group_id;
  if (event.status !== undefined) updateData.status = event.status;
  if (event.featured !== undefined) updateData.featured = event.featured;

  return updateData;
}