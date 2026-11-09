// Member Profile related types
import { Member as MainMember } from '../../types';

export interface MemberGroup {
  id: string;
  name: string;
  role: 'admin' | 'member';
  joinedDate: string;
}

export interface MemberEvent {
  id: string;
  title: string;
  date: string;
  presentation: string;
}

export interface MemberResource {
  id: string;
  title: string;
  type: string;
  date: string;
  url: string;
}

export interface MemberPost {
  id: string;
  title: string;
  excerpt?: string;
  group: {
    id: string;
    name: string;
  };
  date: string;
}

export interface Organization {
  id: string;
  name: string;
  role: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  type: 'product' | 'service' | 'equipment';
  price: number;
  image: string;
  dateAdded: string; // Changed from createdAt to match naming convention
}

export interface MemberOpportunity {
  id: string;
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

// Define a local Member type that extends the main application's Member type with additional properties
export interface Member extends MainMember {
  organizations: Organization[];
  groups: MemberGroup[];
  events: MemberEvent[];
  resources: MemberResource[];
  posts: MemberPost[];
  marketplaceListings: MarketplaceListing[];
  opportunities?: MemberOpportunity[];
  achievements?: MemberAchievement[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  employmentStatus: 'full-time' | 'freelance' | 'looking' | 'not-looking';
  openToVolunteering: boolean;
  arrivedInNelson: string;
}

// Utility function to convert from main Member type to local Member type
export const adaptMainMemberToLocal = (mainMember: MainMember): Partial<Member> => {
  return {
    ...mainMember,
    // Map social from main type to socialLinks in local type
    socialLinks: mainMember.social ? [
      ...Object.entries(mainMember.social).map(([platform, url]) => ({
        platform,
        url: url || ''
      }))
    ] : undefined,
    // These properties don't exist in the main type, so they would need to be added separately
    organizations: [],
    groups: [],
    events: [],
    resources: [],
    posts: [],
    marketplaceListings: [],
    employmentStatus: 'not-looking',
    openToVolunteering: false,
    arrivedInNelson: ''
  };
};

// Sample data
export const SAMPLE_MEMBER: Member = {
  id: '1',
  name: 'Sarah Johnson',
  title: 'Full Stack Developer',
  bio: `Sarah is a passionate developer with over 8 years of experience in web development and AI. 
        She specializes in building scalable applications and mentoring junior developers. 
        Originally from Vancouver, she moved to Nelson to pursue a better work-life balance 
        and contribute to the growing tech community in the Uluntu community.`,
  location: 'Nelson, BC',
  image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
  skills: ['React', 'Node.js', 'TypeScript', 'AI/ML', 'Python'],
  status: 'published',
  joinDate: '2023-01-15',
  social: {
    website: 'https://sarahjohnson.dev'
  },
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
      id: '1',
      name: 'Mountain Tech Solutions',
      role: 'Senior Developer'
    },
    {
      id: '2',
      name: 'Uluntu Code Club',
      role: 'Mentor'
    }
  ],
  groups: [
    {
      id: '1',
      name: 'AI Enthusiasts Uluntu',
      role: 'admin',
      joinedDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Uluntu Tech Organizers',
      role: 'member',
      joinedDate: '2024-02-01'
    }
  ],
  events: [
    {
      id: '1',
      title: 'AI Ethics Workshop',
      date: '2024-02-15',
      presentation: 'Ethics in Healthcare AI'
    },
    {
      id: '2',
      title: 'Machine Learning Study Group',
      date: '2024-03-01',
      presentation: 'Introduction to Neural Networks'
    }
  ],
  resources: [
    {
      id: '1',
      title: 'Getting Started with AI',
      type: 'document',
      date: '2024-02-01',
      url: 'https://example.com/ai-guide.pdf'
    },
    {
      id: '2',
      title: 'ML Workshop Slides',
      type: 'presentation',
      date: '2024-03-01',
      url: 'https://example.com/ml-slides.pptx'
    }
  ],
  posts: [
    {
      id: '1',
      title: 'Recap: February AI Ethics Workshop',
      group: {
        id: '1',
        name: 'AI Enthusiasts Uluntu'
      },
      date: '2024-02-16'
    }
  ],
  marketplaceListings: [
    {
      id: '1',
      title: 'Web Development Services',
      type: 'service',
      price: 75,
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
      dateAdded: '2025-03-14'
    },
    {
      id: '2',
      title: 'MacBook Pro 16" M1 Pro',
      type: 'equipment',
      price: 2000,
      image: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg',
      dateAdded: '2025-03-15'
    }
  ],
  opportunities: [
    {
      id: '1',
      title: 'Frontend Developer Needed',
      type: 'contract',
      location: 'Nelson, BC',
      remote: true,
      description: 'Looking for a React developer to help build a new web application for a local business. 3-month contract with possibility of extension.'
    },
    {
      id: '2',
      title: 'Tech Mentor for Youth Program',
      type: 'volunteer',
      location: 'Uluntu Community',
      remote: false,
      description: 'Seeking experienced developers to mentor high school students in our after-school coding program. 2 hours per week commitment.'
    }
  ],
  achievements: [
    {
      title: 'Uluntu Tech Innovation Award',
      description: 'Recognized for contributions to the local tech community and innovative solutions',
      date: '2023-11-15'
    },
    {
      title: 'Open Source Contributor',
      description: 'Top 10 contributor to the React Uluntu library',
      date: '2023-08-22'
    },
    {
      title: 'Workshop Facilitator',
      description: 'Led 12 successful tech workshops for beginners in the community',
      date: '2023-06-30'
    }
  ]
};
