import React from 'react';
import { FileText, Video, BookOpen, Wrench, FileText as ArticleIcon } from 'lucide-react';
import { Resource } from '../../types';

// Define a type alias for the Resource type property
type ResourceTypeAlias = Resource['type'];

export const getTypeIcon = (type: ResourceTypeAlias): React.ReactNode => {
  switch (type) {
    case 'document':
      return React.createElement(FileText, { className: "h-4 w-4" });
    case 'video':
      return React.createElement(Video, { className: "h-4 w-4" });
    case 'guide':
      return React.createElement(BookOpen, { className: "h-4 w-4" });
    case 'tool':
      return React.createElement(Wrench, { className: "h-4 w-4" });
    case 'article':
      return React.createElement(ArticleIcon, { className: "h-4 w-4" });
    default:
      return React.createElement(FileText, { className: "h-4 w-4" });
  }
};

export const getResourceTypeLabel = (type: ResourceTypeAlias): string => {
  switch (type) {
    case 'document':
      return 'Document';
    case 'video':
      return 'Video';
    case 'guide':
      return 'Guide';
    case 'tool':
      return 'Tool';
    case 'article':
      return 'Article';
    default:
      return 'Resource';
  }
};
