import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import MarketplaceList from '@/features/marketplace/components/MarketplaceList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { ListingType, ListingCondition } from '@/features/marketplace/components/MarketplaceList/types';
import { useMarketplaceHybrid } from '@/features/marketplace/hooks/useMarketplaceHybrid';
import { useEnabledFeatures } from '@/hooks/useSettings';

export default function MarketplacePage() {
  // Check if marketplace feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const marketplaceEnabled = isFeatureEnabled('marketplace');

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<ListingCondition | 'all'>('all');

  // Use hybrid hook for marketplace data
  const { listings, isLoading, error, refetch } = useMarketplaceHybrid();

  const hasListings = listings && listings.length > 0;

  // Redirect if marketplace is disabled
  if (!featuresLoading && !marketplaceEnabled) {
    return <Navigate to="/" replace />;
  }

  // Show loading while checking features
  if (featuresLoading) {
    return <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />;
  }
  
  return (
    <>
      <Helmet>
        <title>Marketplace - Kootenay Tech Community</title>
        <meta name="description" content="Tech marketplace for services, products, and equipment in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
        />
        
        {isLoading ? (
          <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={refetch} 
            message="We couldn't load the marketplace listings. Please try again."
          />
        ) : !hasListings ? (
          <EmptyState
            title="No Listings Found"
            description="There are no marketplace listings available yet."
            primaryActionUrl="/marketplace/create"
            primaryAction={{
              text: "Create a Listing",
              onClick: () => console.log('Navigate to create listing')
            }}
          />
        ) : (
          <div>
            {/* MarketplaceList Component with filters */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Marketplace Listings</h2>
              <MarketplaceList 
                searchTerm={searchTerm}
                selectedType={selectedType}
                selectedCondition={selectedCondition}
                listings={listings}
                loading={isLoading}
                error={error}
              />
            </div>
          </div>
        )}
      </ContentContainer>
    </>
  );
}
