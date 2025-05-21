import { FormData, SampleListing } from './types';

// Sample listing data for edit mode
export const SAMPLE_LISTING: SampleListing = {
  id: 1,
  title: 'MacBook Pro 16" M1 Pro',
  description: 'Late 2021 model in excellent condition. Perfect for development work.',
  type: 'equipment',
  price: 2000,
  condition: 'like-new',
  location: 'Nelson, BC',
  tags: ['Apple', 'Laptop', 'Development'],
  status: 'published',
  featured: true
};

// Initial form data state
export const initialFormData: FormData = {
  title: '',
  description: '',
  type: 'product',
  status: 'draft',
  price: '',
  condition: '',
  location: '',
  tags: [],
  newTag: '',
  featured: false
};
