// Types for ResourcesPreview component
import { Resource } from '../../data/mock/mockData';

export interface ResourcesPreviewProps {
  title?: string;
  resources?: Resource[];
  maxResources?: number;
}

export interface ResourceCardProps {
  resource: Resource;
}
