// Types for EventEditPage components
import { EventSession } from '../../types';
export interface FormData {
  title: string;
  date: string;
  endDate: string;
  location: string;
  description: string;
  image: string;
  type: 'in-person' | 'online' | 'hybrid';
  url?: string;
  organizerId: number;
  sessions?: EventSession[];
}

export interface LoadingStateProps {
  // Can include any customization props in the future
}

export interface FormHeaderProps {
  isEditMode: boolean;
  title: string;
}

export interface EventDetailsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<FormData>;
}

export interface EventImageProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export interface OrganizerSelectProps {
  organizer: {
    id: number;
    name: string;
    image: string;
  };
  onOrganizerChange: (organizer: { id: number; name: string; image: string }) => void;
}

export interface FormActionsProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  navigate: (path: string) => void;
  id?: string;
}
