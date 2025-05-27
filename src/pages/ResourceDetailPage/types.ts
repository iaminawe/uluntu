// Types for ResourceDetailPage components
import { Resource } from '../../types';

// Use the type from the main application's Resource type
export type ResourceType = Resource['type'];

// Renamed to avoid conflict with imported Resource type
export interface DetailPageResource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  dateAdded: string; // Using dateAdded to match the main Resource type
  tags: string[];
  createdBy: {
    id: number;
    name: string;
    image: string;
    title: string;
    bio: string;
  };
  group?: {
    id: number;
    name: string;
  };
  relatedResources?: RelatedResource[];
}

export interface RelatedResource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  dateAdded: string; // Using dateAdded to match the main Resource type
  createdBy: {
    name: string;
    image: string;
  };
}

export interface PageHeaderProps {
  id: string;
}

export interface ResourceInfoProps {
  resource: Resource;
  getTypeIcon: (type: ResourceType) => JSX.Element;
}

export interface ResourceSidebarProps {
  resource: Resource;
  getTypeIcon: (type: ResourceType) => JSX.Element;
}

export interface RelatedResourcesProps {
  relatedResources: RelatedResource[];
  getTypeIcon: (type: ResourceType) => JSX.Element;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoadingStateProps {
  // Can include any customization props in the future
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
