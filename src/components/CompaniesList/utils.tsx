import { Company, FilterOptions } from './types';

// Calculate years since founding
export const yearsActive = (foundedYear: string): string => {
  const foundedDate = new Date(foundedYear);
  const currentYear = new Date().getFullYear();
  const years = currentYear - foundedDate.getFullYear();
  
  if (years === 0) return 'Founded this year';
  if (years === 1) return '1 year in business';
  return `${years} years in business`;
};

// Format employee count
export const formatEmployeeCount = (employees?: number[]): string => {
  if (!employees) return 'No team members';
  
  const count = employees.length;
  if (count === 0) return 'No team members';
  if (count === 1) return '1 team member';
  return `${count} team members`;
};

// Truncate description to specified length
export const truncateDescription = (description: string, maxLength: number = 150): string => {
  if (description.length <= maxLength) return description;
  
  const lastSpace = description.substring(0, maxLength).lastIndexOf(' ');
  if (lastSpace === -1) return description.substring(0, maxLength) + '...';
  
  return description.substring(0, lastSpace) + '...';
};

// Get company size as a text representation
export const getCompanySizeText = (size: string): string => {
  // Convert common size formats to readable text
  const sizeMap: Record<string, string> = {
    'micro': '1-9 employees',
    'small': '10-49 employees',
    'medium': '50-249 employees',
    'large': '250+ employees'
  };
  
  return sizeMap[size.toLowerCase()] || size;
};

// Format foundation date to readable format
export const formatFoundedDate = (date: string): string => {
  const foundedDate = new Date(date);
  
  // Check if only year was provided
  if (date.length === 4) {
    return date;
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long'
  }).format(foundedDate);
};
