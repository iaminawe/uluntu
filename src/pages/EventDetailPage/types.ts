// Types for EventDetailPage components
import { Event } from '../../types';

export interface PageHeaderProps {
  id: string;
}

export interface EventHeroProps {
  event: Event;
  dateRangeDisplay: string;
}

export interface EventInfoProps {
  event: Event;
  formattedDate: string;
  formattedTime: string;
}

export interface RegisterSidebarProps {
  event: Event;
  formattedDate: string;
  formattedTime: string;
  isRegistering: boolean;
  registrationSuccess: boolean;
  onRegister: () => void;
}

export interface EventDetailsCardProps {
  event: Event;
  formattedDate: string;
  formattedTime: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoadingStateProps {
  // Can include any customization props in the future
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
