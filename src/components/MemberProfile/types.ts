// Member Profile related types

export interface MemberGroup {
  id: number;
  name: string;
  role: 'admin' | 'member';
  joinedDate: string;
}

export interface MemberEvent {
  id: number;
  title: string;
  date: string;
  presentation: string;
}

export interface MemberResource {
  id: number;
  title: string;
  type: string;
  date: string;
  url: string;
}

export interface MemberPost {
  id: number;
  title: string;
  excerpt?: string;
  group: {
    id: number;
    name: string;
  };
  date: string;
}

export interface Organization {
  id: number;
  name: string;
  role: string;
}

export interface MarketplaceListing {
  id: number;
  title: string;
  type: 'product' | 'service' | 'equipment';
  price: number;
  image: string;
  createdAt: string;
}

export interface MemberOpportunity {
  id: number;
  title: string;
  type: string;
  location: string;
  remote?: boolean;
  description: string;
}

export interface MemberAchievement {
  title: string;
  description: string;
  date: string;
}

export interface Member {
  id: number;
  name: string;
  title: string;
  bio: string;
  location: string;
  image: string;
  skills: string[];
  organizations: Organization[];
  groups: MemberGroup[];
  events: MemberEvent[];
  resources: MemberResource[];
  posts: MemberPost[];
  marketplaceListings: MarketplaceListing[];
  opportunities?: MemberOpportunity[];
  achievements?: MemberAchievement[];
  website?: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  employmentStatus: 'full-time' | 'freelance' | 'looking' | 'not-looking';
  openToVolunteering: boolean;
  arrivedInNelson: string;
}

// Sample data
export const SAMPLE_MEMBER: Member = {
  id: 1,
  name: 'Sarah Johnson',
  title: 'Full Stack Developer',
  bio: `Sarah is a passionate developer with over 8 years of experience in web development and AI. 
        She specializes in building scalable applications and mentoring junior developers. 
        Originally from Vancouver, she moved to Nelson to pursue a better work-life balance 
        and contribute to the growing tech community in the Kootenays.`,
  location: 'Nelson, BC',
  image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
  skills: ['React', 'Node.js', 'TypeScript', 'AI/ML', 'Python'],
  website: 'https://sarahjohnson.dev',
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/sarahjohnson' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/sarahjohnson' },
    { platform: 'Twitter', url: 'https://twitter.com/sarahjohnson' }
  ],
  employmentStatus: 'freelance',
  openToVolunteering: true,
  arrivedInNelson: '2023-06-15',
  organizations: [
    {
      id: 1,
      name: 'Mountain Tech Solutions',
      role: 'Senior Developer'
    },
    {
      id: 2,
      name: 'Kootenay Code Club',
      role: 'Mentor'
    }
  ],
  groups: [
    {
      id: 1,
      name: 'AI Enthusiasts Kootenay',
      role: 'admin',
      joinedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Kootenay Tech Organizers',
      role: 'member',
      joinedDate: '2024-02-01'
    }
  ],
  events: [
    {
      id: 1,
      title: 'AI Ethics Workshop',
      date: '2024-02-15',
      presentation: 'Ethics in Healthcare AI'
    },
    {
      id: 2,
      title: 'Machine Learning Study Group',
      date: '2024-03-01',
      presentation: 'Introduction to Neural Networks'
    }
  ],
  resources: [
    {
      id: 1,
      title: 'Getting Started with AI',
      type: 'document',
      date: '2024-02-01',
      url: 'https://example.com/ai-guide.pdf'
    },
    {
      id: 2,
      title: 'ML Workshop Slides',
      type: 'presentation',
      date: '2024-03-01',
      url: 'https://example.com/ml-slides.pptx'
    }
  ],
  posts: [
    {
      id: 1,
      title: 'Recap: February AI Ethics Workshop',
      group: {
        id: 1,
        name: 'AI Enthusiasts Kootenay'
      },
      date: '2024-02-16'
    }
  ],
  marketplaceListings: [
    {
      id: 1,
      title: 'Web Development Services',
      type: 'service',
      price: 75,
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
      createdAt: '2025-03-14'
    },
    {
      id: 2,
      title: 'MacBook Pro 16" M1 Pro',
      type: 'equipment',
      price: 2000,
      image: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg',
      createdAt: '2025-03-15'
    }
  ],
  opportunities: [
    {
      id: 1,
      title: 'Frontend Developer Needed',
      type: 'contract',
      location: 'Nelson, BC',
      remote: true,
      description: 'Looking for a React developer to help build a new web application for a local business. 3-month contract with possibility of extension.'
    },
    {
      id: 2,
      title: 'Tech Mentor for Youth Program',
      type: 'volunteer',
      location: 'Kootenay Region',
      remote: false,
      description: 'Seeking experienced developers to mentor high school students in our after-school coding program. 2 hours per week commitment.'
    }
  ],
  achievements: [
    {
      title: 'Kootenay Tech Innovation Award',
      description: 'Recognized for contributions to the local tech community and innovative solutions',
      date: '2023-11-15'
    },
    {
      title: 'Open Source Contributor',
      description: 'Top 10 contributor to the React Kootenay library',
      date: '2023-08-22'
    },
    {
      title: 'Workshop Facilitator',
      description: 'Led 12 successful tech workshops for beginners in the community',
      date: '2023-06-30'
    }
  ]
};
