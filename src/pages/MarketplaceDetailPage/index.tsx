import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Briefcase, Monitor } from 'lucide-react';
import { useMarketplaceItem } from '../../hooks/useSupabaseQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import { ListingType } from './types';
import PageHeader from './PageHeader';
import ListingDetails from './ListingDetails';
import SellerInfo from './SellerInfo';
import ContactModal from './ContactModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function MarketplaceDetailPage() {
  const { id } = useParams();
  const [showContactModal, setShowContactModal] = useState(false);
  
  // In a real application, this would use the useMarketplaceItem hook to fetch data
  // For now, we're using a sample listing
  const { data: listing, isLoading, error } = useMarketplaceItem(parseInt(id || '0'));
  
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
