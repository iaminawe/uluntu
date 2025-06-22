import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceListing } from '../types/marketplace';

export interface NavigationAnalytics {
  listing_id: string;
  listing_type: string;
  listing_title: string;
  source_component: string;
  navigation_method: 'click' | 'keyboard' | 'touch';
}

/**
 * Custom hook for handling marketplace navigation with analytics tracking
 */
export const useMarketplaceNavigation = () => {
  const navigate = useNavigate();

  const navigateToListing = useCallback((
    listing: MarketplaceListing,
    source: string = 'marketplace_card',
    method: NavigationAnalytics['navigation_method'] = 'click'
  ) => {
    // Prepare analytics data
    const analyticsData: NavigationAnalytics = {
      listing_id: listing.id,
      listing_type: listing.type,
      listing_title: listing.title,
      source_component: source,
      navigation_method: method
    };

    // Track the navigation event (placeholder for analytics integration)
    trackMarketplaceNavigation(analyticsData);

    // Navigate to the listing detail page
    navigate(`/marketplace/${listing.id}`);
  }, [navigate]);

  const navigateToMarketplace = useCallback((filters?: {
    type?: string;
    search?: string;
    seller?: string;
  }) => {
    let path = '/marketplace';
    
    if (filters) {
      const searchParams = new URLSearchParams();
      if (filters.type && filters.type !== 'all') {
        searchParams.set('type', filters.type);
      }
      if (filters.search) {
        searchParams.set('search', filters.search);
      }
      if (filters.seller) {
        searchParams.set('seller', filters.seller);
      }
      
      const queryString = searchParams.toString();
      if (queryString) {
        path += `?${queryString}`;
      }
    }

    navigate(path);
  }, [navigate]);

  const navigateToCreateListing = useCallback(() => {
    navigate('/marketplace/create');
  }, [navigate]);

  const navigateToEditListing = useCallback((listingId: string) => {
    navigate(`/marketplace/${listingId}/edit`);
  }, [navigate]);

  return {
    navigateToListing,
    navigateToMarketplace,
    navigateToCreateListing,
    navigateToEditListing
  };
};

/**
 * Function to track marketplace navigation events
 * This is a placeholder for actual analytics implementation
 */
function trackMarketplaceNavigation(data: NavigationAnalytics) {
  // In a real implementation, this would send data to an analytics service
  // For development, we can log to console
  if (import.meta.env.MODE === 'development') {
    console.log('Marketplace Navigation:', data);
  }

  // Example integrations:
  // - Google Analytics: gtag('event', 'marketplace_navigation', data);
  // - Mixpanel: mixpanel.track('marketplace_navigation', data);
  // - Custom analytics: analyticsService.track('marketplace_navigation', data);
}

export default useMarketplaceNavigation;