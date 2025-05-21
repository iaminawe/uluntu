// Types for ResourceEditPage components
import { EntityStatus } from '../../data/mock/mockData';

export type ResourceType = 'document' | 'video' | 'image' | 'link' | 'presentation';

export interface FormData {
  title: string;
  description: string;
  status: EntityStatus;
  featured: boolean;
  type: ResourceType;
  url: string;
  tags: string[];
  groupId: string;
  newTag: string;
}

export interface LoadingStateProps {
  // Can include any customization props in the future
}

export interface FormHeaderProps {
  isEditing: boolean;
}

export interface ResourceDetailsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface TagsInputProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
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
