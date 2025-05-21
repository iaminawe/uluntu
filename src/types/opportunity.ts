// Define opportunity-related types
export type OpportunityType = 'job' | 'volunteer' | 'funding' | 'community';

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  type: OpportunityType;
  organization: string;
  location: string;
  deadline?: string;
  commitment?: string;
  compensation?: string;
  fundingAmount?: string;
  contactEmail: string;
  postedAt: string;
  image?: string;
  postedBy: {
    name: string;
    image: string;
    title?: string;
    bio?: string;
  };
  website?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
}
