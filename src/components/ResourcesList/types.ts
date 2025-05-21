// ResourcesList types

export type ResourceType = 'document' | 'video' | 'image' | 'link' | 'presentation';

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  createdAt: string;
  createdBy: {
    name: string;
    image: string;
  };
  group?: {
    id: number;
    name: string;
  };
  event?: {
    id: number;
    name: string;
  };
}

// Sample data
export const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 1,
    title: 'Introduction to AI Ethics',
    description: 'A comprehensive guide to ethical considerations in AI development.',
    type: 'document',
    url: '#',
    createdAt: '2024-03-01',
    createdBy: {
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    group: {
      id: 1,
      name: 'AI Enthusiasts Kootenay'
    }
  },
  {
    id: 2,
    title: 'Machine Learning Workshop Recording',
    description: 'Recording of our February workshop on practical ML applications.',
    type: 'video',
    url: '#',
    createdAt: '2024-02-15',
    createdBy: {
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    event: {
      id: 1,
      name: 'ML Workshop February 2024'
    }
  }
];
