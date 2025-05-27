import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import ResourcesList from '../../components/ResourcesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useResourcesRedux } from '../../hooks/useResourcesRedux';

// Resource type is already defined in the types.ts file

export default function ResourcesPage() {
  // Use the Redux-based hook to fetch resources data
  const { resources, loadResources, isLoading, isError, error } = useResourcesRedux();
  const hasResources = resources.length > 0;
  
  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);
  
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
