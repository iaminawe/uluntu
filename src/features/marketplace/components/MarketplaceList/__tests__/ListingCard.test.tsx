import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ListingCard from '../ListingCard';
import { MarketplaceListing } from '../../../types/marketplace';

// Mock the navigation hook
const mockNavigateToListing = vi.fn();
vi.mock('../../../hooks/useMarketplaceNavigation', () => ({
  useMarketplaceNavigation: () => ({
    navigateToListing: mockNavigateToListing
  })
}));

const mockListing: MarketplaceListing = {
  id: '1',
  title: 'Test Product',
  description: 'This is a test product description',
  type: 'product',
  price: 100,
  condition: 'new',
  images: ['https://example.com/image.jpg'],
  tags: ['electronics', 'gadget'],
  location: 'Test Location',
  seller: {
    id: '1',
    name: 'Test Seller',
    image: 'https://example.com/seller.jpg'
  },
  createdAt: '2025-01-01T00:00:00Z',
  status: 'published',
  featured: false
};

const renderListingCard = (props = {}) => {
  return render(
    <BrowserRouter>
      <ListingCard listing={mockListing} {...props} />
    </BrowserRouter>
  );
};

describe('ListingCard Navigation', () => {
  beforeEach(() => {
    mockNavigateToListing.mockClear();
  });

  it('renders listing information correctly', () => {
    renderListingCard();
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText('Test Seller')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    renderListingCard();
    
    const cardLink = screen.getByRole('button', { name: /view details for test product/i });
    expect(cardLink).toHaveAttribute('href', '/marketplace/1');
    expect(cardLink).toHaveAttribute('tabindex', '0');
    expect(cardLink).toHaveAttribute('aria-label', 'View details for Test Product');
  });

  it('navigates to detail page on click', async () => {
    renderListingCard();
    
    const cardLink = screen.getByRole('button', { name: /view details for test product/i });
    fireEvent.click(cardLink);
    
    await waitFor(() => {
      expect(mockNavigateToListing).toHaveBeenCalledWith(
        mockListing,
        'marketplace_card',
        'click'
      );
    });
  });

  it('navigates to detail page on Enter key press', async () => {
    renderListingCard();
    
    const cardLink = screen.getByRole('button', { name: /view details for test product/i });
    fireEvent.keyDown(cardLink, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockNavigateToListing).toHaveBeenCalledWith(
        mockListing,
        'marketplace_card',
        'keyboard'
      );
    });
  });

  it('navigates to detail page on Space key press', async () => {
    renderListingCard();
    
    const cardLink = screen.getByRole('button', { name: /view details for test product/i });
    fireEvent.keyDown(cardLink, { key: ' ' });
    
    await waitFor(() => {
      expect(mockNavigateToListing).toHaveBeenCalledWith(
        mockListing,
        'marketplace_card',
        'keyboard'
      );
    });
  });

  it('calls custom onClick handler when provided', async () => {
    const mockOnClick = vi.fn();
    renderListingCard({ onClick: mockOnClick });
    
    const cardLink = screen.getByRole('button', { name: /view details for test product/i });
    fireEvent.click(cardLink);
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledWith(mockListing);
      expect(mockNavigateToListing).not.toHaveBeenCalled();
    });
  });

  it('displays tags correctly with overflow handling', () => {
    const listingWithManyTags = {
      ...mockListing,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    };
    
    render(
      <BrowserRouter>
        <ListingCard listing={listingWithManyTags} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument(); // Shows overflow count
  });

  it('displays condition badge when condition is present', () => {
    renderListingCard();
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const listingWithoutOptionals = {
      ...mockListing,
      condition: undefined,
      tags: [],
      images: []
    };
    
    render(
      <BrowserRouter>
        <ListingCard listing={listingWithoutOptionals} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    // Should not crash when optional fields are missing
  });

  it('displays price correctly for service type', () => {
    const serviceListing = {
      ...mockListing,
      type: 'service' as const,
      price: 50
    };
    
    render(
      <BrowserRouter>
        <ListingCard listing={serviceListing} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('$50/hr')).toBeInTheDocument();
  });

  it('displays "Price on request" when price is null', () => {
    const listingWithoutPrice = {
      ...mockListing,
      price: null
    };
    
    render(
      <BrowserRouter>
        <ListingCard listing={listingWithoutPrice} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Price on request')).toBeInTheDocument();
  });

  it('has proper hover and focus styles', () => {
    renderListingCard();
    
    const cardLink = screen.getByRole('button', { name: /view details for test product/i });
    expect(cardLink).toHaveClass('hover:shadow-lg');
    expect(cardLink).toHaveClass('focus:ring-2');
    expect(cardLink).toHaveClass('focus:ring-orange-500');
  });
});