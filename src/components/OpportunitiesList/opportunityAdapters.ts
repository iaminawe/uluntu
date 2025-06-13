import { Opportunity as MainOpportunity } from '../../types';
import { Opportunity, OpportunityType } from '@/features/opportunities/components/OpportunitiesList/types';

/**
 * Helper function to convert null values to undefined for optional boolean properties
 */
export function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Safely converts the main opportunity type to the local opportunity type
 * with proper type checking and null handling
 */
export function safeAdaptMainOpportunityToLocal(opportunity: MainOpportunity): Partial<Opportunity> {
  return {
    id: typeof opportunity.id === 'string' ? parseInt(opportunity.id) : opportunity.id as number,
    title: opportunity.title,
    company: {
      id: typeof opportunity.company.id === 'string' 
        ? parseInt(opportunity.company.id) 
        : opportunity.company.id as number,
      name: opportunity.company.name,
      logo: opportunity.company.logo
    },
    type: opportunity.type as OpportunityType,
    location: opportunity.location,
    remote: opportunity.remote,
    description: opportunity.description,
    salary: opportunity.salary,
    postedDate: opportunity.postedDate,
    deadline: opportunity.deadline,
    // Handle null/undefined for featured property
    featured: nullToUndefined(opportunity.featured),
    status: opportunity.status
  };
}

/**
 * Safely converts the local opportunity type to the main opportunity type
 * with proper type checking
 */
export function safeAdaptLocalOpportunityToMain(opportunity: Opportunity): Partial<MainOpportunity> {
  return {
    id: opportunity.id.toString(),
    title: opportunity.title,
    company: {
      id: opportunity.company.id.toString(),
      name: opportunity.company.name,
      logo: opportunity.company.logo
    },
    type: opportunity.type as MainOpportunity['type'],
    location: opportunity.location,
    remote: opportunity.remote,
    description: opportunity.description,
    salary: opportunity.salary,
    postedDate: opportunity.postedDate,
    deadline: opportunity.deadline,
    // Ensure featured is boolean
    featured: opportunity.featured === undefined ? false : opportunity.featured,
    status: opportunity.status
  };
}
