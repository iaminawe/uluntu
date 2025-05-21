import { EntityStatus } from '../../data/mock/mockData';

// Types for OpportunityEditPage components

export type OpportunityType = 'job' | 'volunteer' | 'funding' | 'community';

export interface FormData {
  title: string;
  description: string;
  type: OpportunityType;
  organization: string;
  location: string;
  deadline: string;
  contactEmail: string;
  website: string;
  image: string;
  compensation: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: EntityStatus;
  featured: boolean;
}

export interface FormSectionProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onDescriptionChange: (data: string) => void;
  isSubmitting: boolean;
}

export interface ListSectionProps {
  items: string[];
  newItem: string;
  setNewItem: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  label: string;
  placeholder: string;
  isSubmitting: boolean;
}

export interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface OpportunityData {
  id: number;
  title: string;
  description: string;
  type: OpportunityType;
  organization: string;
  location: string;
  compensation: string;
  deadline: string;
  contactEmail: string;
  website: string;
  image: string;
  status: EntityStatus;
  featured: boolean;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}
