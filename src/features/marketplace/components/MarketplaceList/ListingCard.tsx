import { Link } from 'react-router-dom';
import { MarketplaceListing, ListingType, ListingCondition } from '../../types/marketplace';
import { getTypeIcon, getConditionDisplayName, formatPrice } from './utils';
import { useMarketplaceNavigation } from '../../hooks/useMarketplaceNavigation';
import { getMarketplaceListingUrl } from '@/utils/contentUrlUtils';

interface ListingCardProps {
  listing: MarketplaceListing;
  onClick?: (listing: MarketplaceListing) => void;
}

const ListingCard = ({ listing, onClick }: ListingCardProps) => {
  const defaultImage = '/placeholder-image.png';
  const { navigateToListing } = useMarketplaceNavigation();
  
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Use custom click handler if provided, otherwise use navigation hook
    if (onClick) {
      onClick(listing);
    } else {
      navigateToListing(listing, 'marketplace_card', 'click');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    // Handle keyboard navigation
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      if (onClick) {
        onClick(listing);
      } else {
        navigateToListing(listing, 'marketplace_card', 'keyboard');
      }
    }
  };
  
  return (
    <Link
      to={getMarketplaceListingUrl(listing)}
      className="block bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${listing.title}`}
      role="button"
      tabIndex={0}
    >
      <div className="h-48 overflow-hidden">
        <img
          src={listing.images?.[0] || defaultImage}
          alt={listing.title || 'Listing'}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1 truncate">
              {listing.title || 'Untitled'}
            </h3>
            <p className="text-lg font-medium text-orange-600 dark:text-orange-400">
              {listing.price !== null ? formatPrice(listing.price, listing.type as ListingType) : 'Price on request'}
            </p>
          </div>
          <div className="flex-shrink-0 p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg ml-4">
            {getTypeIcon(listing.type as ListingType)}
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 text-sm">
          {listing.description || 'No description available'}
        </p>

        {listing.condition && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {getConditionDisplayName(listing.condition as ListingCondition)}
            </span>
          </div>
        )}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {listing.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700
                         text-slate-600 dark:text-slate-300 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {listing.tags.length > 2 && (
              <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700
                             text-slate-600 dark:text-slate-300 rounded text-xs font-medium">
                +{listing.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-6 h-6 rounded-full mr-2 bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {(listing.seller?.name?.charAt(0) || listing.seller?.id?.charAt(0) || 'U').toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
              {listing.seller?.name || `Seller ${listing.seller?.id?.substring(0, 5) || 'Unknown'}`}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
            {listing.location || 'Location not specified'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
