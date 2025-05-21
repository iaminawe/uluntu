import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import ResourcesList from '../../components/ResourcesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

// Define Resource type based on migration plan
interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'guide' | 'tool' | 'article' | 'video' | 'document';
  url: string;
  image?: string;
  dateAdded: string;
  contributor: {
    id: number;
    name: string;
  };
}

export default function ResourcesPage() {
  // These would normally come from a Tanstack Query hook like useResources()
  const isLoading = false;
  const error = null;
  const resources: Resource[] = []; // Would be populated from Tanstack Query
  const hasResources = resources.length > 0;
  
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
          <ResourcesList />
        )}
      </ContentContainer>
    </>
  );
}
