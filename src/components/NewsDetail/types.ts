// NewsDetail types

export interface NewsAuthor {
  id: number;
  name: string;
  image: string;
  title?: string;
  bio?: string;
}

export interface NewsAssociation {
  type: 'company' | 'group' | 'event' | 'member';
  id: number;
  name: string;
}

export interface NewsComment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    image: string;
  };
}

export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image?: string;
  publishedAt: string;
  author: NewsAuthor;
  associations?: NewsAssociation[];
  tags: string[];
  comments: NewsComment[];
}

// Sample data
export const SAMPLE_ARTICLE: NewsArticle = {
  id: 1,
  title: 'Kootenay Tech Scene Continues to Grow',
  content: `The Kootenay region's technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base.

This trend is driven by several factors, including:

- The rise of remote work
- High quality of life in the Kootenays
- Growing tech community and support networks
- Affordable housing compared to major tech hubs

Local organizations are playing a crucial role in supporting this growth through mentorship programs, networking events, and resource sharing initiatives.

The impact on the local economy has been significant, with new job opportunities being created and increased investment in the region's digital infrastructure.

Looking ahead, community leaders are focused on sustainable growth that maintains the region's unique character while fostering innovation and technological advancement.`,
  image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
  publishedAt: '2025-03-15',
  author: {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Tech Community Lead',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Sarah has been involved in the Kootenay tech scene for over 5 years and is passionate about building inclusive tech communities.'
  },
  associations: [
    { type: 'company', id: 1, name: 'Mountain Tech Solutions' },
    { type: 'group', id: 1, name: 'Kootenay Tech Organizers' }
  ],
  tags: ['Community', 'Growth', 'Startups'],
  comments: [
    {
      id: 1,
      content: 'Great to see the tech community growing! Looking forward to more collaboration opportunities.',
      createdAt: '2025-03-15T14:30:00',
      author: {
        id: 2,
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
      }
    }
  ]
};
