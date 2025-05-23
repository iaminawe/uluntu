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

// Session and Presenter types for events
export interface EventSessionResource {
  id: number;
  title: string;
  url: string;
  type: 'slides' | 'document' | 'code' | 'website' | 'other';
}

export interface EventSession {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  presenters: EventPresenter[];
  videoUrl?: string; // URL for YouTube or Vimeo video
  resources?: EventSessionResource[];
}

export interface EventPresenter {
  id: number;
  name: string;
  image: string;
  bio?: string;
  title?: string;
  company?: string;
  website?: string;
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
  sessions?: EventSession[];
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
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer' | 'internship';
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
  // Past events
  {
    id: 1,
    title: 'Introduction to AI Workshop',
    date: '2025-04-10T18:00:00',
    endDate: '2025-04-10T20:00:00',
    location: 'Nelson Innovation Centre, Nelson BC',
    description: 'A beginner-friendly workshop on artificial intelligence and its applications in business and technology. Learn the basics of machine learning and how it can be applied to solve real-world problems.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    organizer: {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    attendees: 32,
    type: 'in-person',
    status: 'published',
    sessions: [
      {
        id: 1,
        title: 'AI Fundamentals',
        description: 'An introduction to the core concepts of artificial intelligence and machine learning.',
        startTime: '2025-04-10T18:00:00',
        endTime: '2025-04-10T19:00:00',
        presenters: [
          {
            id: 1,
            name: 'Sarah Johnson',
            image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
            bio: 'AI researcher with 8+ years of experience in machine learning and neural networks.',
            title: 'AI Research Lead',
            company: 'Mountain Tech Solutions'
          }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
        resources: [
          {
            id: 101,
            title: 'AI Fundamentals Slides',
            url: 'https://speakerdeck.com/example/ai-fundamentals',
            type: 'slides'
          },
          {
            id: 102,
            title: 'Machine Learning Resources',
            url: 'https://github.com/example/ml-resources',
            type: 'code'
          }
        ]
      },
      {
        id: 2,
        title: 'Practical Applications Workshop',
        description: 'Hands-on session exploring real-world applications of AI in business and technology.',
        startTime: '2025-04-10T19:00:00',
        endTime: '2025-04-10T20:00:00',
        presenters: [
          {
            id: 2,
            name: 'Michael Chen',
            image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
            bio: 'Data scientist specializing in practical AI applications for small businesses.',
            title: 'Data Science Consultant',
            company: 'AI Solutions'
          }
        ],
        videoUrl: 'https://vimeo.com/765419318',
        resources: [
          {
            id: 103,
            title: 'AI Applications Workshop Materials',
            url: 'https://speakerdeck.com/example/ai-applications-workshop',
            type: 'slides'
          },
          {
            id: 104,
            title: 'Workshop Code Examples',
            url: 'https://github.com/example/ai-workshop-code',
            type: 'code'
          },
          {
            id: 105,
            title: 'Additional Reading Materials',
            url: 'https://example.com/ai-reading-materials.pdf',
            type: 'document'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Tech Entrepreneur Networking',
    date: '2025-04-25T17:30:00',
    endDate: '2025-04-25T19:30:00',
    location: 'Kootenay Co-working Space, Rossland BC',
    description: 'Connect with fellow tech entrepreneurs and startup founders in the Kootenay region. Share experiences, challenges, and opportunities in a casual networking environment.',
    image: 'https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg',
    organizer: {
      id: 6,
      name: 'James Wilson',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg'
    },
    attendees: 18,
    type: 'in-person',
    status: 'published'
  },
  {
    id: 3,
    title: 'Web Accessibility Webinar',
    date: '2025-05-05T12:00:00',
    endDate: '2025-05-05T13:30:00',
    location: 'Online via Zoom',
    description: 'Learn how to make your websites more accessible to users with disabilities. This webinar covers WCAG guidelines, practical implementation tips, and testing strategies.',
    image: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg',
    organizer: {
      id: 4,
      name: 'David Johnson',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    attendees: 45,
    type: 'online',
    url: 'https://zoom.us/webinar',
    status: 'published'
  },
  
  // Upcoming events
  {
    id: 4,
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
    status: 'published',
    sessions: [
      {
        id: 3,
        title: 'The Future of AI in the Kootenays',
        description: 'Exploring how artificial intelligence is shaping the tech landscape in our region.',
        startTime: '2025-06-15T18:00:00',
        endTime: '2025-06-15T18:30:00',
        presenters: [
          {
            id: 1,
            name: 'Sarah Johnson',
            image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
            bio: 'AI researcher with 8+ years of experience in machine learning and neural networks.',
            title: 'AI Research Lead',
            company: 'Mountain Tech Solutions',
            website: 'https://sarahjohnson.dev'
          }
        ],
        resources: [
          {
            id: 106,
            title: 'Upcoming Presentation Slides',
            url: 'https://speakerdeck.com/sarahjohnson/future-of-ai-kootenays',
            type: 'slides'
          }
        ]
      },
      {
        id: 4,
        title: 'Modern Web Development Techniques',
        description: 'A look at the latest frameworks and methodologies in web development.',
        startTime: '2025-06-15T18:30:00',
        endTime: '2025-06-15T19:15:00',
        presenters: [
          {
            id: 4,
            name: 'David Johnson',
            image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            bio: 'Frontend developer with expertise in React and modern JavaScript frameworks.',
            title: 'Frontend Developer',
            company: 'Creative Solutions',
            website: 'https://davidjohnson.codes'
          }
        ],
        resources: [
          {
            id: 107,
            title: 'Modern Web Dev Presentation',
            url: 'https://speakerdeck.com/davidjohnson/modern-web-dev-2025',
            type: 'slides'
          },
          {
            id: 108,
            title: 'Demo Project Repository',
            url: 'https://github.com/davidjohnson/modern-web-demo',
            type: 'code'
          }
        ]
      },
      {
        id: 5,
        title: 'Networking & Refreshments',
        description: 'Connect with fellow tech professionals over drinks and snacks.',
        startTime: '2025-06-15T19:15:00',
        endTime: '2025-06-15T20:00:00',
        presenters: [],
        resources: [
          {
            id: 109,
            title: 'Networking Tips & Resources',
            url: 'https://example.com/networking-resources.pdf',
            type: 'document'
          }
        ]
      }
    ]
  },
  {
    id: 5,
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
    id: 6,
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
// Make sure opportunities is properly exported
export const opportunities = [
{
  id: 1,
  title: 'Senior Full Stack Developer',
  company: {
    id: 1,
    name: 'Mountain Tech Solutions',
    logo: 'https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg'
  },
  type: 'full-time',
  location: 'Nelson, BC',
  remote: true,
  description: `We're looking for a talented Full Stack Developer to join our growing team. 

Responsibilities:
- Design and implement web applications using React and Node.js
- Work with our team to improve existing systems
- Deploy and maintain applications in production

Requirements:
- 5+ years experience with modern JavaScript frameworks
- Strong understanding of React, TypeScript, and Node.js
- Experience with cloud platforms (AWS/Azure/GCP)`,
  salary: '$90,000 - $120,000',
  postedDate: '2025-04-15',
  deadline: '2025-06-15',
  status: 'published',
  featured: true
},
{
  id: 2,
  title: 'UX/UI Designer',
  company: {
    id: 2,
    name: 'Creative Solutions',
    logo: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg'
  },
  type: 'contract',
  location: 'Kelowna, BC',
  remote: true,
  status: 'published',
  description: `Looking for a talented UX/UI designer to help create engaging user experiences for our digital products.

Responsibilities:
- Create wireframes, prototypes, and high-fidelity designs
- Conduct user research and usability testing
- Collaborate with developers to implement designs

Requirements:
- 3+ years of experience in UX/UI design
- Proficiency in design tools (Figma, Sketch, Adobe XD)
- Portfolio demonstrating strong design thinking`,
  salary: '$40-60/hour',
  postedDate: '2025-05-01',
  deadline: '2025-06-01'
},
{
  id: 3,
  title: 'Community Outreach Coordinator',
  company: {
    id: 3,
    name: 'Kootenay Tech Association',
    logo: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg'
  },
  type: 'volunteer' as 'volunteer',
  location: 'Remote',
  remote: true,
  status: 'published',
  description: `Help our organization connect with local tech professionals and organize community events.

Responsibilities:
- Coordinate regular meetups and networking events
- Manage social media accounts and community engagement
- Connect with local businesses and professionals

Requirements:
- Excellent communication and organizational skills
- Passion for technology and community building
- Ability to commit 5-10 hours per week`,
  postedDate: '2025-05-10'
},
{
  id: 4,
  title: 'Product Manager',
  company: {
    id: 4,
    name: 'Alpine Software',
    logo: 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg'
  },
  type: 'full-time',
  location: 'Castlegar, BC',
  remote: false,
  status: 'published',
  description: `Lead product development efforts for our suite of tourism management software.

Responsibilities:
- Define product vision, strategy, and roadmap
- Gather and prioritize product requirements
- Work closely with engineering, design, and marketing teams

Requirements:
- 5+ years of product management experience
- Strong analytical and problem-solving skills
- Experience with agile development methodologies`,
  salary: '$85,000 - $110,000',
  postedDate: '2025-04-20',
  deadline: '2025-06-20',
  featured: true
},
{
  id: 5,
  title: 'Marketing Intern',
  company: {
    id: 2,
    name: 'Creative Solutions',
    logo: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg'
  },
  type: 'internship',
  location: 'Kelowna, BC',
  remote: false,
  status: 'published',
  description: `Great opportunity for marketing students to gain hands-on experience in a dynamic tech company.

Responsibilities:
- Assist with social media management and content creation
- Help organize marketing campaigns and events
- Conduct market research and competitor analysis

Requirements:
- Currently enrolled in a marketing, communications, or business program
- Strong written and verbal communication skills
- Familiarity with social media platforms`,
  postedDate: '2025-05-05',
  deadline: '2025-05-25'
},
{
  id: 6,
  title: 'DevOps Engineer',
  company: {
    id: 1,
    name: 'Mountain Tech Solutions',
    logo: 'https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg'
  },
  type: 'full-time',
  location: 'Nelson, BC',
  remote: true,
  status: 'published',
  description: `Join our team to help build and maintain our cloud infrastructure and CI/CD pipelines.

Responsibilities:
- Design, implement and manage our AWS infrastructure
- Set up and maintain CI/CD pipelines
- Implement monitoring and alerting solutions

Requirements:
- Experience with AWS or other cloud platforms
- Knowledge of containerization (Docker, Kubernetes)
- Familiarity with CI/CD tools (Jenkins, GitHub Actions)`,
  salary: '$85,000 - $110,000',
  postedDate: '2025-04-25',
  deadline: '2025-06-10'
},
{
  id: 7,
  title: 'Data Scientist',
  company: {
    id: 4,
    name: 'Alpine Software',
    logo: 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg'
  },
  type: 'contract',
  location: 'Remote',
  remote: true,
  status: 'published',
  description: `We're looking for a data scientist to help us extract insights from our tourism data.

Responsibilities:
- Analyze large datasets to identify patterns and trends
- Build predictive models to forecast tourism demand
- Create visualizations and reports for stakeholders

Requirements:
- Strong background in statistics and machine learning
- Experience with Python, R, or similar data science tools
- Ability to communicate complex findings to non-technical audiences`,
  salary: '$50-70/hour',
  postedDate: '2025-05-03',
  deadline: '2025-06-03'
},
{
  id: 8,
  title: 'Technical Support Specialist',
  company: {
    id: 3,
    name: 'Kootenay Tech Association',
    logo: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg'
  },
  type: 'part-time',
  location: 'Rossland, BC',
  remote: false,
  status: 'published',
  description: `Provide technical support to our members and help maintain our community resources.

Responsibilities:
- Respond to technical support requests from members
- Maintain and update our community website and resources
- Assist with setting up equipment for events and workshops

Requirements:
- Basic technical troubleshooting skills
- Excellent customer service attitude
- Ability to explain technical concepts clearly`,
  salary: '$20-25/hour',
  postedDate: '2025-05-08',
  deadline: '2025-05-30'
}
];

// Add 10 new members to the mock data
const additionalMembers: Member[] = [
  {
    id: 7,
    name: 'Olivia Martinez',
    title: 'Frontend Developer',
    image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
    company: 'Kootenay Digital',
    location: 'Nelson, BC',
    bio: 'Frontend developer specializing in React and modern JavaScript frameworks with a passion for accessible UI design.',
    skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Accessibility'],
    joinDate: '2023-04-15',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/oliviamartinez',
      github: 'https://github.com/oliviamartinez',
      twitter: 'https://twitter.com/oliviamartinez'
    }
  },
  {
    id: 8,
    name: 'Noah Wilson',
    title: 'Backend Engineer',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    company: 'Alpine Software',
    location: 'Rossland, BC',
    bio: 'Backend engineer with expertise in building scalable APIs and microservices using Node.js and Go.',
    skills: ['Node.js', 'Go', 'MongoDB', 'PostgreSQL', 'Docker'],
    joinDate: '2023-05-10',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/noahwilson',
      github: 'https://github.com/noahwilson'
    }
  },
  {
    id: 9,
    name: 'Sophia Chen',
    title: 'Machine Learning Engineer',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    company: 'Alpine Analytics',
    location: 'Castlegar, BC',
    bio: 'Machine learning engineer focused on developing AI solutions for environmental monitoring and conservation.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'Machine Learning'],
    joinDate: '2023-06-22',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/sophiachen',
      github: 'https://github.com/sophiachen',
      website: 'https://sophiachen.ai'
    }
  },
  {
    id: 10,
    title: 'Game Developer',
    name: 'Ethan Jackson',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    company: 'Pixel Pioneers',
    location: 'Nelson, BC',
    bio: 'Game developer with a focus on Unity and C# development, creating immersive experiences and educational games.',
    skills: ['Unity', 'C#', 'Game Design', '3D Modeling', 'AR/VR'],
    joinDate: '2023-07-05',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/ethanjackson',
      github: 'https://github.com/ethanjackson'
    }
  },
  {
    id: 11,
    name: 'Isabella Rodriguez',
    title: 'UX Researcher',
    image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
    company: 'Creative Solutions',
    location: 'Kelowna, BC',
    bio: 'UX researcher with a background in psychology, specializing in user testing and creating accessible digital experiences.',
    skills: ['User Research', 'Usability Testing', 'Figma', 'UI/UX', 'Accessibility'],
    joinDate: '2023-08-12',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/isabellarodriguez',
      twitter: 'https://twitter.com/isabellarodriguez'
    }
  },
  {
    id: 12,
    name: 'Lucas Thompson',
    title: 'Cloud Solutions Architect',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    company: 'Kootenay Cloud Services',
    location: 'Trail, BC',
    bio: 'Cloud solutions architect with expertise in designing and implementing scalable infrastructure on AWS and Azure.',
    skills: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'DevOps'],
    joinDate: '2023-09-18',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/lucasthompson',
      github: 'https://github.com/lucasthompson'
    }
  },
  {
    id: 13,
    name: 'Ava Patel',
    title: 'Mobile App Developer',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    bio: 'Mobile app developer specializing in cross-platform development using React Native and Flutter.',
    skills: ['React Native', 'Flutter', 'JavaScript', 'Dart', 'Mobile Development'],
    joinDate: '2023-10-05',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/avapatel',
      github: 'https://github.com/avapatel',
      website: 'https://avapatel.dev'
    }
  },
  {
    id: 14,
    name: 'William Davis',
    title: 'Cybersecurity Specialist',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    company: 'Digital Ledger Tech',
    location: 'Kelowna, BC',
    bio: 'Cybersecurity specialist focused on application security, penetration testing, and secure coding practices.',
    skills: ['Cybersecurity', 'Penetration Testing', 'OWASP', 'Security Auditing', 'Blockchain'],
    joinDate: '2023-11-15',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/williamdavis',
      github: 'https://github.com/williamdavis'
    }
  },
  {
    id: 15,
    name: 'Mia Johnson',
    title: 'Technical Project Manager',
    image: 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    bio: 'Technical project manager with a background in software development, specializing in agile methodologies and team leadership.',
    skills: ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Product Management'],
    joinDate: '2023-12-01',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/miajohnson',
      twitter: 'https://twitter.com/miajohnson'
    }
  },
  {
    id: 16,
    name: 'Benjamin Lee',
    title: 'Blockchain Developer',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    company: 'Digital Ledger Tech',
    location: 'Rossland, BC',
    bio: 'Blockchain developer with experience in smart contract development, DeFi applications, and web3 technologies.',
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'DeFi'],
    joinDate: '2024-01-10',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/benjaminlee',
      github: 'https://github.com/benjaminlee',
      website: 'https://benjaminlee.dev'
    }
  }
];

// Combine original members with additional members
const allMembers = [...members, ...additionalMembers];

// Export all mock data
export const mockData = {
  members: allMembers,
  companies,
  groups,
  events,
  newsArticles,
  resources,
  marketplaceItems,
  opportunities
};

export default mockData;
