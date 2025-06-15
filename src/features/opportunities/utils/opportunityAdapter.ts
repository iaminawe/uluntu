import { Database } from '../types/supabase';
import { Opportunity } from '../types';

type SupabaseOpportunity = Database['public']['Tables']['opportunities']['Row'];

export function adaptOpportunityFromDatabase(dbOpportunity: SupabaseOpportunity): Opportunity {
  return {
    id: dbOpportunity.id,
    title: dbOpportunity.title,
    company: {
      id: dbOpportunity.organization ?? dbOpportunity.posted_by ?? '1',
      name: dbOpportunity.organization ?? 'Unknown Company',
      logo: dbOpportunity.image ?? '/placeholder-company.png'
    },
    type: (dbOpportunity.type as 'full-time' | 'part-time' | 'contract' | 'volunteer') ?? 'full-time',
    location: dbOpportunity.location ?? 'Remote',
    remote: dbOpportunity.remote === null ? false : dbOpportunity.remote,
    description: dbOpportunity.description ?? '',
    salary: dbOpportunity.compensation ?? undefined,
    postedDate: dbOpportunity.created_at ?? new Date().toISOString(),
    deadline: dbOpportunity.deadline ?? undefined,
    status: (dbOpportunity.status as 'draft' | 'published' | 'archived') ?? 'draft',
    featured: dbOpportunity.featured === null ? false : !!dbOpportunity.featured,
    created_at: dbOpportunity.created_at ?? new Date().toISOString()
  };
}

// Extended opportunity data for edit forms with all database fields
export interface ExtendedOpportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  organization: string;
  location: string;
  remote: boolean;
  compensation: string;
  deadline: string;
  contactEmail: string;
  website: string;
  image: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: string;
  featured: boolean;
  postedBy: string;
  createdAt: string;
}

// Adapter for extended opportunity data
export function adaptExtendedOpportunityFromDatabase(dbOpportunity: SupabaseOpportunity): ExtendedOpportunity {
  return {
    id: dbOpportunity.id,
    title: dbOpportunity.title,
    description: dbOpportunity.description ?? '',
    type: dbOpportunity.type ?? 'job',
    organization: dbOpportunity.organization ?? '',
    location: dbOpportunity.location ?? '',
    remote: dbOpportunity.remote ?? false,
    compensation: dbOpportunity.compensation ?? '',
    deadline: dbOpportunity.deadline ?? '',
    contactEmail: dbOpportunity.contact_email ?? '',
    website: dbOpportunity.website ?? '',
    image: dbOpportunity.image ?? '',
    requirements: dbOpportunity.requirements ?? [],
    responsibilities: dbOpportunity.responsibilities ?? [],
    benefits: dbOpportunity.benefits ?? [],
    status: dbOpportunity.status ?? 'draft',
    featured: dbOpportunity.featured ?? false,
    postedBy: dbOpportunity.posted_by ?? '',
    createdAt: dbOpportunity.created_at ?? new Date().toISOString()
  };
}

export function adaptOpportunityToDatabase(opportunity: Partial<Opportunity>): Database['public']['Tables']['opportunities']['Insert'] {
  // Extract organization name from company if available
  const organization = opportunity.company?.name ?? null;
  
  return {
    title: opportunity.title ?? '',
    description: opportunity.description ?? null,
    type: opportunity.type ?? null,
    location: opportunity.location ?? null,
    remote: opportunity.remote === undefined ? null : opportunity.remote,
    compensation: opportunity.salary ?? null,
    deadline: opportunity.deadline ?? null,
    contact_email: null, // Not available in FrontendOpportunity
    website: null, // Not available in FrontendOpportunity
    image: opportunity.company?.logo ?? null,
    organization: organization,
    posted_by: opportunity.company?.id ?? null,
    requirements: null, // Not available in FrontendOpportunity
    responsibilities: null, // Not available in FrontendOpportunity
    benefits: null, // Not available in FrontendOpportunity
    status: opportunity.status ?? null,
    featured: opportunity.featured === undefined ? null : opportunity.featured
  };
}

// Extended adapter for OpportunityInput with all supported fields
export function adaptOpportunityInputToDatabase(input: {
  title: string;
  description?: string | null;
  type?: string | null;
  organization?: string | null;
  location?: string | null;
  remote?: boolean | null;
  compensation?: string | null;
  deadline?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  image?: string | null;
  requirements?: string[] | null;
  responsibilities?: string[] | null;
  benefits?: string[] | null;
  status?: string | null;
  featured?: boolean | null;
  postedBy?: string | null;
}): Database['public']['Tables']['opportunities']['Insert'] {
  return {
    title: input.title,
    description: input.description ?? null,
    type: input.type ?? null,
    organization: input.organization ?? null,
    location: input.location ?? null,
    remote: input.remote ?? null,
    compensation: input.compensation ?? null,
    deadline: input.deadline ?? null,
    contact_email: input.contactEmail ?? null,
    website: input.website ?? null,
    image: input.image ?? null,
    requirements: input.requirements ?? null,
    responsibilities: input.responsibilities ?? null,
    benefits: input.benefits ?? null,
    posted_by: input.postedBy ?? null,
    status: input.status ?? null,
    featured: input.featured ?? null
  };
}