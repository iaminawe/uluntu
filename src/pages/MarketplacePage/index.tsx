import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import MarketplaceList from '../../components/MarketplaceList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useMarketplaceItemsWithFilters } from '../../hooks/useQueries';
import { ListingType, ListingCondition } from '../../components/MarketplaceList/types';

export default function MarketplacePage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<ListingCondition | 'all'>('all');
  
  // Use the useMarketplaceItemsWithFilters hook to fetch filtered marketplace data
  const { data: marketplaceItems = [], isLoading, error } = useMarketplaceItemsWithFilters({
    search: searchTerm,
    type: selectedType !== 'all' ? selectedType : undefined,
    condition: selectedCondition !== 'all' ? selectedCondition : undefined
  });
  
  const hasItems = marketplaceItems.length > 0;
  
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
            retry={() => console.log('Retrying query')} 
            message="We couldn't load the marketplace items. Please try again."
          />
        ) : !hasItems ? (
          <EmptyState
            title="No Marketplace Items Found"
            description="There are no items listed in the marketplace yet."
            primaryActionUrl="/marketplace/create"
            primaryAction={{
              text: "List an Item",
              onClick: () => console.log('Navigate to create marketplace item')
            }}
          />
        ) : (
          <MarketplaceList 
            initialSearch={searchTerm}
            initialType={selectedType}
          />
        )}
      </ContentContainer>
    </>
  );
}
