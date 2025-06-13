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