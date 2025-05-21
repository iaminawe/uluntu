// Types for UpcomingEvents component
import { Event } from '../../data/mock/mockData';

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
