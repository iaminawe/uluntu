import { configureStore } from '@reduxjs/toolkit';
import marketplaceReducer, {
  MarketplaceState,
  fetchMarketplaceListings,
  fetchMarketplaceListingById,
  fetchFilteredMarketplaceListings,
  fetchRelatedMarketplaceListings,
  fetchSellerMarketplaceListings,
  createMarketplaceListing,
  updateMarketplaceListing,
  deleteMarketplaceListing,
  setFilters,
  clearFilters
} from '@/features/marketplace/store/marketplaceSlice';

// Mock data
const mockMarketplaceListings = [
  {
    id: '1',
    title: 'MacBook Pro 16" M1 Pro',
    description: 'Late 2021 model, 16GB RAM, 512GB SSD, excellent condition',
    type: 'equipment',
    price: 2000,
    condition: 'like-new',
    images: ['https://example.com/macbook.jpg'],
    createdAt: '2025-03-15',
    seller: {
      id: '1',
      name: 'Sarah Johnson',
      image: 'https://example.com/sarah.jpg'
    },
    location: 'Nelson, BC',
    tags: ['Apple', 'Laptop', 'Development'],
    status: 'published',
    featured: true
  },
  {
    id: '2',
    title: 'Web Development Services',
    description: 'Full-stack development services for your next project',
    type: 'service',
    price: 75,
    images: ['https://example.com/webdev.jpg'],
    createdAt: '2025-03-14',
    seller: {
      id: '2',
      name: 'Michael Chen',
      image: 'https://example.com/michael.jpg'
    },
    location: 'Rossland, BC',
    tags: ['Web Development', 'React', 'Node.js'],
    status: 'published',
    featured: false
  }
];

// Mock API functions
jest.mock('../../api/marketplaceApi', () => ({
  marketplaceApi: {
    getAll: jest.fn().mockImplementation((filters) => {
      let result = [...mockMarketplaceListings];
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        result = result.filter(listing => 
          listing.title.toLowerCase().includes(searchTerm) || 
          listing.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.types && filters.types.length > 0) {
        result = result.filter(listing => filters.types.includes(listing.type));
      }
      
      if (filters?.condition) {
        result = result.filter(listing => listing.condition === filters.condition);
      }
      
      if (filters?.seller_id) {
        result = result.filter(listing => 
          String(listing.seller.id) === filters.seller_id || 
          String(listing.seller_id) === filters.seller_id
        );
      }
      
      if (filters?.featured !== undefined) {
        result = result.filter(listing => listing.featured === filters.featured);
      }
      
      return Promise.resolve(result);
    }),
    getById: jest.fn().mockImplementation((id) => {
      const listing = mockMarketplaceListings.find(listing => listing.id === id);
      return Promise.resolve(listing || null);
    }),
    getRelated: jest.fn().mockImplementation((id, limit = 3) => {
      const listing = mockMarketplaceListings.find(listing => listing.id === id);
      if (!listing) return Promise.resolve([]);
      
      const relatedListings = mockMarketplaceListings
        .filter(l => l.id !== id && l.type === listing.type)
        .slice(0, limit);
      
      return Promise.resolve(relatedListings);
    }),
    create: jest.fn().mockImplementation((data) => {
      const newListing = {
        id: '3',
        ...data,
        createdAt: new Date().toISOString(),
        seller: {
          id: data.sellerId || '1',
          name: 'Default Seller',
          image: 'https://example.com/default-seller.jpg'
        },
        status: data.status || 'published',
        featured: data.featured || false,
        images: data.images || [],
        tags: data.tags || []
      };
      return Promise.resolve(newListing);
    }),
    update: jest.fn().mockImplementation((id, data) => {
      const listing = mockMarketplaceListings.find(listing => listing.id === id);
      if (!listing) return Promise.resolve(null);
      
      const updatedListing = {
        ...listing,
        ...data,
        seller: listing.seller
      };
      
      return Promise.resolve(updatedListing);
    }),
    delete: jest.fn().mockResolvedValue(true)
  }
}));

// Mock environment variable
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    VITE_USE_SUPABASE: 'true'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('marketplace slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        marketplace: marketplaceReducer
      }
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().marketplace).toEqual({
      listings: [],
      currentListing: null,
      filteredListings: [],
      relatedListings: [],
      sellerListings: [],
      filters: {},
      status: 'idle',
      error: null
    });
  });

  it('should handle fetchMarketplaceListings', async () => {
    await store.dispatch(fetchMarketplaceListings());
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.listings).toEqual(mockMarketplaceListings);
  });

  it('should handle fetchMarketplaceListingById', async () => {
    await store.dispatch(fetchMarketplaceListingById('1'));
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.currentListing).toEqual(mockMarketplaceListings[0]);
  });

  it('should handle fetchFilteredMarketplaceListings with search', async () => {
    await store.dispatch(fetchFilteredMarketplaceListings({ search: 'macbook' }));
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.filteredListings).toEqual([mockMarketplaceListings[0]]);
  });

  it('should handle fetchFilteredMarketplaceListings with type', async () => {
    await store.dispatch(fetchFilteredMarketplaceListings({ types: ['service'] }));
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.filteredListings).toEqual([mockMarketplaceListings[1]]);
  });

  it('should handle fetchFilteredMarketplaceListings with condition', async () => {
    await store.dispatch(fetchFilteredMarketplaceListings({ condition: 'like-new' }));
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.filteredListings).toEqual([mockMarketplaceListings[0]]);
  });

  it('should handle fetchFilteredMarketplaceListings with featured', async () => {
    await store.dispatch(fetchFilteredMarketplaceListings({ featured: true }));
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.filteredListings).toEqual([mockMarketplaceListings[0]]);
  });

  it('should handle fetchRelatedMarketplaceListings', async () => {
    await store.dispatch(fetchRelatedMarketplaceListings({ id: '1' }));
    expect(store.getState().marketplace.status).toBe('succeeded');
    // There should be no related listings for item 1 in our mock data (only one equipment item)
    expect(store.getState().marketplace.relatedListings).toHaveLength(0);
  });

  it('should handle fetchSellerMarketplaceListings', async () => {
    await store.dispatch(fetchSellerMarketplaceListings('1'));
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.sellerListings).toEqual([mockMarketplaceListings[0]]);
  });

  it('should handle createMarketplaceListing', async () => {
    const newListing = {
      title: 'New Gaming Laptop',
      description: 'Latest gaming laptop with RTX 4080',
      type: 'equipment',
      price: 2500,
      condition: 'new',
      sellerId: '1',
      tags: ['Gaming', 'Laptop']
    };
    
    await store.dispatch(createMarketplaceListing(newListing));
    expect(store.getState().marketplace.status).toBe('succeeded');
    expect(store.getState().marketplace.listings).toHaveLength(1);
    expect(store.getState().marketplace.currentListing).toBeTruthy();
    expect(store.getState().marketplace.currentListing!.title).toBe('New Gaming Laptop');
  });

  it('should handle updateMarketplaceListing', async () => {
    // First fetch listings to populate the state
    await store.dispatch(fetchMarketplaceListings());
    
    // Then update one listing
    const updateData = {
      title: 'Updated MacBook Pro',
      price: 1800
    };
    
    await store.dispatch(updateMarketplaceListing({ id: '1', data: updateData }));
    
    const updatedListing = store.getState().marketplace.listings.find(listing => listing.id === '1');
    expect(updatedListing).toBeTruthy();
    expect(updatedListing?.title).toBe('Updated MacBook Pro');
    expect(updatedListing?.price).toBe(1800);
  });

  it('should handle deleteMarketplaceListing', async () => {
    // First fetch listings to populate the state
    await store.dispatch(fetchMarketplaceListings());
    expect(store.getState().marketplace.listings.length).toBe(2);
    
    // Then delete one listing
    await store.dispatch(deleteMarketplaceListing('1'));
    
    expect(store.getState().marketplace.listings.length).toBe(1);
    expect(store.getState().marketplace.listings[0].id).toBe('2');
  });

  it('should handle setFilters', () => {
    store.dispatch(setFilters({ search: 'laptop', types: ['equipment'] }));
    expect(store.getState().marketplace.filters).toEqual({
      search: 'laptop',
      types: ['equipment']
    });
  });

  it('should handle clearFilters', () => {
    // First set some filters
    store.dispatch(setFilters({ search: 'laptop', types: ['equipment'] }));
    
    // Then clear them
    store.dispatch(clearFilters());
    
    expect(store.getState().marketplace.filters).toEqual({});
  });
});
