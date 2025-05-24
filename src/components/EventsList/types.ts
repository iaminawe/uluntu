// EventsList types

export type EventType = 'in-person' | 'online' | 'hybrid';
export type DateRangeFilter = 'upcoming' | 'month' | 'three-months' | 'all';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventOrganizer {
  id: number;
  name: string;
  image: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventFilters {
  search?: string;
  types?: EventType[];
  dateRange?: DateRangeFilter;
}
