import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import MarketplaceList from '@/features/marketplace/components/MarketplaceList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { ListingType, ListingCondition } from '@/features/marketplace/components/MarketplaceList/types';

export default function MarketplacePage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<ListingCondition | 'all'>('all');
  
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
          {/* MarketplaceList Component with filters */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Marketplace Listings</h2>
            <MarketplaceList 
              searchTerm={searchTerm}
              selectedType={selectedType}
              selectedCondition={selectedCondition}
            />
          </div>
        </div>
      </ContentContainer>
    </>
  );
}
