import { BaseEntity, SocialLinks, ContentStatus } from './types';

// Member interface
export interface Member extends BaseEntity {
  name: string;
  title: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  intro?: string;
  skills?: string[];
  joinDate: string;
  social?: SocialLinks;
  status: ContentStatus;
  featured?: boolean;
}

// Members data
export const members: Member[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'AI Research Lead',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'AI researcher with 8+ years of experience in machine learning and neural networks.',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Research'],
    intro: 'Leading the charge in AI research and innovation from the heart of the Uluntu community.',
    joinDate: '2023-05-15',
    status: 'published' as ContentStatus,
    social: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahjohnson',
      github: 'https://github.com/sarahjohnson'
    },
    featured: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'ML Engineer',
    company: 'Uluntu AI Solutions',
    location: 'Nelson, BC',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    bio: 'Machine learning engineer specializing in computer vision and natural language processing.',
    skills: ['Computer Vision', 'NLP', 'PyTorch', 'AWS'],
    intro: 'Building intelligent systems that solve real-world problems in the Uluntu community.',
    joinDate: '2023-06-02',
    status: 'published' as ContentStatus,
    social: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      github: 'https://github.com/michaelchen'
    },
    featured: false,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    title: 'Data Scientist',
    company: 'Uluntu Data Insights',
    location: 'Rossland, BC',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    bio: 'Data scientist with a background in statistics and environmental science.',
    skills: ['Data Analysis', 'R', 'Python', 'Statistical Modeling'],
    intro: 'Using data to drive environmental conservation efforts in the Uluntu community.',
    joinDate: '2023-07-10',
    status: 'published' as ContentStatus,
    social: {
      linkedin: 'https://linkedin.com/in/emmawilson',
      twitter: 'https://twitter.com/emmawilson'
    },
    featured: true,
  },
  {
    id: '4',
    name: 'David Park',
    title: 'Frontend Developer',
    company: 'Mountain Web Works',
    location: 'Nelson, BC',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    bio: 'Frontend developer passionate about creating beautiful and accessible web experiences.',
    skills: ['React', 'TypeScript', 'CSS', 'Accessibility'],
    intro: 'Crafting digital experiences that are both beautiful and inclusive.',
    joinDate: '2023-08-15',
    status: 'published' as ContentStatus,
    social: {
      linkedin: 'https://linkedin.com/in/davidpark',
      github: 'https://github.com/davidpark',
      website: 'https://davidpark.dev'
    },
    featured: false,
  },
  {
    id: '5',
    name: 'Olivia Martinez',
    title: 'UX/UI Designer',
    company: 'Uluntu Creative',
    location: 'Castlegar, BC',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    bio: 'UX/UI designer with a focus on user-centered design and research.',
    skills: ['UX Research', 'UI Design', 'Figma', 'User Testing'],
    intro: 'Creating intuitive and delightful user experiences for digital products.',
    joinDate: '2023-09-05',
    status: 'published' as ContentStatus,
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/oliviamartinez',
      website: 'https://oliviamartinez.design'
    }
  }
];
