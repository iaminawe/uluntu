import type { MarketplaceListing } from '../../../types/marketplace';
import type { ContentStatus } from '../../../types/common';

// Define MarketplaceFilters for tests
export interface MarketplaceFilters {
  search?: string;
  type?: string;
  condition?: string;
  priceRange?: string;
  location?: string;
  seller?: string;
  status?: ContentStatus;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

// Test users
export const testUsers = {
  buyer: {
    id: 'buyer-123',
    email: 'buyer@test.com',
    full_name: 'Test Buyer',
    role: 'user'
  },
  seller: {
    id: 'seller-123',
    email: 'seller@test.com',
    full_name: 'Test Seller',
    role: 'user'
  },
  admin: {
    id: 'admin-123',
    email: 'admin@test.com',
    full_name: 'Test Admin',
    role: 'admin'
  }
};

// Test listings
export const createTestListing = (overrides: Partial<MarketplaceListing> = {}): MarketplaceListing => ({
  id: 'test-listing-1',
  title: 'Test Product',
  description: 'This is a test product description',
  price: 50.00,
  type: 'product',
  condition: 'new',
  images: ['https://example.com/image1.jpg'],
  seller: {
    id: testUsers.seller.id,
    name: testUsers.seller.full_name,
    image: 'https://example.com/avatar.jpg'
  },
  location: 'Test City',
  tags: ['test', 'product'],
  status: 'published' as ContentStatus,
  featured: false,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides
});

export const testListings: MarketplaceListing[] = [
  createTestListing({
    id: '1',
    title: 'Handmade Wooden Table',
    description: 'Beautiful handcrafted oak table',
    price: 299.99,
    type: 'product',
    condition: 'new',
    tags: ['furniture', 'handmade', 'wood'],
    location: 'Downtown'
  }),
  createTestListing({
    id: '2',
    title: 'Lawn Mowing Service',
    description: 'Professional lawn care and maintenance',
    price: 50.00,
    type: 'service',
    condition: 'new',
    tags: ['lawn', 'garden', 'maintenance'],
    location: 'Suburbs'
  }),
  createTestListing({
    id: '3',
    title: 'Vintage Camera',
    description: 'Classic 35mm film camera in excellent condition',
    price: 150.00,
    type: 'product',
    condition: 'used',
    tags: ['photography', 'vintage', 'camera'],
    location: 'Old Town'
  }),
  createTestListing({
    id: '4',
    title: 'House Cleaning Service',
    description: 'Thorough home cleaning service',
    price: 80.00,
    type: 'service',
    condition: 'new',
    tags: ['cleaning', 'home', 'service'],
    location: 'City Center'
  }),
  createTestListing({
    id: '5',
    title: 'Garden Tools Set',
    description: 'Complete set of garden tools',
    price: 45.00,
    type: 'product',
    condition: 'used',
    tags: ['garden', 'tools', 'outdoor'],
    location: 'West Side',
    status: 'archived' as ContentStatus
  })
];

// Test filters
export const defaultFilters: MarketplaceFilters = {
  search: '',
  type: '',
  condition: '',
  minPrice: 0,
  maxPrice: 0,
  seller: '',
  tags: []
};

export const createTestFilters = (overrides: Partial<MarketplaceFilters> = {}): MarketplaceFilters => ({
  ...defaultFilters,
  ...overrides
});

// Test messages
export const testMessages = {
  inquiry: {
    id: 'msg-1',
    listing_id: '1',
    sender_id: testUsers.buyer.id,
    recipient_id: testUsers.seller.id,
    message: 'Is this item still available?',
    created_at: '2024-01-02T10:00:00Z'
  },
  response: {
    id: 'msg-2',
    listing_id: '1',
    sender_id: testUsers.seller.id,
    recipient_id: testUsers.buyer.id,
    message: 'Yes, it is still available. Would you like to see it?',
    created_at: '2024-01-02T11:00:00Z'
  }
};

// Test form data
export const validListingFormData = {
  title: 'New Test Product',
  description: 'A brand new test product with great features',
  price: '75.50',
  type: 'product',
  condition: 'new',
  location: 'Test Location',
  images: [],
  tags: 'test, new, product'
};

export const invalidListingFormData = {
  title: '', // Required
  description: '', // Required
  price: '-10', // Must be positive
  type: 'invalid', // Must be valid type
  condition: '',
  location: '',
  images: [],
  tags: ''
};

// Helper functions
export const filterListings = (
  listings: MarketplaceListing[], 
  filters: MarketplaceFilters
): MarketplaceListing[] => {
  return listings.filter(listing => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type && listing.type !== filters.type) {
      return false;
    }

    // Condition filter
    if (filters.condition && listing.condition !== filters.condition) {
      return false;
    }

    // Price range filter
    if (filters.minPrice && listing.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && listing.price > filters.maxPrice) {
      return false;
    }

    // Seller filter
    if (filters.seller && listing.seller.id !== filters.seller) {
      return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((filterTag: string) =>
        listing.tags.includes(filterTag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
};

// Mock API responses
export const mockApiResponses = {
  success: {
    listings: {
      data: testListings,
      error: null
    },
    singleListing: {
      data: testListings[0],
      error: null
    },
    create: {
      data: createTestListing({ id: 'new-listing-id' }),
      error: null
    },
    update: {
      data: { ...testListings[0], title: 'Updated Title' },
      error: null
    },
    delete: {
      data: null,
      error: null
    }
  },
  errors: {
    notFound: {
      data: null,
      error: new Error('Listing not found')
    },
    unauthorized: {
      data: null,
      error: new Error('Unauthorized')
    },
    validation: {
      data: null,
      error: new Error('Validation failed')
    },
    network: {
      data: null,
      error: new Error('Network error')
    }
  }
};

// Validation helpers
export const validateListingData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('Description is required');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!['product', 'service'].includes(data.type)) {
    errors.push('Type must be either product or service');
  }

  if (!['new', 'used', 'refurbished'].includes(data.condition)) {
    errors.push('Invalid condition');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};