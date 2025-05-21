// Types for EventEditPage components
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
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export interface FormActionsProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  navigate: (path: string) => void;
  id?: string;
}
