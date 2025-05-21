import { EntityStatus } from '../../data/mock/mockData';

export interface FormData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  tags: string[];
  authorId: number;
  status: EntityStatus;
  featured: boolean;
}

export interface LoadingStateProps {
  // Can include any customization props in the future
}

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
}
