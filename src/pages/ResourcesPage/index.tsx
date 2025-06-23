import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import ResourcesList from '@/features/resources/components/ResourcesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useResourcesHybrid } from '@/features/resources/hooks/useResourcesHybrid';

// Resource type is already defined in the types.ts file

export default function ResourcesPage() {
  // Use hybrid hook for consistent pattern
  const { 
    resources, 
    isLoading, 
    error, 
    refetch, 
    setSearchTerm, 
    setTypes, 
    filters 
  } = useResourcesHybrid();
  
  const hasResources = resources.length > 0;
  
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm || undefined);
  };
  
  const handleTypeChange = (type: string) => {
    if (type === 'all') {
      setTypes(undefined);
    } else {
      setTypes([type]);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Resources - Kootenay Tech Community</title>
        <meta name="description" content="Tech resources and learning materials for the Kootenay tech community" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          onSearch={handleSearch}
          onTypeChange={handleTypeChange}
          currentFilters={filters}
        />
        
        {isLoading ? (
          <SkeletonGrid count={9} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : error ? (
          <QueryError 
            error={error || new Error('Failed to load resources')} 
            retry={() => refetch()} 
            message="We couldn't load the resources. Please try again."
          />
        ) : !hasResources ? (
          <EmptyState 
            title="No resources available"
            description="Be the first to share a valuable resource with the community!"
            primaryAction={{ text: "Add New Resource", onClick: () => {} }}
            primaryActionUrl="/resources/create"
          />
        ) : (
          <ResourcesList resources={resources} />
        )}
      </ContentContainer>
    </>
  );
}
