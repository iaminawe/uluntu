import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Video, Image, Link as LinkIcon, Presentation } from 'lucide-react';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import PageHeader from './PageHeader';
import ResourceInfo from './ResourceInfo';
import ResourceSidebar from './ResourceSidebar';
import RelatedResources from './RelatedResources';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { Resource, ResourceType } from './types';

// This would normally come from a hook like useResource
const SAMPLE_RESOURCE: Resource = {
  id: 1,
  title: 'Introduction to AI Ethics',
  description: 'A comprehensive guide to ethical considerations in AI development. This resource covers important topics like bias in AI, privacy concerns, transparency in algorithms, and ethical guidelines for AI practitioners.',
  type: 'document' as ResourceType,
  url: 'https://example.com/ai-ethics-guide',
  createdAt: '2024-03-01',
  tags: ['AI', 'Ethics', 'Technology', 'Guidelines'],
  createdBy: {
    id: 1,
    name: 'Sarah Johnson',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    title: 'AI Researcher',
    bio: 'Specializing in ethical AI development and implementation.'
  },
  group: {
    id: 1,
    name: 'AI Enthusiasts Kootenay'
  },
  relatedResources: [
    {
      id: 2,
      title: 'Machine Learning Workshop Recording',
      description: 'Recording of our February workshop on practical ML applications.',
      type: 'video' as ResourceType,
      createdAt: '2024-02-15',
      createdBy: {
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
      }
    },
    {
      id: 3,
      title: 'AI Ethics Presentation Slides',
      description: 'Slides from the recent AI ethics presentation at Kootenay Tech Meetup.',
      type: 'presentation' as ResourceType,
      createdAt: '2024-02-28',
      createdBy: {
        name: 'Emma Wilson',
        image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
      }
    }
  ]
};

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // This would normally come from a hook like useResource(id)
  const resource = SAMPLE_RESOURCE;
  const isLoading = false;
  const error = null;
  
  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'presentation':
        return <Presentation className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !resource) {
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
                  relatedResources={resource.relatedResources || []} 
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
