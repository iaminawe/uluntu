import React from 'react';
import { FileText, Video, Image, Link, Presentation } from 'lucide-react';
import { ResourceType } from './types';

export const getTypeIcon = (type: ResourceType): React.ReactNode => {
  switch (type) {
    case 'document':
      return React.createElement(FileText, { className: "h-4 w-4" });
    case 'video':
      return React.createElement(Video, { className: "h-4 w-4" });
    case 'image':
      return React.createElement(Image, { className: "h-4 w-4" });
    case 'link':
      return React.createElement(Link, { className: "h-4 w-4" });
    case 'presentation':
      return React.createElement(Presentation, { className: "h-4 w-4" });
    default:
      return React.createElement(FileText, { className: "h-4 w-4" });
  }
};

export const getResourceTypeLabel = (type: ResourceType): string => {
  switch (type) {
    case 'document':
      return 'Document';
    case 'video':
      return 'Video';
    case 'image':
      return 'Image';
    case 'link':
      return 'Link';
    case 'presentation':
      return 'Presentation';
    default:
      // This is a type guard to ensure we handle the case properly
      // In reality, this should never happen as we've covered all ResourceType values
      const unknownType = type as string;
      return unknownType.charAt(0).toUpperCase() + unknownType.slice(1);
  }
};
