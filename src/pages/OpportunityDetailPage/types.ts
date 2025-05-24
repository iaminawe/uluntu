// Types for OpportunityDetailPage components
export interface Opportunity {
  id: number;
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
