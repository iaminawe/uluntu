import { BaseEntity } from './types';

// Interface for the person/entity posting the opportunity
export interface OpportunityPoster {
  name: string;
  image: string;
  title: string;
  bio: string;
}

// Opportunity interface, extending BaseEntity
export interface Opportunity extends BaseEntity {
  title: string;
  description: string;
  type: 'job' | 'volunteer' | 'funding' | 'community' | 'service' | 'product' | 'other';
  organization: string;
  location: string;
  compensation?: string; // e.g., salary for jobs
  commitment?: string; // e.g., hours/week for volunteer
  fundingAmount?: string; // e.g., grant size for funding
  deadline?: string; // ISO date string
  contactEmail?: string;
  website?: string;
  image?: string;
  postedBy?: OpportunityPoster;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[]; // Perks or benefits of the opportunity
  // Inherited from BaseEntity: id, created_at, updated_at, status, featured
}

// Sample mock data for opportunities
export const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    description: 'Looking for an experienced developer to join our growing team.',
    type: 'job',
    organization: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    compensation: '$90,000 - $120,000/year',
    deadline: '2025-04-30',
    contactEmail: 'jobs@mountaintech.com',
    website: 'https://mountaintech.com',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    created_at: '2025-03-01',
    featured: true,
    status: 'published',
    postedBy: {
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      title: 'HR Manager',
      bio: 'Passionate about building great tech teams in the Kootenays.'
    },
    requirements: [
      '5+ years of full-stack development experience',
      'Strong knowledge of React and Node.js',
      'Experience with cloud platforms (AWS/GCP)',
      'Excellent communication skills'
    ],
    responsibilities: [
      'Lead development of new features',
      'Mentor junior developers',
      'Contribute to technical architecture decisions',
      'Collaborate with product and design teams'
    ],
    benefits: [
      'Flexible remote work options',
      'Extended health benefits',
      'Professional development budget',
      'Regular team events'
    ]
  },
  {
    id: '2',
    title: 'Tech Mentor for Youth Program',
    description: 'Volunteer to teach coding to local youth.',
    type: 'volunteer',
    organization: 'Kootenay Code Club',
    location: 'Rossland, BC',
    commitment: '4 hours/week',
    deadline: '2025-04-15',
    contactEmail: 'volunteer@kootcode.org',
    website: 'https://kootcode.org',
    image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg',
    created_at: '2025-03-02',
    featured: true,
    status: 'published',
    postedBy: {
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      title: 'Program Coordinator',
      bio: 'Working to make tech education accessible to all youth in the Kootenays.'
    },
    requirements: [
      'Basic programming knowledge',
      'Experience working with youth',
      'Reliable and committed',
      'Police record check required'
    ],
    responsibilities: [
      'Lead weekly coding workshops',
      'Prepare lesson materials',
      'Provide mentorship to students',
      'Participate in program planning'
    ]
  },
  {
    id: '3',
    title: 'Community AI Project Funding',
    description: 'Seeking funding for an AI-powered local environmental monitoring system.',
    type: 'funding',
    organization: 'Kootenay Innovation Initiative',
    location: 'Cranbrook, BC',
    fundingAmount: '$25,000',
    deadline: '2025-05-01',
    contactEmail: 'grants@kii.org',
    website: 'https://kii.org',
    image: 'https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg',
    created_at: '2025-03-03',
    featured: false,
    status: 'published',
    postedBy: {
      name: 'Emma Wilson',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
      title: 'Project Lead',
      bio: 'Leading initiatives at the intersection of technology and environmental conservation.'
    },
    requirements: [
      'Clear project timeline and milestones',
      'Detailed budget breakdown',
      'Environmental impact assessment',
      'Community engagement plan'
    ]
  },
  {
    id: '4',
    title: 'Smart City Initiative Contributors',
    description: 'Looking for community members to participate in developing smart city solutions.',
    type: 'community',
    organization: 'Nelson Tech Coalition',
    location: 'Nelson, BC',
    commitment: 'Flexible',
    contactEmail: 'community@nelsontech.org',
    website: 'https://nelsontech.org',
    image: 'https://images.pexels.com/photos/3183190/pexels-photo-3183190.jpeg',
    created_at: '2025-03-04',
    featured: false,
    status: 'published',
    postedBy: {
      name: 'Alex Thompson',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
      title: 'Community Manager',
      bio: 'Building bridges between technology and community needs in Nelson.'
    },
    requirements: [
      'Interest in smart city technologies',
      'Commitment to community improvement',
      'Ability to attend monthly meetings',
      'Willingness to collaborate'
    ],
    responsibilities: [
      'Participate in planning sessions',
      'Contribute ideas and feedback',
      'Help with community outreach',
      'Test proposed solutions'
    ]
  }
];
