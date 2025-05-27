// Types for UpcomingEvents component
import { Event as MainEvent } from '../../types';

// Use the main application's Event type
export type Event = MainEvent;

export interface UpcomingEventsProps {
  title?: string;
  events?: Event[];
  maxEvents?: number;
  showViewAll?: boolean;
  className?: string;
}

export interface EventCardProps {
  event: Event;
}
