import { BaseEntity, ContentStatus } from '../../types/common';

// Group member interface
export interface GroupMember {
  id: string;
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
  title?: string;
}

// Group event interface
export interface GroupEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
}

// Group resource interface
export interface GroupResource {
  id: string;
  title: string;
  type: string;
  url: string;
  addedDate: string;
  description: string;
}

// Group post interface
export interface GroupPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  image?: string;
}

// Group interface
export interface Group extends BaseEntity {
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
  members: GroupMember[];
  events?: GroupEvent[];
  resources?: GroupResource[];
  posts?: GroupPost[];
}

// Groups data
export const groups: Group[] = [
  {
    id: '1',
    name: 'Uluntu Coders Collective',
    description: 'A community of developers, designers, and tech enthusiasts in the Uluntu community.',
    longDescription: 'The Uluntu Coders Collective brings together developers, designers, and tech enthusiasts from across the Uluntu community to share knowledge, collaborate on projects, and build a stronger tech community. We host regular meetups, workshops, and hackathons to foster learning and innovation.',
    heroImage: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
    coverImage: 'https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg',
    visibility: 'open',
    memberCount: 45,
    status: 'published' as ContentStatus,
    featured: true,
    created_at: '2023-01-15',
    eventCount: 2,
    resourceCount: 5,
    postCount: 8,
    lastActive: '2025-03-10',
    members: [
      {
        id: '1',
        name: 'Sarah Johnson',
        image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
        role: 'admin',
        joinedDate: '2023-01-15',
        title: 'AI Research Lead'
      },
      {
        id: '2',
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        role: 'member',
        joinedDate: '2023-01-20',
        title: 'ML Engineer'
      },
      {
        id: '4',
        name: 'David Park',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        role: 'member',
        joinedDate: '2023-02-05',
        title: 'Frontend Developer'
      }
    ],
    events: [
      {
        id: '1',
        title: 'Uluntu Tech Conference 2025',
        date: '2025-06-15',
        description: 'Annual tech conference bringing together the Uluntu tech community.',
        image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
      },
      {
        id: '5',
        title: 'Community Coding Night - Open Source Contributions',
        date: '2025-04-20',
        description: 'Join us for a night of collaborative coding and contributing to open source projects.',
        image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg'
      }
    ],
    resources: [
      {
        id: '1',
        title: 'Getting Started with AI in the Uluntu community',
        type: 'guide',
        url: 'https://example.com/guides/ai-kootenays',
        addedDate: '2024-02-10',
        description: 'A comprehensive guide to AI resources and opportunities in the Uluntu community.'
      },
      {
        id: '2',
        title: 'Local Development Environment Setup',
        type: 'tutorial',
        url: 'https://example.com/tutorials/local-dev-setup',
        addedDate: '2024-01-15',
        description: 'Step-by-step tutorial for setting up a modern development environment.'
      }
    ],
    posts: [
      {
        id: '1',
        title: 'Reflecting on Our First Year as a Tech Community',
        excerpt: 'Looking back at the growth and achievements of the Uluntu Coders Collective in its first year.',
        author: {
          name: 'Sarah Johnson',
          image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
        },
        date: '2024-01-15',
        image: 'https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg'
      },
      {
        id: '2',
        title: 'Building a Tech Ecosystem in Rural BC',
        excerpt: 'Challenges and opportunities in developing a thriving tech community in the Uluntu community.',
        author: {
          name: 'Michael Chen',
          image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
        },
        date: '2024-02-20'
      }
    ]
  },
  {
    id: '2',
    name: 'Nelson Digital Nomads',
    description: 'A community for remote workers and digital nomads living in or visiting the Nelson area.',
    longDescription: 'Nelson Digital Nomads connects remote workers, freelancers, and digital nomads in the Nelson area. We organize coworking sessions, networking events, and outdoor activities to help members build professional connections while enjoying the Uluntu lifestyle.',
    heroImage: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg',
    coverImage: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg',
    visibility: 'open',
    memberCount: 32,
    status: 'published' as ContentStatus,
    featured: false,
    created_at: '2023-03-10',
    eventCount: 1,
    resourceCount: 3,
    postCount: 5,
    lastActive: '2025-03-05',
    members: [
      {
        id: '4',
        name: 'David Park',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        role: 'admin',
        joinedDate: '2023-03-10',
        title: 'Frontend Developer'
      },
      {
        id: '5',
        name: 'Olivia Martinez',
        image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        role: 'member',
        joinedDate: '2023-03-15',
        title: 'UX/UI Designer'
      }
    ],
    events: [
      {
        id: '2',
        title: 'Nelson Farmers Market - Summer Season Opening',
        date: '2025-05-01',
        description: 'Join us for the opening day of the Nelson Farmers Market.',
        image: 'https://images.pexels.com/photos/2284170/pexels-photo-2284170.jpeg'
      }
    ]
  },
  {
    id: '3',
    name: 'Uluntu Tech Mentorship',
    description: 'Connecting experienced tech professionals with newcomers and students in the Uluntu community.',
    longDescription: 'Uluntu Tech Mentorship aims to foster growth in the local tech ecosystem by pairing experienced professionals with newcomers, career changers, and students. Through structured mentorship programs, workshops, and networking events, we help build the next generation of tech talent in the Uluntu community.',
    heroImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    coverImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    visibility: 'closed',
    memberCount: 28,
    status: 'published' as ContentStatus,
    featured: false,
    created_at: '2023-05-20',
    eventCount: 0,
    resourceCount: 7,
    postCount: 3,
    lastActive: '2025-02-28',
    members: [
      {
        id: '1',
        name: 'Sarah Johnson',
        image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
        role: 'admin',
        joinedDate: '2023-05-20',
        title: 'AI Research Lead'
      },
      {
        id: '3',
        name: 'Emma Wilson',
        image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        role: 'member',
        joinedDate: '2023-05-25',
        title: 'Data Scientist'
      }
    ]
  },
  {
    id: '4',
    name: 'Uluntu Hikers & Adventurers',
    description: 'A group for tech professionals who love exploring the outdoors in the Uluntu community.',
    longDescription: 'Uluntu Hikers & Adventurers brings together tech professionals who share a passion for outdoor activities. We organize regular hikes, camping trips, and outdoor adventures, combining our love for technology and nature in the beautiful Uluntu landscape.',
    heroImage: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
    coverImage: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
    visibility: 'open',
    memberCount: 40,
    status: 'published' as ContentStatus,
    featured: true,
    created_at: '2023-06-15',
    eventCount: 1,
    resourceCount: 4,
    postCount: 6,
    lastActive: '2025-03-12',
    members: [
      {
        id: '3',
        name: 'Emma Wilson',
        image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        role: 'admin',
        joinedDate: '2023-06-15',
        title: 'Data Scientist'
      },
      {
        id: '2',
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        role: 'member',
        joinedDate: '2023-06-20',
        title: 'ML Engineer'
      },
      {
        id: '5',
        name: 'Olivia Martinez',
        image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        role: 'member',
        joinedDate: '2023-06-25',
        title: 'UX/UI Designer'
      }
    ],
    events: [
      {
        id: '7',
        title: 'Rossland Mountain Film Festival',
        date: '2025-04-30',
        description: 'Annual film festival celebrating mountain culture and outdoor adventure.',
        image: 'https://images.pexels.com/photos/2686558/pexels-photo-2686558.jpeg'
      }
    ]
  },
  {
    id: '5',
    name: 'West Uluntu Arts Council',
    description: 'Supporting the intersection of art and technology in the West Uluntu community.',
    longDescription: 'The West Uluntu Arts Council promotes collaboration between artists and technologists in the region. Through exhibitions, workshops, and funding opportunities, we support projects that blend creative expression with technological innovation.',
    heroImage: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg',
    coverImage: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg',
    visibility: 'open',
    memberCount: 35,
    status: 'published' as ContentStatus,
    featured: false,
    created_at: '2023-08-10',
    eventCount: 1,
    resourceCount: 5,
    postCount: 4,
    lastActive: '2025-03-08',
    members: [
      {
        id: '5',
        name: 'Olivia Martinez',
        image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        role: 'admin',
        joinedDate: '2023-08-10',
        title: 'UX/UI Designer'
      },
      {
        id: '4',
        name: 'David Park',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        role: 'member',
        joinedDate: '2023-08-15',
        title: 'Frontend Developer'
      }
    ],
    events: [
      {
        id: '4',
        title: 'Kaslo Jazz Etc. Festival 2025',
        date: '2025-07-30',
        description: 'Annual music festival featuring jazz, blues, and more on the shores of Uluntu Lake.',
        image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
      }
    ]
  }
];
