import { FormData } from './types';
import { ContentStatus } from '../../types/common';

// Initial form data state
export const initialFormData: FormData = {
  name: '',
  slug: '',
  title: '',
  company: '',
  location: '',
  image: '',
  bio: '',
  skills: [],
  interests: [],
  joinDate: new Date().toISOString().split('T')[0],
  status: 'draft' as ContentStatus,
  featured: false,
  social: {
    linkedin: '',
    twitter: '',
    github: '',
    website: ''
  }
};
