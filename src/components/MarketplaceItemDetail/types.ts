// MarketplaceItemDetail types

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
