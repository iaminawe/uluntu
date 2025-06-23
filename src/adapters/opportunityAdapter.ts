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

export function adaptOpportunityToDatabase(opportunity: Partial<Opportunity>): Database['public']['Tables']['opportunities']['Insert'] {
  // Extract organization name from company if available
  const organization = opportunity.company?.name ?? 'Unknown Company';
  
  return {
    title: opportunity.title ?? '', // Required field
    description: opportunity.description ?? '', // Required field
    type: opportunity.type ?? 'full-time', // Required field
    location: opportunity.location ?? 'Remote', // Required field
    remote: opportunity.remote ?? false, // Required field
    compensation: opportunity.salary ?? null,
    deadline: opportunity.deadline ?? null,
    contact_email: 'contact@example.com', // Required field - should be provided
    website: null, // Not available in FrontendOpportunity
    image: opportunity.company?.logo ?? null,
    organization: organization, // Required field
    posted_by: opportunity.company?.id ?? '', // Required field
    requirements: null, // Not available in FrontendOpportunity
    responsibilities: null, // Not available in FrontendOpportunity
    benefits: null, // Not available in FrontendOpportunity
    status: opportunity.status ?? 'draft', // Required field
    featured: opportunity.featured ?? null
  };
}