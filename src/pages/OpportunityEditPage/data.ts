import { OpportunityData, FormData } from './types';

// Sample opportunity data for edit mode
export const SAMPLE_OPPORTUNITY: OpportunityData = {
  id: 1,
  title: 'Senior Full Stack Developer',
  description: 'Looking for an experienced developer to join our growing team. We are a fast-paced startup working on innovative solutions for the tech industry. The ideal candidate will have a strong background in modern web technologies and a passion for creating high-quality software.',
  type: 'job',
  organization: 'Mountain Tech Solutions',
  location: 'Nelson, BC',
  compensation: '$90,000 - $120,000/year',
  deadline: '2025-04-30',
  contactEmail: 'jobs@mountaintech.com',
  website: 'https://mountaintech.com',
  image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  status: 'published',
  featured: true,
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
};

// Initial form data state
export const initialFormData: FormData = {
  title: '',
  slug: '',
  description: '',
  type: 'job' as const,
  organization: '',
  location: '',
  deadline: '',
  contactEmail: '',
  website: '',
  image: '',
  compensation: '',
  requirements: [],
  responsibilities: [],
  benefits: [],
  status: 'draft',
  featured: false
};
