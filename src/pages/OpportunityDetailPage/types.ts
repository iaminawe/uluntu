// Types for OpportunityDetailPage components
import { Opportunity as MainOpportunity } from '@/features/opportunities/types';
import { ContentStatus } from '../../types/common';

// Define a local Opportunity interface for the OpportunityDetailPage component
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'job' | 'volunteer' | 'funding' | 'community';
  organization: string;
  location: string;
  compensation?: string;
  deadline?: string;
  contactEmail: string;
  website?: string;
  image?: string;
  postedAt: string;
  postedBy: {
    name: string;
    image: string;
    title: string;
    bio: string;
  };
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status?: ContentStatus;
}

// Adapter function to convert from main Opportunity type to local Opportunity type
export const adaptMainOpportunityToDetailPage = (opportunity: MainOpportunity): Partial<Opportunity> => {
  return {
    id: typeof opportunity.id === 'string' ? opportunity.id : String(opportunity.id),
    title: opportunity.title,
    description: opportunity.description,
    // Map the main type to the local type
    type: mapMainTypeToLocalType(opportunity.type),
    organization: opportunity.company.name,
    location: opportunity.location,
    compensation: opportunity.salary,
    deadline: opportunity.deadline,
    // These fields don't exist in the main type, so they would need to be added separately
    contactEmail: '',
    website: '',
    image: '',
    postedAt: opportunity.postedDate,
    status: opportunity.status
  };
};

// Helper function to map main Opportunity type to local type
function mapMainTypeToLocalType(mainType: MainOpportunity['type']): Opportunity['type'] {
  const typeMap: Partial<Record<MainOpportunity['type'], Opportunity['type']>> = {
    'full-time': 'job',
    'part-time': 'job',
    'contract': 'job',
    'volunteer': 'volunteer',
    'job': 'job',
    'funding': 'funding',
    'community': 'community'
  };
  
  return typeMap[mainType] || 'job';
}

export interface PageHeaderProps {
  id: string;
}

export interface OpportunityHeroProps {
  opportunity: Opportunity;
}

export interface OpportunityInfoProps {
  opportunity: Opportunity;
}

export interface ApplySidebarProps {
  opportunity: Opportunity;
  isApplying: boolean;
  applicationSuccess: boolean;
  handleApply: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoadingStateProps {
  // Can include any customization props in the future
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
