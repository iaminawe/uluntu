// EventsList types
import { Event as MainEvent } from '../../types';

export type EventType = MainEvent['type'];
export type DateRangeFilter = 'upcoming' | 'month' | 'three-months' | 'all';

// Local EventOrganizer interface that matches the main Event's organizer structure
export interface EventOrganizer {
  id: string;
  name: string;
  image: string;
}

// Local Event interface for the EventsList component
export interface Event {
  id: string;
  slug?: string;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  image: string;
  organizer: EventOrganizer;
  attendees?: number;
  type: EventType;
  url?: string;
}

// Adapter function to convert from main Event type to local Event type
export const adaptMainEventToLocal = (event: MainEvent): Event => {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.date,
    endDate: event.endDate,
    location: event.location,
    description: event.description,
    image: event.image,
    organizer: {
      id: event.organizer.id,
      name: event.organizer.name,
      image: event.organizer.image
    },
    attendees: event.attendees,
    type: event.type,
    url: event.url
  };
};

// Adapter function to convert from local Event type to main Event type
export const adaptLocalToMainEvent = (event: Event): Partial<MainEvent> => {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.date,
    endDate: event.endDate,
    location: event.location,
    description: event.description,
    image: event.image,
    organizer: {
      id: event.organizer.id,
      name: event.organizer.name,
      image: event.organizer.image
    },
    attendees: event.attendees,
    type: event.type,
    url: event.url
  };
};

 
export interface EventFilters {
  search?: string;
  types?: EventType[];
  dateRange?: DateRangeFilter;
}

// Props for the EventsList component
export interface EventsListProps {
  initialSearch?: string;
  parentEvents?: MainEvent[];
  parentLoading?: boolean;
  parentError?: string | null;
}
