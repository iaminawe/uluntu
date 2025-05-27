// NewsDetail types
import { NewsArticle as MainNewsArticle } from '../../types';

// We'll keep the local NewsComment type since it's not in the main types
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

// We'll keep the local NewsAssociation type since it's not in the main types
export interface NewsAssociation {
  type: 'company' | 'group' | 'event' | 'member';
  id: number;
  name: string;
}

// Define a local NewsArticle type that extends the main one with additional properties
export interface NewsArticle extends Omit<MainNewsArticle, 'id' | 'author'> {
  id: number; // Local component expects number IDs
  publishedAt: string; // Maps to 'date' in the main type
  author: {
    id: number; // Local component expects number IDs
    name: string;
    image: string;
    title?: string;
    bio?: string;
  };
  associations?: NewsAssociation[];
  comments: NewsComment[];
}

// Utility function to convert from main NewsArticle type to local NewsArticle type
export const adaptMainNewsArticleToLocal = (mainArticle: MainNewsArticle): NewsArticle => {
  // Handle potential parsing errors by using a safe conversion function
  const safeParseInt = (strId: string): number => {
    const parsed = parseInt(strId, 10);
    return isNaN(parsed) ? 0 : parsed; // Fallback to 0 if parsing fails
  };

  return {
    id: safeParseInt(mainArticle.id),
    title: mainArticle.title,
    slug: mainArticle.slug || '',
    excerpt: mainArticle.excerpt || '',
    content: mainArticle.content,
    image: mainArticle.image || '',
    publishedAt: mainArticle.date,
    date: mainArticle.date, // Keep the original date field for compatibility
    tags: mainArticle.tags || [],
    author: {
      id: mainArticle.author.id ? safeParseInt(mainArticle.author.id) : 0,
      name: mainArticle.author.name,
      image: mainArticle.author.image,
      title: '',
      bio: ''
    },
    associations: [], // Default empty associations
    comments: [] // Default empty comments
  };
};

// Utility function to convert from local NewsArticle type to main NewsArticle type
export const adaptLocalNewsArticleToMain = (localArticle: NewsArticle): MainNewsArticle => {
  return {
    id: localArticle.id.toString(),
    title: localArticle.title,
    slug: localArticle.slug,
    excerpt: localArticle.excerpt,
    content: localArticle.content,
    image: localArticle.image,
    date: localArticle.publishedAt,
    tags: localArticle.tags,
    author: {
      id: localArticle.author.id.toString(),
      name: localArticle.author.name,
      image: localArticle.author.image
    },
    hero_image_alt: ''
  };
};

// Sample data
export const SAMPLE_ARTICLE: NewsArticle = {
  id: 1,
  title: 'Kootenay Tech Scene Continues to Grow',
  slug: 'kootenay-tech-scene-continues-to-grow',
  excerpt: 'The Kootenay region\'s technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base.',
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
  date: '2025-03-15', // Added to match the main NewsArticle type
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
