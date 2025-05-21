// Types for DirectoryList component

export interface Member {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  image: string;
}

export interface DirectoryListProps {
  initialSearch?: string;
  initialSkill?: string;
}

export interface FilterOptions {
  search: string;
  skills: string[];
}

// Sample member data for development
export const SAMPLE_MEMBERS: Member[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Full Stack Developer',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    skills: ['React', 'Node.js', 'TypeScript'],
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'UX Designer',
    company: 'Design Forward',
    location: 'Rossland, BC',
    skills: ['UI/UX', 'Figma', 'User Research'],
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    title: 'Data Scientist',
    company: 'Data Insights Co',
    location: 'Cranbrook, BC',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
  },
  {
    id: 4,
    name: 'David Thompson',
    title: 'Frontend Developer',
    company: 'Web Wizards',
    location: 'Trail, BC',
    skills: ['React', 'JavaScript', 'CSS', 'Tailwind'],
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
  },
  {
    id: 5,
    name: 'Jessica Lee',
    title: 'Backend Engineer',
    company: 'Server Solutions',
    location: 'Castlegar, BC',
    skills: ['Java', 'Spring', 'PostgreSQL', 'Microservices'],
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
  }
];
