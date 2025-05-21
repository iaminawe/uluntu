import { EntityStatus } from '../../data/mock/mockData';

// Types for MarketplaceEditPage components

export type ListingType = 'product' | 'service' | 'equipment';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

export interface FormData {
  title: string;
  description: string;
  type: ListingType;
  status: EntityStatus;
  price: string;
  condition: ListingCondition | '';
  location: string;
  tags: string[];
  newTag: string;
  featured: boolean;
}

export interface SampleListing {
  id: number;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  condition: ListingCondition;
  location: string;
  tags: string[];
  status: EntityStatus;
  featured: boolean;
}

export interface BasicInfoSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  getTypeIcon: (type: ListingType) => JSX.Element;
  isSubmitting: boolean;
}

export interface ImagesGallerySectionProps {
  images: string[];
  handleRemoveImage: (index: number) => void;
  isSubmitting: boolean;
}

export interface TagsSectionProps {
  tags: string[];
  newTag: string;
  handleTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  isSubmitting: boolean;
}

export interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}
