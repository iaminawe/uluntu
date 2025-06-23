import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import ResourcesList from '@/features/resources/components/ResourcesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useResourcesWithFilters } from '@/hooks/useResourceQueries';

// Resource type is already defined in the types.ts file

export default function ResourcesPage() {
  const [filters, setFilters] = useState<{ search?: string; types?: string[] }>({});
  
  // Use React Query with filters
  const { data: resources = [], isLoading, isError, error, refetch } = useResourcesWithFilters(filters);
  const hasResources = resources.length > 0;
  
  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
  };
  
  const handleTypeChange = (type: string) => {
    if (type === 'all') {
      setFilters(prev => ({ ...prev, types: undefined }));
    } else {
      setFilters(prev => ({ ...prev, types: [type] }));
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
        ) : isError ? (
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
