// Types for ResourceDetailPage components
export type ResourceType = 'document' | 'video' | 'image' | 'link' | 'presentation';

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  createdAt: string;
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
  createdAt: string;
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
