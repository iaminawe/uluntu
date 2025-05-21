// Types for Opportunities components

export type OpportunityType = 'full-time' | 'part-time' | 'contract' | 'volunteer' | 'internship';
export type OpportunityCategory = 'engineering' | 'design' | 'management' | 'marketing' | 'sales' | 'support' | 'other';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export interface Company {
  id: number;
  name: string;
  logo: string;
  location?: string;
}

export interface Opportunity {
  id: number;
  title: string;
  company: Company;
  type: OpportunityType;
  category: OpportunityCategory;
  experienceLevel: ExperienceLevel;
  location: string;
  remote: boolean;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  salary?: string;
  postedDate: string;
  deadline?: string;
  applyUrl?: string;
  featured?: boolean;
}

export interface OpportunitiesListProps {
  initialCategory?: OpportunityCategory;
  companyId?: number;
}

export interface FilterOptions {
  type: OpportunityType | 'all';
  experienceLevel: ExperienceLevel | 'all';
  remote: boolean | 'all';
  search: string;
}

// Sample opportunities data
export const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    company: {
      id: 1,
      name: 'Mountain Tech Solutions',
      logo: 'https://images.pexels.com/photos/2764678/pexels-photo-2764678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      location: 'Nelson, BC'
    },
    type: 'full-time',
    category: 'engineering',
    experienceLevel: 'senior',
    location: 'Nelson, BC',
    remote: true,
    description: 'Join our team of experienced developers working on innovative solutions for the tourism industry.',
    responsibilities: [
      'Develop and maintain web applications using React and Node.js',
      'Collaborate with cross-functional teams to define and implement new features',
      'Optimize applications for maximum performance and scalability',
      'Implement automated testing strategies'
    ],
    requirements: [
      '5+ years of experience with modern JavaScript frameworks',
      'Strong knowledge of React, TypeScript, and Node.js',
      'Experience with cloud platforms (AWS/Azure/GCP)',
      'Strong communication skills'
    ],
    salary: '$90,000 - $120,000 CAD',
    postedDate: '2025-04-15',
    deadline: '2025-06-15',
    applyUrl: 'https://example.com/apply',
    featured: true
  },
  {
    id: 2,
    title: 'UX/UI Designer',
    company: {
      id: 2,
      name: 'Creative Solutions',
      logo: 'https://images.pexels.com/photos/2469/El-Capitan-Yosemite-Apple-Mac.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    type: 'contract',
    category: 'design',
    experienceLevel: 'mid',
    location: 'Kelowna, BC',
    remote: true,
    description: 'Looking for a talented UX/UI designer to help create engaging user experiences for our digital products.',
    responsibilities: [
      'Create wireframes, prototypes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Collaborate with developers to implement designs',
      'Maintain and evolve our design system'
    ],
    requirements: [
      '3+ years of experience in UX/UI design',
      'Proficiency in design tools (Figma, Sketch, Adobe XD)',
      'Portfolio demonstrating strong design thinking',
      'Experience with responsive web design'
    ],
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
      logo: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    type: 'volunteer',
    category: 'marketing',
    experienceLevel: 'entry',
    location: 'Remote',
    remote: true,
    description: 'Help our organization connect with local tech professionals and organize community events.',
    responsibilities: [
      'Coordinate regular meetups and networking events',
      'Manage social media accounts and community engagement',
      'Connect with local businesses and professionals',
      'Assist with grant applications and fundraising'
    ],
    postedDate: '2025-05-10'
  },
  {
    id: 4,
    title: 'Product Manager',
    company: {
      id: 4,
      name: 'Alpine Software',
      logo: 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    type: 'full-time',
    category: 'management',
    experienceLevel: 'lead',
    location: 'Castlegar, BC',
    remote: false,
    description: 'Lead product development efforts for our suite of tourism management software.',
    responsibilities: [
      'Define product vision, strategy, and roadmap',
      'Gather and prioritize product requirements',
      'Work closely with engineering, design, and marketing teams',
      'Analyze market trends and competitive landscape'
    ],
    requirements: [
      '5+ years of product management experience',
      'Strong analytical and problem-solving skills',
      'Experience with agile development methodologies',
      'Excellent communication and leadership abilities'
    ],
    salary: '$85,000 - $110,000 CAD',
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
      logo: 'https://images.pexels.com/photos/2469/El-Capitan-Yosemite-Apple-Mac.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    type: 'internship',
    category: 'marketing',
    experienceLevel: 'entry',
    location: 'Kelowna, BC',
    remote: false,
    description: 'Great opportunity for marketing students to gain hands-on experience in a dynamic tech company.',
    responsibilities: [
      'Assist with social media management and content creation',
      'Help organize marketing campaigns and events',
      'Conduct market research and competitor analysis',
      'Support the marketing team with various administrative tasks'
    ],
    requirements: [
      'Currently enrolled in a marketing, communications, or business program',
      'Strong written and verbal communication skills',
      'Familiarity with social media platforms',
      'Self-motivated and eager to learn'
    ],
    postedDate: '2025-05-05',
    deadline: '2025-05-25'
  }
];
