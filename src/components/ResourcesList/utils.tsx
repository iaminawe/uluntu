import { FileText, Video, Image, Link as LinkIcon, Presentation } from 'lucide-react';
import { ResourceType } from './types';

// Helper function to get the appropriate icon for a resource type
export const getTypeIcon = (type: ResourceType) => {
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
  }
};
