import React from 'react';
import { FileText, Video, Link } from 'lucide-react'; // Removed Image, Presentation
import { Resource } from '../../data/mock/mockData'; // Use Resource from mockData

export const getTypeIcon = (type: Resource['type']): React.ReactNode => { // Use Resource['type']
  switch (type) {
    case 'document':
      return React.createElement(FileText, { className: "h-4 w-4" });
    case 'video':
      return React.createElement(Video, { className: "h-4 w-4" });
    case 'article': // New type
      return React.createElement(FileText, { className: "h-4 w-4" });
    case 'guide': // New type
      return React.createElement(FileText, { className: "h-4 w-4" });
    case 'tool': // New type
      return React.createElement(Link, { className: "h-4 w-4" });
    default:
      return React.createElement(FileText, { className: "h-4 w-4" });
  }
};

export const getResourceTypeLabel = (type: Resource['type']): string => { // Use Resource['type']
  switch (type) {
    case 'document':
      return 'Document';
    case 'video':
      return 'Video';
    case 'article': // New type
      return 'Article';
    case 'guide': // New type
      return 'Guide';
    case 'tool': // New type
      return 'Tool';
    default:
      // This is a type guard to ensure we handle the case properly
      // In reality, this should never happen as we've covered all ResourceType values
      const unknownType = type as string;
      return unknownType.charAt(0).toUpperCase() + unknownType.slice(1);
  }
};
