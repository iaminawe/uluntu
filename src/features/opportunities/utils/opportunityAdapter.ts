import { Database } from '@/types/supabase';
import { Opportunity } from '../types';

type SupabaseOpportunity = Database['public']['Tables']['opportunities']['Row'];

export function adaptOpportunityFromDatabase(dbOpportunity: SupabaseOpportunity): Opportunity {
  return {
    id: dbOpportunity.id,
    title: dbOpportunity.title,
    company: {
      id: dbOpportunity.organization ?? dbOpportunity.posted_by ?? '1',
      name: dbOpportunity.organization ?? 'Unknown Company',
      logo: dbOpportunity.image ?? '/placeholder-image.png'
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
    created_at: dbOpportunity.created_at ?? new Date().toISOString(),
    // Add missing fields for detail page
    organization: dbOpportunity.organization ?? '',
    contactEmail: dbOpportunity.contact_email ?? '',
    website: dbOpportunity.website ?? '',
    image: dbOpportunity.image ?? '',
    requirements: dbOpportunity.requirements ?? [],
    responsibilities: dbOpportunity.responsibilities ?? [],
    benefits: dbOpportunity.benefits ?? []
  };
}

// Extended opportunity data for edit forms with all database fields
export interface ExtendedOpportunity {
  id: string;
  title: string;
  slug?: string;
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
    slug: (dbOpportunity as any).slug ?? '',
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
    description: opportunity.description || '',
    type: opportunity.type || '',
    location: opportunity.location || '',
    remote: opportunity.remote === undefined ? false : opportunity.remote,
    compensation: opportunity.salary || '',
    deadline: opportunity.deadline || '',
    contact_email: '', // Not available in FrontendOpportunity
    website: '', // Not available in FrontendOpportunity
    image: opportunity.company?.logo || '',
    organization: organization || '',
    posted_by: opportunity.company?.id || '',
    requirements: null, // Not available in FrontendOpportunity
    responsibilities: null, // Not available in FrontendOpportunity
    benefits: null, // Not available in FrontendOpportunity
    status: opportunity.status || undefined,
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
    description: input.description || '',
    type: input.type || '',
    organization: input.organization || '',
    location: input.location || '',
    remote: input.remote || undefined,
    compensation: input.compensation || '',
    deadline: input.deadline || '',
    contact_email: input.contactEmail || '',
    website: input.website || '',
    image: input.image || '',
    requirements: input.requirements ?? null,
    responsibilities: input.responsibilities ?? null,
    benefits: input.benefits ?? null,
    posted_by: input.postedBy || '',
    status: input.status || undefined,
    featured: input.featured ?? null
  };
}