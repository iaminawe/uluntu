// Group Details related types
import { Group as MainGroup } from '../../types';

// Define local types for the component's expectations
export interface GroupMember {
  id: number; // Local component expects number IDs
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
  title?: string;
}

export interface GroupEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
}

export interface GroupResource {
  id: number;
  title: string;
  type: string;
  url: string;
  addedDate: string;
  description: string;
}

export interface GroupPost {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  image?: string;
}

// Local Group interface
export interface Group {
  id: number;
  name: string;
  description: string;
  longDescription?: string;
  heroImage: string;
  coverImage?: string;
  visibility: 'open' | 'closed' | 'secret';
  memberCount: number;
  eventCount?: number;
  resourceCount?: number;
  postCount?: number;
  lastActive?: string;
  members: GroupMember[];
  events: GroupEvent[];
  resources: GroupResource[];
  posts: GroupPost[];
}

// Utility function to convert from main Group type to local Group type
export const adaptMainGroupToLocalGroup = (mainGroup: MainGroup): Group => {
  return {
    id: parseInt(mainGroup.id), // Convert string ID to number
    name: mainGroup.name,
    description: mainGroup.description,
    longDescription: mainGroup.longDescription,
    heroImage: mainGroup.heroImage,
    coverImage: mainGroup.coverImage,
    visibility: mainGroup.visibility,
    memberCount: mainGroup.memberCount,
    eventCount: mainGroup.eventCount,
    resourceCount: mainGroup.resourceCount,
    postCount: mainGroup.postCount,
    lastActive: mainGroup.lastActive,
    // Convert members, events, resources, and posts as needed
    members: mainGroup.members.map(member => ({
      id: parseInt(member.id),
      name: member.name,
      image: member.image,
      role: member.role,
      joinedDate: member.joinedDate,
      title: member.title
    })),
    events: mainGroup.events?.map(event => ({
      id: parseInt(event.id),
      title: event.title,
      date: event.date,
      description: event.description,
      image: event.image
    })) || [],
    resources: mainGroup.resources?.map(resource => ({
      id: parseInt(resource.id),
      title: resource.title,
      type: resource.type,
      url: resource.url,
      addedDate: resource.dateAdded,
      description: resource.description
    })) || [],
    posts: mainGroup.posts?.map(post => ({
      id: parseInt(post.id),
      title: post.title,
      excerpt: post.excerpt,
      author: {
        name: post.author.name,
        image: post.author.image
      },
      date: post.date,
      image: post.image
    })) || []
  };
};

// Sample data
export const SAMPLE_GROUP: Group = {
  id: 1,
  name: 'AI Enthusiasts Uluntu',
  description: 'A group for anyone interested in artificial intelligence and its applications.',
  longDescription: `Our group brings together professionals, enthusiasts, and learners passionate about artificial intelligence and its real-world applications. We focus on:

- Monthly meetups featuring expert presentations
- Hands-on workshops and coding sessions
- Discussion of AI ethics and best practices
- Networking and collaboration opportunities
- Knowledge sharing and mentorship

Whether you're an AI expert or just starting to explore this field, you're welcome to join us!`,
  heroImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
  coverImage: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg',
  visibility: 'open',
  memberCount: 45,
  members: [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'AI Research Lead',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      role: 'admin',
      joinedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'ML Engineer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      role: 'member',
      joinedDate: '2024-02-01'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      title: 'Data Scientist',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
      role: 'member',
      joinedDate: '2024-02-15'
    }
  ],
  events: [
    {
      id: 1,
      title: 'AI Ethics Workshop',
      date: '2025-06-15T18:00:00',
      description: 'Join us for an interactive workshop on AI ethics.',
      image: 'https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg'
    },
    {
      id: 2,
      title: 'Machine Learning Study Group',
      date: '2025-06-20T19:00:00',
      description: 'Monthly meetup to discuss and practice ML concepts.',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    }
  ],
  resources: [
    {
      id: 1,
      title: 'Getting Started with AI',
      type: 'Guide',
      url: '#',
      addedDate: '2024-03-01',
      description: 'A comprehensive guide for beginners in AI.'
    },
    {
      id: 2,
      title: 'ML Workshop Slides',
      type: 'Presentation',
      url: '#',
      addedDate: '2024-03-15',
      description: 'Slides from our recent machine learning workshop.'
    }
  ],
  posts: [
    {
      id: 1,
      title: 'Recap: February AI Ethics Workshop',
      excerpt: 'Highlights from our latest workshop on ethical considerations in AI development.',
      author: {
        name: 'Sarah Johnson',
        image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
      },
      date: '2024-02-16',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    },
    {
      id: 2,
      title: 'Announcing Our New ML Study Group',
      excerpt: 'Join our monthly machine learning study sessions starting next month.',
      author: {
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
      },
      date: '2024-02-10'
    }
  ]
};
