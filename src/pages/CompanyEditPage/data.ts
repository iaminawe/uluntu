import { FormData } from './types';

// Initial form data state
export const initialFormData: FormData = {
  name: '',
  description: '',
  logo: '',
  coverImage: '',
  industry: [],
  size: '',
  founded: '',
  location: '',
  website: '',
  social: {
    linkedin: '',
    twitter: '',
    github: ''
  },
  status: 'published', // Default status
  featured: false // Default featured state
};
