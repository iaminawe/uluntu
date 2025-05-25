import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Briefcase, Monitor } from 'lucide-react';
import { useMarketplaceItem } from '../../hooks/useMarketplaceQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import { ListingType, Listing } from './types';
import PageHeader from './PageHeader';
import ListingDetails from './ListingDetails';
import SellerInfo from './SellerInfo';
import ContactModal from './ContactModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function MarketplaceDetailPage() {
  const { id } = useParams();
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Use the useMarketplaceItem hook to fetch data
  const { data: apiListing, isLoading, error } = useMarketplaceItem(id);
  
  // Convert API data to the expected Listing format
  const listing = useMemo(() => {
    if (!apiListing) return undefined;
    
    return {
      id: Number(apiListing.id),
      title: apiListing.title || '',
      description: apiListing.description || '',
      type: (apiListing.type as ListingType) || 'product',
      price: apiListing.price || 0,
      condition: apiListing.condition as ListingCondition,
      images: apiListing.images || ['/placeholder-image.png'],
      createdAt: apiListing.created_at || new Date().toISOString(),
      seller: {
        id: apiListing.seller ? Number(apiListing.seller.id) : 1,
        name: apiListing.seller ? apiListing.seller.name : 'Unknown Seller',
        image: apiListing.seller ? apiListing.seller.image : '/placeholder-avatar.png',
        title: '',
        bio: ''
      },
      location: apiListing.location || 'Unknown location',
      tags: apiListing.tags || []
    } as Listing;
  }, [apiListing]);
  
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
          
          {/* This would typically be a sidebar with related listings */}
          <div>
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Related Listings</h3>
                <p className="text-slate-500 dark:text-slate-400">No related listings available.</p>
              </div>
            </Card>
          </div>
        </div>
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
