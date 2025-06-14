import { Opportunity as MainOpportunity } from '../../types';
import { ContentStatus } from '../../types/common';

// Types for OpportunityEditPage components

// Local opportunity type for the edit page
export type OpportunityType = 'job' | 'volunteer' | 'funding' | 'community';

export interface FormData {
  title: string;
  description: string;
  type: OpportunityType;
  organization: string;
  location: string;
  deadline: string;
  contactEmail: string;
  website: string;
  image: string;
  compensation: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: ContentStatus;
  featured: boolean;
}

export interface FormSectionProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onDescriptionChange: (data: string) => void;
  onImageChange: (file: File | null) => void;
  isSubmitting: boolean;
}

export interface ListSectionProps {
  items: string[];
  newItem: string;
  setNewItem: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  label: string;
  placeholder: string;
  isSubmitting: boolean;
}

export interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface OpportunityData {
  id: number;
  title: string;
  description: string;
  type: OpportunityType;
  organization: string;
  location: string;
  compensation: string;
  deadline: string;
  contactEmail: string;
  website: string;
  image: string;
  status: ContentStatus;
  featured: boolean;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

// Adapter function to convert from main Opportunity type to local OpportunityData type
export const adaptMainOpportunityToEditData = (opportunity: MainOpportunity): Partial<OpportunityData> => {
  return {
    id: typeof opportunity.id === 'string' ? parseInt(opportunity.id) : opportunity.id as number,
    title: opportunity.title,
    description: opportunity.description,
    // Map the main type to the local type
    type: mapMainTypeToLocalType(opportunity.type),
    organization: opportunity.company.name,
    location: opportunity.location,
    compensation: opportunity.salary || '',
    deadline: opportunity.deadline || '',
    // These fields don't exist in the main type, so they would need to be added separately
    contactEmail: '',
    website: '',
    image: '',
    status: opportunity.status || 'published',
    featured: opportunity.featured === null ? false : opportunity.featured || false,
    // These fields don't exist in the main type, so they would need to be added separately
    requirements: [],
    responsibilities: [],
    benefits: []
  };
};

// Adapter function to convert from local OpportunityData type to main Opportunity type
export const adaptEditDataToMainOpportunity = (data: OpportunityData): Partial<MainOpportunity> => {
  return {
    id: data.id.toString(),
    title: data.title,
    description: data.description,
    company: {
      id: '0', // This would need to be set properly in a real implementation
      name: data.organization,
      logo: data.image || ''
    },
    type: mapLocalTypeToMainType(data.type),
    location: data.location,
    remote: false, // This would need to be set properly in a real implementation
    salary: data.compensation || undefined,
    postedDate: new Date().toISOString(), // This would need to be set properly in a real implementation
    deadline: data.deadline || undefined,
    status: data.status,
    featured: data.featured
  };
};

// Helper function to map main Opportunity type to local type
function mapMainTypeToLocalType(mainType: MainOpportunity['type']): OpportunityType {
  const typeMap: Partial<Record<MainOpportunity['type'], OpportunityType>> = {
    'full-time': 'job',
    'part-time': 'job',
    'contract': 'job',
    'volunteer': 'volunteer'
  };
  
  return typeMap[mainType] || 'job';
}

// Helper function to map local type to main Opportunity type
function mapLocalTypeToMainType(localType: OpportunityType): MainOpportunity['type'] {
  const typeMap: Record<OpportunityType, MainOpportunity['type']> = {
    'job': 'full-time',
    'volunteer': 'volunteer',
    'funding': 'contract',
    'community': 'volunteer'
  };
  
  return typeMap[localType];
}
