import { FormData } from './types';

// Initial form data state
export const initialFormData: FormData = {
  name: '',
  title: '',
  company: '',
  location: '',
  image: '',
  bio: '',
  intro: '',
  skills: [],
  joinDate: new Date().toISOString().split('T')[0],
  social: {
    linkedin: '',
    twitter: '',
    github: '',
    website: ''
  }
};
