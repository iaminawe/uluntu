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
import { useResourceRedux } from '@/features/resources/hooks/useResourcesRedux';

// This would normally come from a hook like useResource
const SAMPLE_RESOURCE: Resource = {
  id: '1',
  title: 'Introduction to AI Ethics',
  description: 'A comprehensive guide to ethical considerations in AI development. This resource covers important topics like bias in AI, privacy concerns, transparency in algorithms, and ethical guidelines for AI practitioners.',
  type: 'document',
  url: 'https://example.com/ai-ethics-guide',
  dateAdded: '2024-03-01',
  contributor: {
    id: '1',
    name: 'Sarah Johnson'
  },
  groupId: '1',
  image: '/images/ai-ethics.jpg'
};

// Sample related resources that would normally come from a hook like useRelatedResources
const RELATED_RESOURCES: Resource[] = [
    {
      id: '2',
      title: 'Machine Learning Workshop Recording',
      description: 'Recording of our February workshop on practical ML applications.',
      type: 'video',
      url: 'https://example.com/ml-workshop',
      dateAdded: '2024-02-15',
      contributor: {
        id: '2',
        name: 'Michael Chen'
      },
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    {
      id: '3',
      title: 'AI Ethics Presentation Slides',
      description: 'Slides from the recent AI ethics presentation at Kootenay Tech Meetup.',
      type: 'document',
      url: 'https://example.com/ai-ethics-slides',
      dateAdded: '2024-02-28',
      contributor: {
        id: '3',
        name: 'Emma Wilson'
      },
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
    }
  ];

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Use the Redux hook to fetch resource data
  const { resource, isLoading, isError, error } = useResourceRedux(id);
  
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
        <title>{resource.title} - Kootenay Tech Community</title>
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
                  relatedResources={RELATED_RESOURCES} 
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
