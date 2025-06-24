import { MarketplaceItem as MainMarketplaceItem } from '../../types';
import { ContentStatus } from '../../types/common';

// Types for MarketplaceEditPage components

export type ListingType = 'product' | 'service' | 'equipment';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

export interface FormData {
  title: string;
  description: string;
  type: ListingType;
  status: ContentStatus;
  price: string;
  condition: ListingCondition | '';
  location: string;
  tags: string[];
  newTag: string;
  featured: boolean;
  // Contact information fields
  contactEmail: string;
  contactPhone: string;
  contactMethod: 'email' | 'phone' | 'both' | '';
  showContactInfo: boolean;
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
  status: ContentStatus;
  featured: boolean;
}

// Adapter function to convert from main MarketplaceItem type to local FormData type
export const adaptMainMarketplaceItemToFormData = (item: MainMarketplaceItem): FormData => {
  return {
    title: item.title,
    description: item.description,
    type: item.type as ListingType,
    status: item.status || 'draft',
    price: item.price?.toString() || '',
    condition: item.category as ListingCondition || '',
    location: '', // This field doesn't exist in the main type
    tags: item.category ? [item.category] : [],
    newTag: '',
    featured: item.featured || false,
    contactEmail: '',
    contactPhone: '',
    contactMethod: '',
    showContactInfo: false
  };
};

// Adapter function to convert from local FormData type to main MarketplaceItem type
export const adaptFormDataToMainMarketplaceItem = (formData: FormData, id?: string): Partial<MainMarketplaceItem> => {
  return {
    id: id || '',
    title: formData.title,
    description: formData.description,
    type: formData.type as MainMarketplaceItem['type'],
    price: formData.price ? parseFloat(formData.price) : undefined,
    category: formData.condition || formData.tags[0] || '',
    image: '', // This would need to be handled separately with image uploads
    datePosted: new Date().toISOString(),
    status: formData.status,
    featured: formData.featured
  };
};

// Adapter function to convert from main MarketplaceItem type to local SampleListing type
export const adaptMainMarketplaceItemToSampleListing = (item: MainMarketplaceItem): SampleListing => {
  return {
    id: typeof item.id === 'string' ? parseInt(item.id) : item.id as number,
    title: item.title,
    description: item.description,
    type: item.type as ListingType,
    price: item.price || 0,
    condition: item.category as ListingCondition || 'new',
    location: '', // This field doesn't exist in the main type
    tags: item.category ? [item.category] : [],
    status: item.status || 'draft',
    featured: item.featured || false
  };
};

// Adapter function to convert from local SampleListing type to main MarketplaceItem type
export const adaptSampleListingToMainMarketplaceItem = (listing: SampleListing): Partial<MainMarketplaceItem> => {
  return {
    id: listing.id.toString(),
    title: listing.title,
    description: listing.description,
    type: listing.type as MainMarketplaceItem['type'],
    price: listing.price,
    category: listing.condition || listing.tags[0] || '',
    image: '', // This would need to be handled separately with image uploads
    datePosted: new Date().toISOString(),
    status: listing.status,
    featured: listing.featured
  };
};

export interface BasicInfoSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  getTypeIcon: (type: ListingType) => JSX.Element;
  isSubmitting: boolean;
}

export interface ImagesGallerySectionProps {
  images: string[];
  handleImageChange: (file: File | null) => void;
  handleRemoveImage: (index: number) => void;
  isSubmitting: boolean;
}

export interface TagsSectionProps {
  tags: string[];
  handleTagsChange: (newTags: string[]) => void;
  isSubmitting: boolean;
}

export interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export interface FormHeaderProps {
  isEditing: boolean;
}

export interface FormActionsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  formData: FormData;
  setShowDeleteConfirm: (show: boolean) => void;
}

export type LoadingStateProps = Record<string, never>;
