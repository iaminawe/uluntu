// Types for ResourceEditPage components
import { ContentStatus } from '../../data/mock/types';
import { Resource } from '../../types';

// Use the type from the main application's Resource type
export type ResourceType = Resource['type'];

export interface FormData {
  title: string;
  slug: string;
  description: string;
  status: ContentStatus;
  featured: boolean;
  type: ResourceType;
  url: string;
  tags: string[];
  groupId: string;
  newTag: string;
}

export type LoadingStateProps = Record<string, never>;

export interface FormHeaderProps {
  isEditing: boolean;
}

export interface ResourceDetailsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface TagsInputProps {
  formData: FormData;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData?: React.Dispatch<React.SetStateAction<FormData>>;
  handleAddTag?: () => void;
  handleRemoveTag?: (tagToRemove: string) => void;
}

export interface UrlInputProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface ResourceTypeSelectProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface GroupSelectProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface StatusOptionsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export interface FormActionsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  formData: FormData;
  setShowDeleteConfirm: (show: boolean) => void;
}

export interface DeleteConfirmProps {
  show: boolean;
  setShow: (show: boolean) => void;
  handleDelete: () => void;
  isSubmitting: boolean;
}
