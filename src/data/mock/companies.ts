import { BaseEntity, SocialLinks, ContentStatus } from '../../types/common';

// Company interface
export interface Company extends BaseEntity {
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website?: string;
  social?: SocialLinks;
  employees?: string[];
}

// Companies data
export const companies: Company[] = [
  {
    id: '00112233-aabb-ccdd-eeff-001122aabbcc',
    name: 'Test Company UUID',
    description: 'A test company with a specific UUID for debugging purposes.',
    logo: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    coverImage: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
    industry: ['Technology', 'Testing'],
    size: '10-50 employees',
    founded: '2023',
    location: 'Nelson, BC',
    website: 'https://testcompany.example.com',
    status: 'published' as ContentStatus,
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/company/testcompany',
      twitter: 'https://twitter.com/testcompany'
    },
    employees: []
  },
  {
    id: '1',
    name: 'Mountain Tech Solutions',
    description: 'A leading technology company in the Uluntu community specializing in AI and machine learning solutions for environmental monitoring and sustainable resource management.',
    logo: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
    coverImage: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
    industry: ['Technology', 'Artificial Intelligence', 'Environmental Tech'],
    size: '10-50 employees',
    founded: '2018',
    location: 'Nelson, BC',
    website: 'https://mountaintech.example.com',
    status: 'published' as ContentStatus,
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/company/mountaintech',
      twitter: 'https://twitter.com/mountaintech',
      github: 'https://github.com/mountaintech'
    },
    employees: ['1', '4']
  },
  {
    id: '2',
    name: 'Uluntu AI Solutions',
    description: 'Specialized AI consulting firm helping local businesses implement machine learning solutions to improve operations and sustainability.',
    logo: 'https://images.pexels.com/photos/2312369/pexels-photo-2312369.jpeg',
    coverImage: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    industry: ['Artificial Intelligence', 'Consulting', 'Technology'],
    size: '2-10 employees',
    founded: '2020',
    location: 'Nelson, BC',
    website: 'https://kootenayai.example.com',
    status: 'published' as ContentStatus,
    social: {
      linkedin: 'https://linkedin.com/company/kootenayai',
      github: 'https://github.com/kootenayai'
    },
    employees: ['2']
  },
  {
    id: '3',
    name: 'Uluntu Data Insights',
    description: 'Data analytics company focused on environmental monitoring and conservation efforts in the Uluntu community.',
    logo: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
    coverImage: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg',
    industry: ['Data Analytics', 'Environmental', 'Conservation'],
    size: '2-10 employees',
    founded: '2021',
    location: 'Rossland, BC',
    website: 'https://kootenaydata.example.com',
    status: 'published' as ContentStatus,
    social: {
      linkedin: 'https://linkedin.com/company/kootenaydata'
    },
    employees: ['3']
  },
  {
    id: '4',
    name: 'Mountain Web Works',
    description: 'Web development studio creating beautiful, accessible websites and applications for local businesses and organizations.',
    logo: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
    coverImage: 'https://images.pexels.com/photos/196646/pexels-photo-196646.jpeg',
    industry: ['Web Development', 'Design', 'Technology'],
    size: '2-10 employees',
    founded: '2019',
    location: 'Nelson, BC',
    website: 'https://mountainweb.example.com',
    status: 'published' as ContentStatus,
    social: {
      linkedin: 'https://linkedin.com/company/mountainweb',
      github: 'https://github.com/mountainweb'
    },
    employees: ['4']
  },
  {
    id: '5',
    name: 'Uluntu Creative',
    description: 'Design studio specializing in UX/UI design, branding, and digital marketing for sustainable and community-focused businesses.',
    logo: 'https://images.pexels.com/photos/6444/pencil-typography-black-design.jpg',
    coverImage: 'https://images.pexels.com/photos/6444/pencil-typography-black-design.jpg',
    industry: ['Design', 'Marketing', 'Creative'],
    size: '2-10 employees',
    founded: '2020',
    location: 'Castlegar, BC',
    website: 'https://kootenaycreative.example.com',
    status: 'published' as ContentStatus,
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/company/kootenaycreative',
      twitter: 'https://twitter.com/kootenaycreative'
    },
    employees: ['5']
  }
];
