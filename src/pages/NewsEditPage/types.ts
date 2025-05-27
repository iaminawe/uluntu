import { ContentStatus } from '../../types/common';

export interface FormData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  tags: string[];
  authorId: number;
  status: ContentStatus;
  featured: boolean;
}

export type LoadingStateProps = Record<string, never>;

export interface FormHeaderProps {
  isEditMode: boolean;
  title: string;
}

export interface TagsInputProps {
  tags: string[];
  newTag: string;
  setNewTag: (tag: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  errors: Partial<FormData>;
}

export interface FormInputsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<FormData>;
}

export interface FormActionsProps {
  isEditMode: boolean;
  formData: FormData;
  isSubmitting: boolean;
  navigate: (path: string) => void;
  id?: string;
  setShowDeleteConfirm: (show: boolean) => void;
}

export interface DeleteConfirmModalProps {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleDelete: () => void;
  isSubmitting?: boolean;
}
