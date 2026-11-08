import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Video, BookOpen, Wrench, FileText as ArticleIcon } from 'lucide-react';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import PageHeader from './PageHeader';
import ResourceInfo from './ResourceInfo';
import ResourceSidebar from './ResourceSidebar';
import RelatedResources from './RelatedResources';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { Resource } from '../../types';
import { useResource } from '@/hooks/useResourceQueries';


export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Use React Query to fetch resource data
  const { data: resource, isLoading, isError } = useResource(id);
  
  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'guide':
        return <BookOpen className="h-5 w-5" />;
      case 'tool':
        return <Wrench className="h-5 w-5" />;
      case 'article':
        return <ArticleIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !resource) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{resource.title} - Uluntu</title>
        <meta name="description" content={resource.description.substring(0, 160)} />
      </Helmet>
      
      <ContentContainer>
        <PageHeader id={id || ''} />
        
        <Card className="overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <ResourceInfo 
                  resource={resource} 
                  getTypeIcon={getTypeIcon} 
                />
                
                <RelatedResources 
                  relatedResources={[]} 
                  getTypeIcon={getTypeIcon} 
                />
              </div>
              
              {/* Sidebar */}
              <ResourceSidebar 
                resource={resource} 
                getTypeIcon={getTypeIcon} 
              />
            </div>
          </div>
        </Card>
      </ContentContainer>
    </>
  );
}
