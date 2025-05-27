// Types for MarketplaceDetailPage components
import { MarketplaceItem as MainMarketplaceItem } from '../../types';
import { ContentStatus } from '../../types/common';

export type ListingType = 'product' | 'service' | 'equipment';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

// Local Listing interface for the MarketplaceDetailPage component
export interface Listing {
  id: number;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  condition?: ListingCondition;
  images: string[];
  createdAt: string; // Note: This is datePosted in the main MarketplaceItem type
  seller: {
    id: number;
    name: string;
    image: string;
    title?: string;
    bio?: string;
  };
  location: string;
  tags: string[];
  status?: ContentStatus;
}

// Adapter function to convert from main MarketplaceItem type to local Listing type
export const adaptMainMarketplaceItemToDetail = (item: MainMarketplaceItem): Partial<Listing> => {
  return {
    id: typeof item.id === 'string' ? parseInt(item.id) : item.id as number,
    title: item.title,
    description: item.description,
    type: item.type as ListingType,
    price: item.price || 0,
    condition: item.category as ListingCondition, // Using category as condition
    images: item.image ? [item.image] : [],
    createdAt: item.datePosted,
    seller: {
      id: typeof item.seller.id === 'string' ? parseInt(item.seller.id) : item.seller.id as number,
      name: item.seller.name,
      image: item.seller.image,
      // These fields don't exist in the main type
      title: '',
      bio: ''
    },
    location: '', // This field doesn't exist in the main type
    tags: item.category ? [item.category] : [], // Using category as a tag
    status: item.status
  };
};

// Adapter function to convert from local Listing type to main MarketplaceItem type
export const adaptDetailToMainMarketplaceItem = (listing: Listing): Partial<MainMarketplaceItem> => {
  return {
    id: listing.id.toString(),
    title: listing.title,
    description: listing.description,
    type: listing.type as MainMarketplaceItem['type'],
    price: listing.price,
    category: listing.condition || listing.tags[0] || '',
    image: listing.images[0] || '',
    seller: {
      id: listing.seller.id.toString(),
      name: listing.seller.name,
      image: listing.seller.image
    },
    datePosted: listing.createdAt,
    status: listing.status
  };
};

export interface PageHeaderProps {
  id: string;
  listing: Listing;
}

export interface ListingDetailsProps {
  listing: Listing;
  getTypeIcon: (type: ListingType) => JSX.Element;
  onContactClick: () => void;
}

export interface SellerInfoProps {
  seller: Listing['seller'];
}

export interface ContactModalProps {
  listing: Listing;
  onClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoadingStateProps {
  // Can include any customization props in the future
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
