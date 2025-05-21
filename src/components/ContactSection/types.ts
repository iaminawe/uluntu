// Types for ContactSection component

export type VolunteerType = 'attend' | 'present' | 'organize' | 'sponsor';

export interface FormData {
  volunteerType: VolunteerType;
  name: string;
  email: string;
  message: string;
}

export interface ContactSectionProps {
  title?: string;
  description?: string;
  volunteerOptions?: VolunteerOption[];
  onSubmit?: (data: FormData) => Promise<void> | void;
}

export interface VolunteerOption {
  value: VolunteerType;
  label: string;
}

export interface ContactFormProps {
  volunteerOptions: VolunteerOption[];
  onSubmit: (data: FormData) => void;
  initialData?: FormData;
}

export interface SuccessMessageProps {
  onReset: () => void;
}
