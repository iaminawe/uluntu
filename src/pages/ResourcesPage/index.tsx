import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import ResourcesList from '../../components/ResourcesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useResources } from '../../hooks/useQueries';

// Resource type is already defined in the types.ts file

export default function ResourcesPage() {
  // Use the useResources hook to fetch resources data
  const { data: resources = [], isLoading, error } = useResources();
  const hasResources = resources.length > 0;
  
  useEffect(() => {
    console.log('ResourcesPage - Resources:', resources);
    console.log('ResourcesPage - Loading:', isLoading);
    console.log('ResourcesPage - Error:', error);
  }, [resources, isLoading, error]);
  
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
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying resources query')} 
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
