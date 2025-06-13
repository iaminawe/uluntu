// Types for GroupEditPage components
export interface FormData {
  name: string;
  description: string;
  longDescription: string;
  heroImage: string;
  coverImage: string;
  visibility: 'open' | 'closed' | 'secret';
  interests: string[];
}

export type LoadingStateProps = Record<string, never>;

export interface FormHeaderProps {
  isEditMode: boolean;
  groupName: string;
}

export interface GroupInfoProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<FormData>;
}

export interface VisibilitySelectProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export interface ImageUploadProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<FormData>;
}

export interface FormActionsProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  navigate: (path: string) => void;
  id?: string;
}
