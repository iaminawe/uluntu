// Resources types
export type { Resource } from '@/types';
import type { ContentStatus } from '@/types/common';
export type { ContentStatus };

export interface ResourceFilters {
  search?: string;
  types?: string[];
  tags?: string[];
  featured?: boolean;
}

export interface ResourceInput {
  title: string;
  description: string;
  type: 'guide' | 'tool' | 'article' | 'video' | 'document' | 'link' | 'gallery';
  url: string;
  image?: string;
  dateAdded: string;
  contributor: {
    id: string;
    name: string;
  };
  groupId?: string;
  tags?: string[];
  status?: ContentStatus;
  featured?: boolean;
}