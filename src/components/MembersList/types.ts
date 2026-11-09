// Types for MembersList component
import { Member as MainMember } from '../../types';

// Use the main application's Member type directly
export type Member = MainMember;

export interface MembersListProps {
  initialSearch?: string;
  initialSkills?: string[];
  companyId?: string;
  members?: Member[];
  loading?: boolean;
  error?: Error | null;
}

export interface FilterOptions {
  search: string;
  skills?: string[];
}

// Common skills for filter options
export const SKILL_OPTIONS = [
  'JavaScript', 
  'React', 
  'Node.js', 
  'Python', 
  'UI/UX', 
  'Product Management',
  'DevOps', 
  'Data Science', 
  'Machine Learning', 
  'Blockchain',
  'Ruby',
  'Java',
  'PHP',
  'AWS',
  'Docker',
  'GraphQL'
];

// Sample member data - in a real application this would come from an API
export const SAMPLE_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Full Stack Developer',
    status: 'published',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    bio: 'Full stack developer with over 8 years of experience building web applications with React and Node.js.',
    skills: ['JavaScript', 'React', 'Node.js', 'GraphQL', 'AWS'],
    joinDate: '2022-05-15',
    social: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      github: 'https://github.com/sarahjohnson',
      website: 'https://sarahjohnson.dev'
    }
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'UX/UI Designer',
    status: 'published',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    company: 'Uluntu Digital',
    location: 'Nelson, BC',
    bio: 'Michael is a UX/UI designer with a passion for creating intuitive and beautiful user experiences.',
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping'],
    joinDate: '2023-02-15',
    social: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      twitter: 'https://twitter.com/michaelchen'
    }
  },
  {
    id: '3',
    name: 'Emma Wilson',
    title: 'Data Scientist',
    status: 'published',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    company: 'Alpine Analytics',
    location: 'Trail, BC',
    bio: 'Data scientist with expertise in machine learning and predictive modeling for environmental applications.',
    skills: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow', 'SQL'],
    joinDate: '2022-08-22',
    social: {
      linkedin: 'https://linkedin.com/in/emmawilson',
      github: 'https://github.com/emmawilson'
    }
  },
  {
    id: '4',
    name: 'David Thompson',
    title: 'DevOps Engineer',
    status: 'published',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    company: 'Uluntu Cloud Services',
    location: 'Rossland, BC',
    bio: 'DevOps engineer specializing in AWS infrastructure, CI/CD pipelines, and containerization.',
    skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Terraform'],
    joinDate: '2023-03-05',
    social: {
      linkedin: 'https://linkedin.com/in/davidthompson',
      github: 'https://github.com/davidthompson'
    }
  },
  {
    id: '5',
    name: 'Jessica Lee',
    title: 'Product Manager',
    status: 'published',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    bio: 'Product manager with a background in software development, focused on building impactful user-centered products.',
    skills: ['Product Management', 'Agile', 'User Stories', 'Product Strategy'],
    joinDate: '2022-11-15',
    social: {
      linkedin: 'https://linkedin.com/in/jessicalee',
      twitter: 'https://twitter.com/jessicalee'
    }
  },
  {
    id: '6',
    name: 'Robert Clark',
    title: 'Blockchain Developer',
    status: 'published',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    company: 'Digital Ledger Tech',
    location: 'Kelowna, BC',
    bio: 'Blockchain developer creating decentralized applications and smart contracts for various industries.',
    skills: ['Blockchain', 'Solidity', 'Web3.js', 'Smart Contracts', 'JavaScript'],
    joinDate: '2023-02-20',
    social: {
      linkedin: 'https://linkedin.com/in/robertclark',
      github: 'https://github.com/robertclark',
      website: 'https://robertclark.dev'
    }
  }
];
