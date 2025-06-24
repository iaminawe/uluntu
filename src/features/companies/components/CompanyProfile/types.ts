// Company Profile related types
import { Company as MainCompany } from '../../types';

export interface CompanyMember {
  id: number;
  name: string;
  title: string;
  image: string;
  joinedDate: string;
}

export interface CompanyEvent {
  id: number;
  title: string;
  date: string;
  type: string;
}

export interface CompanyResource {
  id: number;
  title: string;
  type: string;
  date: string;
}

export interface CompanyPost {
  id: number;
  title: string;
  date: string;
}

export interface CompanyOpportunity {
  id: number;
  title: string;
  type: string;
  date: string;
}

// Define a local Company type that includes properties needed by the component
export interface Company {
  id: number; // Local component expects number IDs
  name: string;
  description: string;
  logo?: string; // Keep for compatibility with main type
  image: string; // Used in this component
  industry: string; // Local component expects string, main type expects string[]
  size: string;
  founded: string;
  location: string;
  website: string;
  socialLinks: {
    platform: string;
    url: string;
  }[];
  technologies: string[];
  members: CompanyMember[];
  events: CompanyEvent[];
  resources: CompanyResource[];
  posts: CompanyPost[];
  opportunities: CompanyOpportunity[];
}

// Utility function to convert from main Company type to local Company type
export const adaptMainCompanyToLocal = (mainCompany: MainCompany): Partial<Company> => {
  return {
    id: typeof mainCompany.id === 'string' ? parseInt(mainCompany.id) : mainCompany.id as number,
    name: mainCompany.name,
    description: mainCompany.description,
    logo: mainCompany.logo,
    image: mainCompany.logo, // Use logo as image
    industry: Array.isArray(mainCompany.industry) ? mainCompany.industry.join(', ') : mainCompany.industry as string,
    size: mainCompany.size,
    founded: mainCompany.founded,
    location: mainCompany.location,
    website: mainCompany.website || '',
    // Map social from main type to socialLinks in local type
    socialLinks: (mainCompany as any).social ? [
      ...Object.entries((mainCompany as any).social).map(([platform, url]: [string, any]) => ({
        platform,
        url: url || ''
      }))
    ] : [],
    // These properties don't exist in the main type, so they would need to be added separately
    technologies: [],
    members: [],
    events: [],
    resources: [],
    posts: [],
    opportunities: []
  };
};

// Sample data
export const SAMPLE_COMPANY: Company = {
  id: 1,
  name: 'Mountain Tech Solutions',
  description: 'Mountain Tech Solutions is a leading software development company based in Nelson, BC.\n\n' +
               'We specialize in creating custom software solutions for businesses of all sizes, with a ' +
               'focus on web applications, mobile development, and cloud infrastructure.\n\n' +
               'Our team of experienced developers and designers is passionate about delivering ' +
               'high-quality solutions that help our clients succeed in the digital world.',
  industry: 'Software Development',
  size: '10-50 employees',
  founded: '2018',
  location: 'Nelson, BC',
  image: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg',
  website: 'https://example.com',
  socialLinks: [
    { platform: 'LinkedIn', url: '#' },
    { platform: 'Twitter', url: '#' },
    { platform: 'GitHub', url: '#' }
  ],
  technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
  members: [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Developer',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      joinedDate: '2020-01-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'UX Designer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      joinedDate: '2021-03-01'
    }
  ],
  events: [
    {
      id: 1,
      title: 'Tech Talk: Modern Web Development',
      date: '2024-04-15',
      type: 'Presentation'
    },
    {
      id: 2,
      title: 'Open House',
      date: '2024-05-01',
      type: 'Community Event'
    }
  ],
  resources: [
    {
      id: 1,
      title: 'Best Practices Guide',
      type: 'Document',
      date: '2024-02-15'
    },
    {
      id: 2,
      title: 'Tech Stack Overview',
      type: 'Presentation',
      date: '2024-03-01'
    }
  ],
  posts: [
    {
      id: 1,
      title: 'Introducing Our New Cloud Services',
      date: '2024-03-15'
    },
    {
      id: 2,
      title: 'Join Our Growing Team',
      date: '2024-03-01'
    }
  ],
  opportunities: [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      type: 'Full-time',
      date: '2024-03-01'
    },
    {
      id: 2,
      title: 'Summer Internship Program',
      type: 'Internship',
      date: '2024-03-15'
    }
  ]
};
