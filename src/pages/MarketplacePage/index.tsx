import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import MarketplaceList from '@/features/marketplace/components/MarketplaceList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useFilteredMarketplaceListingsRedux } from '@/features/marketplace/hooks/useMarketplaceRedux';
import { ListingType, ListingCondition } from '@/features/marketplace/components/MarketplaceList/types';
import Debug from './Debug'; // Import the debug component
import DirectListings from './DirectListings'; // Import the simplified component

export default function MarketplacePage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<ListingCondition | 'all'>('all');
  
  // Use the Redux hook to fetch filtered marketplace data
  const { 
    filteredListings: marketplaceItems = [], 
    isLoading, 
    isError,
    error,
    updateFilters 
  } = useFilteredMarketplaceListingsRedux();
  
  // Update filters when search term or filter selections change
  useEffect(() => {
    updateFilters({
      search: searchTerm,
      types: selectedType !== 'all' ? [selectedType] : undefined,
      condition: selectedCondition !== 'all' ? selectedCondition : undefined
    });
  }, [searchTerm, selectedType, selectedCondition, updateFilters]);
  
  const hasItems = marketplaceItems?.length > 0;
  
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
        
        <div>
          {/* MarketplaceList Component with Redux */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Marketplace Listings</h2>
            <MarketplaceList 
              initialSearch={searchTerm}
              initialType={selectedType}
              useRedux={true} /* Use Redux for state management */
            />
          </div>
          
          {/* Debug component and direct listings for comparison */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <DirectListings />
              <Debug />
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
}
