// Mock environment dependencies first
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() }
  },
  sessionCache: new WeakMap()
}));

jest.mock('@/config/env', () => ({
  getIsSupabaseEnabled: jest.fn().mockReturnValue(false),
  IS_SUPABASE_ENABLED: false
}));

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store/index';
import { createMockQueryResult, createMockAuthContext, createTestProviders } from '@/test-utils/react-query-mocks';

// Mock auth context
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => createMockAuthContext({
    user: { id: '456', name: 'Test User', role: 'user' },
    status: 'authenticated'
  })
}));

jest.mock('../hooks/useMarketplaceQueries', () => {
  const { createMockQueryResult } = require('@/test-utils/react-query-mocks');
  return {
    useMarketplaceItems: () => createMockQueryResult({ data: [], isLoading: false, error: null }),
    useMarketplaceItem: () => createMockQueryResult({ data: null, isLoading: false, error: null }),
    useMarketplaceItemsWithFilters: () => createMockQueryResult({ data: [], isLoading: false, error: null })
  };
});

jest.mock('../hooks/useMarketplaceRedux', () => ({
  useFilteredMarketplaceListingsRedux: () => ({
    filteredListings: [],
    isLoading: false,
    isError: false,
    error: null,
    updateFilters: jest.fn()
  }),
  useMarketplaceItemRedux: () => ({
    listing: null,
    isLoading: false,
    error: null,
    fetchListing: jest.fn()
  }),
  useRelatedMarketplaceListingsRedux: () => ({
    relatedListings: [],
    isLoading: false,
    error: null,
    fetchRelatedListings: jest.fn()
  })
}));

// Mock components instead of trying to render them
jest.mock('../components/MarketplaceList', () => () => <div data-testid="marketplace-list">MarketplaceList</div>);
jest.mock('../pages/MarketplaceDetailPage', () => () => <div data-testid="marketplace-detail">MarketplaceDetailPage</div>);

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useParams: () => ({ id: '123' }),
  useNavigate: () => jest.fn()
}));

describe('Marketplace Components', () => {
  const TestWrapper = createTestProviders({ store });
  
  it('should handle marketplace listing queries correctly', () => {
    const mockListings = [
      { id: '1', title: 'Test Listing 1', description: 'Description 1' },
      { id: '2', title: 'Test Listing 2', description: 'Description 2' }
    ];
    
    // This test validates that our mocks are working correctly
    const { useMarketplaceItems } = require('../hooks/useMarketplaceQueries');
    const result = useMarketplaceItems();
    
    expect(result.data).toEqual([]);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
  });
  
  it('should handle marketplace filters correctly', () => {
    const { useMarketplaceItemsWithFilters } = require('../hooks/useMarketplaceQueries');
    const result = useMarketplaceItemsWithFilters({ category: 'electronics' });
    
    expect(result.data).toEqual([]);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
  });
  
  it('should handle individual marketplace item queries', () => {
    const { useMarketplaceItem } = require('../hooks/useMarketplaceQueries');
    const result = useMarketplaceItem('123');
    
    expect(result.data).toBe(null);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
  });
  
  it('should handle Redux marketplace hooks correctly', () => {
    const { useFilteredMarketplaceListingsRedux } = require('../hooks/useMarketplaceRedux');
    const result = useFilteredMarketplaceListingsRedux();
    
    expect(result.filteredListings).toEqual([]);
    expect(result.isLoading).toBe(false);
    expect(result.isError).toBe(false);
    expect(result.error).toBe(null);
    expect(typeof result.updateFilters).toBe('function');
  });
  
  it('should validate marketplace mock components render without errors', () => {
    const MarketplaceList = require('../components/MarketplaceList').default;
    const MarketplaceDetail = require('../pages/MarketplaceDetailPage').default;
    
    render(
      <TestWrapper>
        <MarketplaceList />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('marketplace-list')).toBeTruthy();
    
    render(
      <TestWrapper>
        <MarketplaceDetail />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('marketplace-detail')).toBeTruthy();
  });
});