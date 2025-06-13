import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import ResourcesList from '@/features/resources/components/ResourcesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useResourcesRedux } from '@/features/resources/hooks/useResourcesRedux';

// Resource type is already defined in the types.ts file

export default function ResourcesPage() {
  // Use the Redux-based hook to fetch resources data
  const { resources, loadResources, isLoading, isError, error } = useResourcesRedux();
  const hasResources = resources.length > 0;
  
  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Resources - Kootenay Tech Community</title>
        <meta name="description" content="Tech resources and learning materials for the Kootenay tech community" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar />
        
        {isLoading ? (
          <SkeletonGrid count={9} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : isError ? (
          <QueryError 
            error={error ? new Error(error) : new Error('Failed to load resources')} 
            retry={() => loadResources()} 
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
          <ResourcesList resources={resources} useRedux={true} />
        )}
      </ContentContainer>
    </>
  );
}
