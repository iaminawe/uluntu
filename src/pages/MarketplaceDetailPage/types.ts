// Types for MarketplaceDetailPage components

export type ListingType = 'product' | 'service' | 'equipment';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

export interface Listing {
  id: number;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  condition?: ListingCondition;
  images: string[];
  createdAt: string;
  seller: {
    id: number;
    name: string;
    image: string;
    title?: string;
    bio?: string;
  };
  location: string;
  tags: string[];
}

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

export interface LoadingStateProps {
  // Can include any customization props in the future
}

export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
