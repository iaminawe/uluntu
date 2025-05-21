// EventsList types

export type EventType = 'in-person' | 'online' | 'hybrid';
export type DateRangeFilter = 'upcoming' | 'month' | 'three-months' | 'all';

export interface EventOrganizer {
  id: number;
  name: string;
  image: string;
}

export interface Event {
  id: number;
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

export interface EventFilters {
  search?: string;
  types?: EventType[];
  dateRange?: DateRangeFilter;
}
