import { Link } from 'react-router-dom';
import { MarketplaceListing, ListingType, ListingCondition } from '../../types/marketplace';
import { getTypeIcon, getConditionDisplayName, formatPrice } from './utils';

interface ListingCardProps {
  listing: MarketplaceListing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const defaultImage = '/api/placeholder/400/300';
  
  // Add debug link and ID display to help troubleshoot the detail page issue
  console.log('ListingCard receiving listing with ID:', listing.id, typeof listing.id);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Link 
          to={`/marketplace/${listing.id}/debug`}
          className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          Debug
        </Link>
      </div>
      
      <Link
        to={`/marketplace/${listing.id}`}
        className="block"
      >
      <div className="h-48 overflow-hidden">
        <img
          src={listing.images?.[0] || defaultImage}
          alt={listing.title || 'Listing'}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
              {listing.title || 'Untitled'}
            </h3>
            <p className="text-orange-600 dark:text-orange-400">
              {listing.price !== null ? formatPrice(listing.price, listing.type as ListingType) : 'Price on request'}
            </p>
          </div>
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
            {getTypeIcon(listing.type as ListingType)}
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {listing.description || 'No description available'}
        </p>

        {listing.condition && (
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Condition: <span className="capitalize">{getConditionDisplayName(listing.condition as ListingCondition)}</span>
          </p>
        )}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700
                         text-slate-600 dark:text-slate-300 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {listing.tags.length > 3 && (
              <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700
                             text-slate-600 dark:text-slate-300 rounded-full text-xs">
                +{listing.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full mr-2 bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {(listing.seller?.name?.charAt(0) || listing.seller?.id?.charAt(0) || 'U').toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {listing.seller?.name || `Seller ${listing.seller?.id?.substring(0, 5) || 'Unknown'}`}
            </span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {listing.location || 'Location not specified'}
          </span>
        </div>
      </div>
    </Link>
    </div>
  );
};

export default ListingCard;
