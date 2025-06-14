// Types for EventEditPage components
import { Event as MainEvent, EventSession } from '../../types';
export interface FormData {
  title: string;
  date: string;
  endDate: string;
  location: string;
  description: string;
  image: string;
  type: MainEvent['type'];
  url?: string;
  organizerId: string;
  sessions?: EventSession[];
}

// Adapter function to convert from main Event type to local FormData type
export const adaptMainEventToFormData = (event: MainEvent): FormData => {
  return {
    title: event.title,
    date: event.date,
    endDate: event.endDate || '',
    location: event.location,
    description: event.description,
    image: event.image,
    type: event.type,
    url: event.url,
    organizerId: String(event.organizer.id), // Always convert to string for consistency
    sessions: event.sessions
  };
};

// Adapter function to convert from local FormData type to main Event type
export const adaptFormDataToMainEvent = (formData: FormData, id?: string): Partial<MainEvent> => {
  return {
    id: id || '',
    title: formData.title,
    date: formData.date,
    endDate: formData.endDate || undefined,
    location: formData.location,
    description: formData.description,
    image: formData.image,
    type: formData.type,
    url: formData.url,
    organizer: {
      id: formData.organizerId.toString(),
      name: '', // This would need to be populated from user data
      image: '' // This would need to be populated from user data
    },
    sessions: formData.sessions
  };
};

export type LoadingStateProps = Record<string, never>;

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
  onImageChange: (file: File | null) => void;
  isSubmitting?: boolean;
}

export interface OrganizerSelectProps {
  organizer: {
    id: string;
    name: string;
    image: string;
  };
  onOrganizerChange: (organizer: { id: string; name: string; image: string }) => void;
}

export interface FormActionsProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  navigate: (path: string) => void;
  id?: string;
}
