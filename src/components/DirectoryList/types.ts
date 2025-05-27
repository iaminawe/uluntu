// Types for DirectoryList component

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Member {
  id: string;
  name: string;
  title: string;
  company?: string;
  location?: string;
  skills?: string[];
  image: string;
  intro?: string; // Short introduction sentence
  bio?: string;
  joinDate: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DirectoryListProps {
  initialSearch?: string;
  initialSkill?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FilterOptions {
  search: string;
  skills: string[];
}

// Sample member data for development
export const SAMPLE_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Full Stack Developer',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    skills: ['React', 'Node.js', 'TypeScript'],
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    intro: 'Passionate about building scalable web applications and mentoring junior developers.',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'UX Designer',
    company: 'Design Forward',
    location: 'Rossland, BC',
    skills: ['UI/UX', 'Figma', 'User Research'],
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    intro: 'Creating intuitive user experiences that bridge the gap between technology and human needs.',
    joinDate: '2023-02-20'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    title: 'Data Scientist',
    company: 'Data Insights Co',
    location: 'Cranbrook, BC',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
    intro: 'Turning complex data into actionable insights for sustainable business growth.',
    joinDate: '2023-03-10'
  },
  {
    id: '4',
    name: 'David Thompson',
    title: 'Frontend Developer',
    company: 'Web Wizards',
    location: 'Trail, BC',
    skills: ['React', 'JavaScript', 'CSS', 'Tailwind'],
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    intro: 'Crafting beautiful, responsive interfaces that deliver exceptional user experiences.',
    joinDate: '2023-04-05'
  },
  {
    id: '5',
    name: 'Jessica Lee',
    title: 'Backend Engineer',
    company: 'Server Solutions',
    location: 'Castlegar, BC',
    skills: ['Java', 'Spring', 'PostgreSQL', 'Microservices'],
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    intro: 'Building robust backend systems that power modern applications at scale.',
    joinDate: '2023-05-12'
  }
];
