// Status type for all entities
export type EntityStatus = 'draft' | 'published' | 'archived';

// Member types
export interface Member {
  id: number;
  name: string;
  title: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  skills?: string[];
  joinDate: string;
  status: EntityStatus;
  featured?: boolean;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

// Company types
export interface Company {
  id: number;
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website?: string;
  status: EntityStatus;
  featured?: boolean;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  employees?: number[];
}

// Group types with visibility options
export interface GroupMember {
  id: number;
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
  lastActive: string;
  status: EntityStatus;
  featured?: boolean;
  members: GroupMember[];
  events?: GroupEvent[];
  resources?: GroupResource[];
  posts?: GroupPost[];
}

// Event types
export interface Event {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  image: string;
  organizer: {
    id: number;
    name: string;
    image: string;
  };
  attendees?: number;
  type: 'in-person' | 'online' | 'hybrid';
  url?: string;
  status: EntityStatus;
  featured?: boolean;
}

// News types
export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image?: string;
  author: {
    id: number;
    name: string;
    image: string;
  };
  tags?: string[];
  status: EntityStatus;
  featured?: boolean;
}

// Resources types
export interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'guide' | 'tool' | 'article' | 'video' | 'document';
  url: string;
  image?: string;
  dateAdded: string;
  contributor: {
    id: number;
    name: string;
  };
  status: EntityStatus;
  featured?: boolean;
}

// Marketplace types
export interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price?: number;
  type: 'product' | 'service' | 'equipment' | 'event';
  category: string;
  image?: string;
  seller: {
    id: number;
    name: string;
    image: string;
  };
  datePosted: string;
  status: EntityStatus;
  featured?: boolean;
}

// Opportunity types
export interface Opportunity {
  id: number;
  title: string;
  company: {
    id: number;
    name: string;
    logo: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  location: string;
  remote: boolean;
  description: string;
  salary?: string;
  postedDate: string;
  deadline?: string;
  status: EntityStatus;
  featured?: boolean;
}

// Mock data implementations from original components

// Members data
export const members: Member[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'AI Research Lead',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'AI researcher with 8+ years of experience in machine learning and neural networks.',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Research'],
    joinDate: '2023-05-15',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahjohnson',
      github: 'https://github.com/sarahjohnson'
    }
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'ML Engineer',
    company: 'Kootenay AI Solutions',
    location: 'Nelson, BC',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    bio: 'Machine learning engineer specializing in computer vision and natural language processing.',
    skills: ['Computer Vision', 'Python', 'NLP', 'PyTorch'],
    joinDate: '2023-06-01',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      github: 'https://github.com/michaelchen'
    }
  },
  {
    id: 3,
    name: 'Emma Wilson',
    title: 'Data Scientist',
    company: 'Data Insights Co.',
    location: 'Rossland, BC',
    image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
    bio: 'Data scientist passionate about using data to solve real-world problems.',
    skills: ['Data Analysis', 'R', 'Python', 'Statistics'],
    joinDate: '2023-07-15',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/emmawilson',
      twitter: 'https://twitter.com/emmawilson'
    }
  }
];

// Companies data
export const companies: Company[] = [
  {
    id: 1,
    name: 'Mountain Tech Solutions',
    description: 'Leading AI and machine learning solutions provider for the Kootenay region.',
    logo: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    coverImage: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    industry: ['Technology', 'Artificial Intelligence', 'Software Development'],
    size: '10-50 employees',
    founded: '2018',
    location: 'Nelson, BC',
    website: 'https://mountaintech.example.com',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/company/mountaintech',
      twitter: 'https://twitter.com/mountaintech',
      github: 'https://github.com/mountaintech'
    },
    employees: [1, 5, 8, 10]
  },
  {
    id: 2,
    name: 'Kootenay Tech Co-op',
    description: 'Cooperative workspace and incubator for tech startups in the Kootenay region.',
    logo: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    coverImage: 'https://images.pexels.com/photos/7097/people-coffee-tea-meeting.jpg',
    industry: ['Technology', 'Co-working', 'Startup Incubator'],
    size: '5-10 employees',
    founded: '2020',
    location: 'Nelson, BC',
    website: 'https://kootenaytechcoop.example.com',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/company/kootenaytechcoop',
      github: 'https://github.com/kootenaytechcoop'
    },
    employees: [2, 3, 7]
  }
];

// Groups data
export const groups: Group[] = [
  {
    id: 1,
    name: 'AI Enthusiasts Kootenay',
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
    eventCount: 3,
    resourceCount: 12,
    postCount: 8,
    lastActive: '2023-08-15',
    status: 'published',
    members: [
      {
        id: 1,
        name: 'Sarah Johnson',
        title: 'AI Research Lead',
        image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
        role: 'admin',
        joinedDate: '2023-01-15'
      },
      {
        id: 2,
        name: 'Michael Chen',
        title: 'ML Engineer',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        role: 'member',
        joinedDate: '2023-02-01'
      },
      {
        id: 3,
        name: 'Emma Wilson',
        title: 'Data Scientist',
        image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
        role: 'member',
        joinedDate: '2023-02-15'
      }
    ],
    events: [
      {
        id: 1,
        title: 'AI Ethics Workshop',
        date: '2024-06-15T18:00:00',
        description: 'Join us for an interactive workshop on AI ethics.',
        image: 'https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg'
      },
      {
        id: 2,
        title: 'Machine Learning Study Group',
        date: '2024-06-20T19:00:00',
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
        addedDate: '2023-03-01',
        description: 'A comprehensive guide for beginners in AI.'
      },
      {
        id: 2,
        title: 'ML Workshop Slides',
        type: 'Presentation',
        url: '#',
        addedDate: '2023-03-15',
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
        date: '2023-02-16',
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
        date: '2023-02-10'
      }
    ]
  },
  {
    id: 2,
    name: 'Kootenay Web Developers',
    description: 'Local community of web developers sharing knowledge and opportunities.',
    heroImage: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    visibility: 'open',
    memberCount: 32,
    eventCount: 2,
    resourceCount: 8,
    postCount: 5,
    lastActive: '2023-08-10',
    status: 'published',
    members: [
      {
        id: 4,
        name: 'David Johnson',
        title: 'Frontend Developer',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        role: 'admin',
        joinedDate: '2024-01-20'
      },
      {
        id: 5,
        name: 'Sophia Rodriguez',
        title: 'Full Stack Developer',
        image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        role: 'member',
        joinedDate: '2024-02-05'
      }
    ]
  },
  {
    id: 3,
    name: 'Kootenay Tech Entrepreneurs',
    description: 'A group for tech entrepreneurs and startup founders in the Kootenay region.',
    heroImage: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    visibility: 'closed',
    memberCount: 20,
    eventCount: 1,
    resourceCount: 5,
    postCount: 3,
    lastActive: '2024-05-01',
    status: 'published',
    members: [
      {
        id: 6,
        name: 'James Wilson',
        title: 'Startup Founder',
        image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
        role: 'admin',
        joinedDate: '2024-01-10'
      }
    ]
  }
];

// Events data
export const events: Event[] = [
  {
    id: 1,
    title: 'Kootenay Tech Meetup',
    date: '2025-06-15T18:00:00',
    endDate: '2025-06-15T20:00:00',
    location: 'Nelson Innovation Centre, Nelson BC',
    description: 'Monthly meetup for tech professionals in the Kootenay region. This month features presentations on AI and web development.',
    image: 'https://images.pexels.com/photos/7096/people-woman-coffee-meeting.jpg',
    organizer: {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    attendees: 25,
    type: 'in-person',
    status: 'published'
  },
  {
    id: 2,
    title: 'Web Development Workshop',
    date: '2025-06-20T19:00:00',
    endDate: '2025-06-20T21:00:00',
    location: 'Online via Zoom',
    description: 'Learn the latest web development techniques and technologies in this hands-on workshop.',
    image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg',
    organizer: {
      id: 4,
      name: 'David Johnson',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    attendees: 15,
    type: 'online',
    url: 'https://zoom.us/meeting',
    status: 'published'
  },
  {
    id: 3,
    title: 'Startup Pitch Night',
    date: '2025-06-25T18:30:00',
    endDate: '2025-06-25T21:00:00',
    location: 'KAST Office, Trail BC',
    description: 'Local tech startups pitch their ideas to potential investors and partners.',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    organizer: {
      id: 6,
      name: 'James Wilson',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg'
    },
    attendees: 30,
    type: 'in-person',
    status: 'published'
  }
];

// News articles
export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: 'Kootenay Tech Community Launches New Platform',
    excerpt: 'The Kootenay tech community celebrates the launch of a new platform designed to connect local tech professionals.',
    content: `The Kootenay tech community is proud to announce the launch of its new community platform, designed to connect tech professionals, entrepreneurs, and enthusiasts across the region.

This platform will serve as a central hub for the growing tech ecosystem in the Kootenays, facilitating connections, knowledge sharing, and collaboration opportunities.

"We're excited to bring together our vibrant tech community in a digital space that complements our in-person gatherings," said Sarah Johnson, one of the community organizers. "This platform will help us strengthen our local tech ecosystem and support the growth of tech initiatives in the region."

The platform features a directory of local tech professionals and companies, a calendar of tech events, resources for learning and development, and forums for discussion and collaboration.

Local tech professionals are encouraged to create profiles and start connecting with others in the community.`,
    date: '2024-05-15',
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
    author: {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    tags: ['Community', 'Launch', 'Technology'],
    status: 'published'
  },
  {
    id: 2,
    title: 'Local Tech Company Secures Major Investment',
    excerpt: 'Mountain Tech Solutions announces a significant investment to expand their AI development team.',
    content: `Mountain Tech Solutions, a leading software development company based in Nelson, has secured a significant investment to expand their AI research and development team.

The company, which specializes in artificial intelligence solutions and web applications, plans to use the funding to create new high-tech jobs in the region and accelerate the development of their innovative AI products.

"This investment is a vote of confidence in our team and our vision," said Michael Chen, Lead ML Engineer at Mountain Tech Solutions. "It will allow us to push the boundaries of what's possible with AI and create meaningful technology solutions from right here in the Kootenays."

The expansion is expected to create at least 10 new high-tech jobs in Nelson over the next year, further strengthening the region's growing reputation as a hub for technology innovation outside of major urban centers.`,
  date: '2024-05-10',
  image: 'https://images.pexels.com/photos/3183152/pexels-photo-3183152.jpeg',
  author: {
    id: 2,
    name: 'Michael Chen',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
  },
  tags: ['Investment', 'AI', 'Jobs'],
  status: 'published'
}
];

// Resources
export const resources: Resource[] = [
{
  id: 1,
  title: 'Getting Started with AI Development',
  description: 'A comprehensive guide for beginners looking to get started with artificial intelligence development.',
  type: 'guide',
  url: 'https://example.com/ai-guide',
  image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
  dateAdded: '2024-04-05',
  contributor: {
    id: 1,
    name: 'Sarah Johnson'
  },
  status: 'published'
},
{
  id: 2,
  title: 'Web Development Best Practices 2024',
  description: 'Learn the latest best practices for modern web development.',
  type: 'article',
  url: 'https://example.com/web-dev-practices',
  image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
  dateAdded: '2024-04-10',
  contributor: {
    id: 4,
    name: 'David Johnson'
  },
  status: 'published'
}
];

// Marketplace items
export const marketplaceItems: MarketplaceItem[] = [
{
  id: 1,
  title: 'Web Development Services',
  description: 'Professional web development services for businesses and organizations in the Kootenay region.',
  type: 'service',
  category: 'Development',
  image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
  seller: {
    id: 4,
    name: 'David Johnson',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
  },
  datePosted: '2024-05-01',
  status: 'published'
},
{
  id: 2,
  title: 'Data Analysis Workshop',
  description: 'Hands-on workshop teaching the fundamentals of data analysis using Python and Pandas.',
  price: 50,
  type: 'event',
  category: 'Education',
  image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
  seller: {
    id: 3,
    name: 'Emma Wilson',
    image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
  },
  datePosted: '2024-05-05',
  status: 'published'
}
];

// Opportunities
export const opportunities: Opportunity[] = [
{
  id: 1,
  title: 'Machine Learning Engineer',
  company: {
    id: 1,
    name: 'Mountain Tech Solutions',
    logo: 'https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg'
  },
  type: 'full-time',
  location: 'Nelson, BC',
  remote: true,
  description: `We're looking for a talented Machine Learning Engineer to join our growing team. 

Responsibilities:
- Design and implement machine learning models
- Work with data scientists to improve existing algorithms
- Deploy and maintain ML systems in production

Requirements:
- Experience with Python, TensorFlow or PyTorch
- Strong understanding of machine learning concepts
- BS/MS/PhD in Computer Science or related field`,
  salary: '$80,000 - $100,000',
  postedDate: '2024-05-01',
  deadline: '2024-06-01',
  status: 'published'
},
{
  id: 2,
  title: 'Front-end Developer',
  company: {
    id: 2,
    name: 'Kootenay AI Solutions',
    logo: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg'
  },
  type: 'part-time',
  location: 'Rossland, BC',
  remote: true,
  status: 'published',
  description: `We're seeking a part-time Front-end Developer to help us build intuitive user interfaces for our AI applications.

Responsibilities:
- Implement responsive user interfaces using React
- Collaborate with designers and backend developers
- Optimize applications for performance

Requirements:
- Experience with React and modern JavaScript
- Knowledge of CSS, responsive design
- Portfolio of previous work`,
  postedDate: '2024-05-10'
}
];

// Export all mock data
export const mockData = {
  members,
  companies,
  groups,
  events,
  newsArticles,
  resources,
  marketplaceItems,
  opportunities
};

export default mockData;
