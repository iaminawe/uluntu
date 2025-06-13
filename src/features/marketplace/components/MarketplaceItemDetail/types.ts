// MarketplaceItemDetail types
import { MarketplaceItem as MainMarketplaceItem } from '../../types';
import { ContentStatus } from '../../types/common';

export type ListingType = 'product' | 'service' | 'equipment';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

// Local Listing interface for the MarketplaceItemDetail component
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
    tags: [item.category], // Using category as a tag
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

// Sample data
export const SAMPLE_LISTING: Listing = {
  id: 1,
  title: 'MacBook Pro 16" M1 Pro',
  description: `Late 2021 model in excellent condition. Perfect for development work.

Specifications:
- M1 Pro chip
- 16GB unified memory
- 512GB SSD
- 16-inch Liquid Retina XDR display
- Space Gray

Includes original charger and box. Battery cycle count under 100.`,
  type: 'equipment',
  price: 2000,
  condition: 'like-new',
  images: [
    'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg',
    'https://images.pexels.com/photos/5474296/pexels-photo-5474296.jpeg'
  ],
  createdAt: '2025-03-15',
  seller: {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Developer',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Full-stack developer with 8 years of experience. Passionate about clean code and great user experiences.'
  },
  location: 'Nelson, BC',
  tags: ['Apple', 'Laptop', 'Development']
};
