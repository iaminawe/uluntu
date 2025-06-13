import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Mail } from 'lucide-react';
import { Listing, SAMPLE_LISTING, adaptMainMarketplaceItemToDetail } from './types';
import { getTypeIcon } from './utils';
import ContactModal from './ContactModal';
import { marketplaceApi } from '../../api/marketplaceApi';
import { QueryError } from '../ui/ErrorDisplay';
import { useMarketplaceItem } from '../../hooks/useMarketplaceQueries';
import SkeletonText from '../ui/Skeleton/SkeletonText';
import SkeletonImage from '../ui/Skeleton/SkeletonImage';
import { MarketplaceItem } from '../../types';

interface MarketplaceItemDetailProps {
  itemId: string;
}

const MarketplaceItemDetail = ({ itemId }: MarketplaceItemDetailProps) => {
  console.log(`Displaying marketplace item with ID: ${itemId}`);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the React Query hook for fetching the item
  const {
    data: item,
    isLoading: queryIsLoading,
    error: queryError,
    refetch
  } = useMarketplaceItem(itemId);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (import.meta.env.VITE_USE_SUPABASE === 'true') {
          // If item is already loaded from React Query
          if (item) {
            console.log('Using React Query data for marketplace item:', item);
            // Convert the item to the expected format
            const adaptedItem = adaptMainMarketplaceItemToDetail(item as unknown as MarketplaceItem) as Listing;
            setListing(adaptedItem);
            setIsLoading(false);
            return;
          }
          
          // Fallback to direct API call if React Query hasn't loaded yet
          console.log('Fetching marketplace item directly from API');
          const result = await marketplaceApi.getById(itemId);
          if (result) {
            const adaptedItem = adaptMainMarketplaceItemToDetail(result) as Listing;
            setListing(adaptedItem);
          } else {
            setError('Item not found');
          }
        } else {
          // Use sample data when not using Supabase
          console.log('Using sample data for marketplace item');
          setListing(SAMPLE_LISTING);
        }
      } catch (err) {
        console.error('Error fetching marketplace item:', err);
        setError(err instanceof Error ? err.message : 'Failed to load marketplace item');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [itemId, item]);

  // Handle loading and error states
  if (isLoading || queryIsLoading) {
    return <MarketplaceItemSkeleton />;
  }
  
  if (error || queryError) {
    return (
      <QueryError
        error={error || (queryError as Error)}
        retry={() => refetch()}
        message="We couldn't load this marketplace item. Please try again."
      />
    );
  }
  
  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
        <p className="mb-6">The marketplace item you're looking for doesn't exist or has been removed.</p>
        <Link to="/marketplace" className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          Back to Marketplace
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Image gallery */}
        <div>
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-96 object-cover"
            />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                    index === currentImageIndex ? 'ring-2 ring-orange-500' : 'opacity-70'
                  }`}
                >
                  <img src={image} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Listing details */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {listing.title}
                </h1>
                <p className="text-2xl text-orange-600 dark:text-orange-400">
                  ${listing.price}{listing.type === 'service' && '/hr'}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                {getTypeIcon(listing.type)}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <MapPin className="h-5 w-5 mr-2" />
                {listing.location}
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Calendar className="h-5 w-5 mr-2" />
                Listed {new Date(listing.createdAt).toLocaleDateString()}
              </div>
              {listing.condition && (
                <p className="text-slate-600 dark:text-slate-300">
                  Condition: <span className="capitalize">{listing.condition}</span>
                </p>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none mb-6">
              {listing.description.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={index} className="list-disc list-inside mb-4">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={index} className="mb-4">{paragraph}</p>;
              })}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {listing.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => setShowContactModal(true)}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Seller
            </button>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About the Seller</h2>
              <div className="flex items-start space-x-4">
                <Link to={`/directory/${listing.seller.id}`}>
                  <img
                    src={listing.seller.image}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full"
                  />
                </Link>
                <div>
                  <Link
                    to={`/directory/${listing.seller.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {listing.seller.name}
                  </Link>
                  {listing.seller.title && (
                    <p className="text-slate-600 dark:text-slate-300">{listing.seller.title}</p>
                  )}
                  {listing.seller.bio && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{listing.seller.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal
          listing={listing}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

// Skeleton component for marketplace item detail loading state
const MarketplaceItemSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Image gallery skeleton */}
        <div>
          <div className="mb-4 overflow-hidden rounded-lg">
            <SkeletonImage height="h-96" width="w-full" rounded="rounded-lg" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
                <SkeletonImage height="h-full" width="w-full" rounded="rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column - Listing details skeleton */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-3 w-full">
                <SkeletonText height="h-8" width="w-3/4" />
                <SkeletonText height="h-6" width="w-1/3" />
              </div>
              <div className="p-2 bg-slate-200 dark:bg-slate-700 w-10 h-10 rounded-lg"></div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="h-5 w-5 mr-2 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <SkeletonText height="h-5" width="w-1/3" />
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 mr-2 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <SkeletonText height="h-5" width="w-1/2" />
              </div>
              <SkeletonText height="h-5" width="w-1/3" />
            </div>

            <div className="mb-6">
              <SkeletonText lines={5} varyWidth />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 w-20"></div>
              ))}
            </div>

            <div className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-lg h-12"></div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <SkeletonText height="h-6" width="w-1/3" className="mb-4" />
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="space-y-2">
                  <SkeletonText height="h-5" width="w-40" />
                  <SkeletonText height="h-4" width="w-32" />
                  <SkeletonText height="h-4" width="w-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceItemDetail;
