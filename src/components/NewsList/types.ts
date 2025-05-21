// Types for NewsList component

export interface NewsAuthor {
  id?: number;
  name: string;
  image: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  publishedAt: string;
  author: NewsAuthor;
  tags: string[];
}

export interface NewsListProps {
  initialTag?: string;
  initialSearch?: string;
}

export interface FilterOptions {
  search: string;
  tag: string;
}

// Sample news articles for local development
export const SAMPLE_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: 'Kootenay Tech Scene Continues to Grow',
    excerpt: 'The Kootenay region\'s technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base.',
    content: 'The Kootenay region\'s technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base. This trend is driven by several factors, including the rise of remote work, high quality of life in the Kootenays, growing tech community and support networks, and affordable housing compared to major tech hubs.',
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
    publishedAt: '2025-03-15',
    author: {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    tags: ['Community', 'Growth', 'Startups']
  },
  {
    id: 2,
    title: 'Local AI Startup Secures Major Funding',
    excerpt: 'A Nelson-based artificial intelligence startup has secured $2.5 million in seed funding to develop innovative solutions for environmental monitoring.',
    content: 'A Nelson-based artificial intelligence startup has secured $2.5 million in seed funding to develop innovative solutions for environmental monitoring. The company, founded by former environmental scientists, uses machine learning algorithms to analyze satellite imagery and sensor data to track environmental changes and predict potential issues before they become critical.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    publishedAt: '2025-03-10',
    author: {
      id: 2,
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    tags: ['AI', 'Funding', 'Environment']
  },
  {
    id: 3,
    title: 'Tech Community Hosts Successful Developer Conference',
    excerpt: 'The annual Kootenay Developer Conference attracted over 300 participants this year, highlighting the growing tech ecosystem in the region.',
    content: 'The annual Kootenay Developer Conference attracted over 300 participants this year, highlighting the growing tech ecosystem in the region. The two-day event featured workshops, keynote speeches, and networking opportunities for developers, designers, and tech entrepreneurs from across British Columbia and beyond.',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    publishedAt: '2025-03-05',
    author: {
      id: 3,
      name: 'Emma Wilson',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
    },
    tags: ['Events', 'Community', 'Development']
  },
  {
    id: 4,
    title: 'New Co-Working Space Opens in Rossland',
    excerpt: 'A new tech-focused co-working space has opened in Rossland, providing flexible working options for remote workers and local startups.',
    content: 'A new tech-focused co-working space has opened in Rossland, providing flexible working options for remote workers and local startups. The facility offers high-speed internet, private meeting rooms, and a collaborative environment designed to foster innovation and community connections.',
    image: 'https://images.pexels.com/photos/7070/space-desk-workspace-coworking.jpg',
    publishedAt: '2025-02-28',
    author: {
      id: 4,
      name: 'David Thompson',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    tags: ['Co-working', 'Facilities', 'Remote Work']
  },
  {
    id: 5,
    title: 'Kootenay Tech Companies Commit to Sustainability Goals',
    excerpt: 'A consortium of local tech companies has pledged to achieve carbon neutrality by 2030, setting an example for sustainable business practices.',
    content: 'A consortium of local tech companies has pledged to achieve carbon neutrality by 2030, setting an example for sustainable business practices. The initiative includes transitioning to renewable energy sources, implementing green office policies, and developing eco-friendly products and services.',
    image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg',
    publishedAt: '2025-02-20',
    author: {
      id: 5,
      name: 'Jessica Lee',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    tags: ['Sustainability', 'Business', 'Environment']
  }
];
