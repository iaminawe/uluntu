import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import MarketplaceList from '../../components/MarketplaceList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function MarketplacePage() {
  // These would normally come from a hook like useMarketplaceItems()
  const isLoading = false;
  const error = null;
  const marketplaceItems: any[] = []; // Would be populated from API
  const hasItems = marketplaceItems.length > 0;
  
  return (
    <>
      <Helmet>
        <title>Marketplace - Kootenay Tech Community</title>
        <meta name="description" content="Tech marketplace for services, products, and equipment in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar />
        
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
          <MarketplaceList />
        )}
      </ContentContainer>
    </>
  );
}
