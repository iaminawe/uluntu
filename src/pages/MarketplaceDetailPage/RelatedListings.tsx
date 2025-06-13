import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useRelatedMarketplaceListingsRedux } from '@/features/marketplace/hooks/useMarketplaceRedux';
import { useRelatedMarketplaceItems } from '@/features/marketplace/hooks/useMarketplaceQueries';

interface RelatedListingsProps {
  id: string;
  useRedux?: boolean;
}

export default function RelatedListings({ id, useRedux = false }: RelatedListingsProps) {
  // Redux implementation
  const {
    relatedListings: reduxListings,
    isLoading: reduxIsLoading,
    fetchRelatedListings
  } = useRelatedMarketplaceListingsRedux(id);

  // React Query implementation
  const {
    data: queryListings = [],
    isLoading: queryIsLoading
  } = useRelatedMarketplaceItems(id, 3);

  // Fetch related listings when component mounts (Redux)
  useEffect(() => {
    if (useRedux && id) {
      fetchRelatedListings();
    }
  }, [id, useRedux, fetchRelatedListings]);

  // Determine which data source to use
  const listings = useRedux ? reduxListings : queryListings;
  const isLoading = useRedux ? reduxIsLoading : queryIsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400">No related listings available.</p>
    );
  }

  return (
    <div className="space-y-4">
      {listings.map(listing => (
        <Link 
          key={listing.id}
          to={`/marketplace/${listing.id}`}
          className="block"
        >
          <div className="flex items-start p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title} 
                className="w-16 h-16 object-cover rounded mr-3"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded mr-3 flex items-center justify-center">
                <span className="text-xs text-slate-500">No image</span>
              </div>
            )}
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{listing.title}</h4>
              <p className="text-sm text-primary font-medium">${typeof listing.price === 'number' ? listing.price.toFixed(2) : '0.00'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
