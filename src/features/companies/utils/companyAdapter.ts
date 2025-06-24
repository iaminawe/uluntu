import { Database } from '@/types/supabase';
import { Company } from '../types';
import { ContentStatus } from '../types/common';

/**
 * Type alias for a company record from the Supabase database
 */
type SupabaseCompany = Database['public']['Tables']['companies']['Row'];

/**
 * Type guard to check if a status string is a valid ContentStatus
 * @param status - The status string to check
 * @returns True if the status is a valid ContentStatus
 */
function isValidContentStatus(status: string): status is ContentStatus {
  return ['draft', 'published', 'archived', 'pending'].includes(status);
}

/**
 * Adapts a company record from the Supabase database to the frontend Company model
 * @param dbCompany - The company record from the Supabase database
 * @returns A Company object for use in the frontend
 * @throws Error if required fields are missing or invalid
 */
export function adaptCompanyFromDatabase(dbCompany: SupabaseCompany): Company {
  // Validate required fields
  if (!dbCompany.id) {
    throw new Error('Invalid company data: id is required');
  }
  
  if (!dbCompany.name) {
    throw new Error('Invalid company data: name is required');
  }

  // Validate status is a valid ContentStatus
  if (!isValidContentStatus(dbCompany.status)) {
    throw new Error(`Invalid company data: status "${dbCompany.status}" is not a valid ContentStatus`);
  }

  return {
    id: String(dbCompany.id), // Ensure id is string as BaseEntity expects
    name: dbCompany.name,
    description: dbCompany.description,
    logo: dbCompany.logo,
    cover_image: dbCompany.cover_image ?? undefined, // Use nullish coalescing for clearer intent
    industry: dbCompany.industry ?? [], // Use nullish coalescing for clearer intent
    size: dbCompany.size,
    founded: dbCompany.founded,
    location: dbCompany.location,
    website: dbCompany.website ?? undefined, // Use nullish coalescing for clearer intent
    status: dbCompany.status as ContentStatus, // We've validated this above
    featured: dbCompany.featured ?? false, // Use nullish coalescing for clearer intent
    created_at: dbCompany.created_at
  };
}

/**
 * Adapts a partial Company object to a format suitable for updating a company in Supabase
 * @param company - The partial Company object with fields to update
 * @returns A partial SupabaseCompany object for the update operation
 */
export function adaptCompanyToSupabaseUpdate(company: Partial<Company>): Partial<SupabaseCompany> {
  const supabaseCompany: Partial<SupabaseCompany> = {};

  // Only include defined fields in the update
  if (company.name !== undefined) supabaseCompany.name = company.name;
  if (company.description !== undefined) supabaseCompany.description = company.description;
  if (company.logo !== undefined) supabaseCompany.logo = company.logo;
  if (company.cover_image !== undefined) supabaseCompany.cover_image = company.cover_image ?? null;
  if (company.industry !== undefined) supabaseCompany.industry = company.industry;
  if (company.size !== undefined) supabaseCompany.size = company.size;
  if (company.founded !== undefined) supabaseCompany.founded = company.founded;
  if (company.location !== undefined) supabaseCompany.location = company.location;
  if (company.website !== undefined) supabaseCompany.website = company.website ?? null;
  
  // Validate and set status if provided
  if (company.status !== undefined) {
    if (!isValidContentStatus(company.status)) {
      throw new Error(`Invalid company status: "${company.status}" is not a valid ContentStatus`);
    }
    supabaseCompany.status = company.status;
  }
  
  if (company.featured !== undefined) supabaseCompany.featured = company.featured ?? null;
  // social and employees are not updated directly on the companies table

  return supabaseCompany;
}

/**
 * Adapts a partial Company object to a format suitable for inserting a new company in Supabase
 * @param company - The partial Company object with fields for the new company
 * @returns A SupabaseCompany Insert object for the insert operation
 */
export function adaptCompanyToSupabaseInsert(company: Partial<Omit<Company, 'id' | 'created_at'>>): Database['public']['Tables']['companies']['Insert'] {
  // Validate status if provided
  if (company.status && !isValidContentStatus(company.status)) {
    throw new Error(`Invalid company status: "${company.status}" is not a valid ContentStatus`);
  }

  return {
    name: company.name ?? '', // Provide a default for required fields
    description: company.description ?? '', // Provide a default for required fields
    logo: company.logo ?? '', // Provide a default for required fields
    cover_image: company.cover_image ?? null, // Optional in DB, explicitly set to null if undefined
    industry: company.industry ?? [],
    size: company.size ?? '', // Required in DB
    founded: company.founded ?? '', // Required in DB
    location: company.location ?? '', // Required in DB
    website: company.website ?? null, // Optional in DB, explicitly set to null if undefined
    status: company.status ?? 'draft', // Default if not provided
    featured: company.featured ?? false,
    // social_links and employees_list are not part of the companies table direct insert
  };
}