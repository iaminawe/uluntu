import { BaseEntity, ContentStatus } from './types';

export interface Resource extends BaseEntity {
  title: string;
  description: string;
  url: string;
  type: 'guide' | 'tool' | 'article' | 'video' | 'document' | 'link';
  tags: string[];
  contributor: {
    id: string;
    name: string;
  };
  groupId?: string;
  dateAdded: string;
  image?: string;
}

export const resources: Resource[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    description: 'A comprehensive guide to React fundamentals',
    url: 'https://react.dev/learn',
    type: 'guide',
    tags: ['react', 'javascript', 'frontend'],
    contributor: {
      id: '1',
      name: 'John Doe'
    },
    dateAdded: '2024-01-15T00:00:00Z',
    status: 'published' as ContentStatus,
    featured: false,
    image: undefined
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    description: 'Learn TypeScript best practices for better code',
    url: 'https://typescript-eslint.io/rules/',
    type: 'article',
    tags: ['typescript', 'javascript', 'best-practices'],
    contributor: {
      id: '2',
      name: 'Jane Smith'
    },
    dateAdded: '2024-01-20T00:00:00Z',
    status: 'published' as ContentStatus,
    featured: true,
    image: undefined
  }
];