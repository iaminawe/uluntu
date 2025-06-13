import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Briefcase, Monitor } from 'lucide-react';
import { useMarketplaceItem } from '@/features/marketplace/hooks/useMarketplaceQueries';
import { useMarketplaceListingByIdRedux } from '@/features/marketplace/hooks/useMarketplaceRedux';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import { ListingType, Listing, ListingCondition } from './types';
import PageHeader from './PageHeader';

// Define a type for Supabase database record format
interface DatabaseListing {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  condition?: string;
  images?: string[];
  created_at: string;
  seller_id?: string;
  seller?: {
    id: string;
    name: string;
    image?: string;
  };
  location?: string;
  tags?: string[];
}
import ListingDetails from './ListingDetails';
import SellerInfo from './SellerInfo';
import RelatedListings from './RelatedListings';
import ContactModal from './ContactModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import DetailDebug from './DetailDebug';

export default function MarketplaceDetailPage() {
  const { id } = useParams();
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Use both Redux and React Query hooks to support both implementations
  const useRedux = true; // Set to true to use Redux, false to use React Query
  
  // Redux implementation
  const { 
    listing: reduxListing, 
    isLoading: reduxIsLoading, 
    error: reduxError,
    fetchListing: fetchReduxListing
  } = useMarketplaceListingByIdRedux(id || '');
  
  // React Query implementation
  const { data: apiListing, isLoading: queryIsLoading, error: queryError } = useMarketplaceItem(id);
  
  // Fetch listing data when component mounts (Redux)
   
  useEffect(() => {
    // Only fetch data once on component mount or when ID changes
    // We intentionally omit fetchReduxListing and useRedux from deps to prevent infinite loops
    if (useRedux && id) {
      console.log('MarketplaceDetailPage: Fetching listing with ID:', id);
      fetchReduxListing();
    }
  }, [id]);
  
  // Determine which data source to use
  const sourceData = useRedux ? reduxListing : apiListing;
  const isLoading = useRedux ? reduxIsLoading : queryIsLoading;
  const error = useRedux ? reduxError : queryError;
  
  // Convert API data to the expected Listing format
  const listing = useMemo(() => {
    if (!sourceData) return undefined;
    
    // For debugging purposes, log what we're receiving
    console.log('Source data for listing:', sourceData);
    
    // Check if data is in database format (from Supabase) or frontend format
    const isDbFormat = 'created_at' in sourceData || 'seller_id' in sourceData;
    
    if (isDbFormat) {
      // Handle database format (from Supabase)
      const dbData = sourceData as unknown as DatabaseListing;
      
      return {
        id: dbData.id,
        title: dbData.title || '',
        description: dbData.description || '',
        type: (dbData.type as ListingType) || 'product',
        price: dbData.price || 0,
        condition: dbData.condition as ListingCondition,
        images: dbData.images || ['/placeholder-image.png'],
        createdAt: dbData.created_at,
        seller: {
          id: dbData.seller?.id || dbData.seller_id || 'unknown',
          name: dbData.seller?.name || 'Unknown Seller',
          image: dbData.seller?.image || '/placeholder-avatar.png',
          title: '',
          bio: ''
        },
        location: dbData.location || 'Unknown location',
        tags: dbData.tags || []
      } as Listing;
    } else {
      // Handle frontend format
      return {
        id: sourceData.id,
        title: sourceData.title || '',
        description: sourceData.description || '',
        type: (sourceData.type as ListingType) || 'product',
        price: sourceData.price || 0,
        condition: sourceData.condition as ListingCondition,
        images: sourceData.images || ['/placeholder-image.png'],
        createdAt: sourceData.createdAt || new Date().toISOString(),
        seller: {
          id: sourceData.seller?.id || 'unknown',
          name: sourceData.seller?.name || 'Unknown Seller',
          image: sourceData.seller?.image || '/placeholder-avatar.png',
          title: '',
          bio: ''
        },
        location: sourceData.location || 'Unknown location',
        tags: sourceData.tags || []
      } as Listing;
    }
  }, [sourceData]);
  
  const getTypeIcon = (type: ListingType) => {
    switch (type) {
      case 'product':
        return <Package className="h-5 w-5" />;
      case 'service':
        return <Briefcase className="h-5 w-5" />;
      case 'equipment':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !listing) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{listing.title} - Kootenay Tech Marketplace</title>
        <meta name="description" content={`${listing.title} - ${listing.price} - ${listing.description.substring(0, 150)}...`} />
      </Helmet>
      
      <ContentContainer>
        <PageHeader id={id as string} listing={listing} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <ListingDetails 
                listing={listing} 
                getTypeIcon={getTypeIcon} 
                onContactClick={() => setShowContactModal(true)} 
              />
            </Card>
            
            <Card>
              <SellerInfo seller={listing.seller} />
            </Card>
          </div>
          
          {/* Sidebar with related listings */}
          <div>
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Related Listings</h3>
                <RelatedListings id={id || ''} useRedux={useRedux} />
              </div>
            </Card>
          </div>
        </div>
        
        {/* Debug information */}
        <DetailDebug />
      </ContentContainer>

      {showContactModal && (
        <ContactModal
          listing={listing}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
}
