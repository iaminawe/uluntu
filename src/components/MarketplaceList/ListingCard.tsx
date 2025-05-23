import { Link } from 'react-router-dom';
import { Listing } from './types';
import { getTypeIcon, getConditionDisplayName, formatPrice } from './utils';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
              {listing.title}
            </h3>
            <p className="text-orange-600 dark:text-orange-400">
              {listing.price !== undefined ? formatPrice(listing.price, listing.type) : 'Price on request'}
            </p>
          </div>
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
            {getTypeIcon(listing.type)}
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {listing.description}
        </p>

        {listing.condition && (
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Condition: <span className="capitalize">{getConditionDisplayName(listing.condition)}</span>
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
            <img
              src={listing.seller.image}
              alt={listing.seller.name}
              className="w-6 h-6 rounded-full mr-2 object-cover"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {listing.seller.name}
            </span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {listing.location}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
