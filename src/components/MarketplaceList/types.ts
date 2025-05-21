// Types for MarketplaceList component

export type ListingType = 'product' | 'service' | 'equipment';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';
export type ListingPriceRange = 'any' | 'under-50' | '50-100' | '100-500' | '500-2000' | 'over-2000';

export interface Seller {
  id: number;
  name: string;
  image: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  condition?: ListingCondition;
  images: string[];
  createdAt: string;
  seller: Seller;
  location: string;
  tags: string[];
}

export interface MarketplaceListProps {
  initialType?: ListingType | 'all';
  initialSearch?: string;
  sellerId?: number;
}

export interface FilterOptions {
  search: string;
  type: ListingType | 'all';
  condition: ListingCondition | 'all';
  priceRange: ListingPriceRange | 'all';
  tags: string[];
}

// Sample marketplace listings
export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: 1,
    title: 'MacBook Pro 16" M1 Pro',
    description: 'Late 2021 model, 16GB RAM, 512GB SSD, excellent condition',
    type: 'equipment',
    price: 2000,
    condition: 'like-new',
    images: ['https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg'],
    createdAt: '2025-03-15',
    seller: {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    location: 'Nelson, BC',
    tags: ['Apple', 'Laptop', 'Development']
  },
  {
    id: 2,
    title: 'Web Development Services',
    description: 'Full-stack development services for your next project',
    type: 'service',
    price: 75,
    images: ['https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'],
    createdAt: '2025-03-14',
    seller: {
      id: 2,
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    location: 'Rossland, BC',
    tags: ['Web Development', 'React', 'Node.js']
  },
  {
    id: 3,
    title: 'Custom AI Model Development',
    description: 'Develop custom machine learning models for your business',
    type: 'service',
    price: 100,
    images: ['https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'],
    createdAt: '2025-03-13',
    seller: {
      id: 3,
      name: 'Emma Wilson',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
    },
    location: 'Nelson, BC',
    tags: ['AI', 'Machine Learning', 'Consulting']
  },
  {
    id: 4,
    title: 'Dell UltraSharp 27" 4K Monitor',
    description: 'Professional 4K monitor perfect for developers and designers',
    type: 'equipment',
    price: 450,
    condition: 'good',
    images: ['https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg'],
    createdAt: '2025-03-10',
    seller: {
      id: 4,
      name: 'David Thompson',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    location: 'Kelowna, BC',
    tags: ['Monitor', 'Dell', 'Equipment']
  },
  {
    id: 5,
    title: 'UI/UX Design Workshop',
    description: 'Learn essential design principles in this 4-hour online workshop',
    type: 'service',
    price: 120,
    images: ['https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'],
    createdAt: '2025-03-08',
    seller: {
      id: 5,
      name: 'Jessica Lee',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    location: 'Remote',
    tags: ['Design', 'UI/UX', 'Workshop']
  },
  {
    id: 6,
    title: 'Mechanical Keyboard (Cherry MX Brown)',
    description: 'Ducky One 2 with Cherry MX Brown switches, perfect for programmers',
    type: 'product',
    price: 95,
    condition: 'like-new',
    images: ['https://images.pexels.com/photos/3937174/pexels-photo-3937174.jpeg'],
    createdAt: '2025-03-07',
    seller: {
      id: 6,
      name: 'Robert Clark',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
    },
    location: 'Trail, BC',
    tags: ['Keyboard', 'Hardware', 'Mechanical']
  }
];
