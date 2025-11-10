import type { FormData } from './types';
import type { Database } from '@/types/supabase';

type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

/**
 * Converts form data to the format expected by Supabase for insert operations
 * Handles null vs undefined conversion for proper TypeScript compatibility
 */
export function convertFormDataToInsert(formData: FormData): TablesInsert<'companies'> {
  return {
    name: formData.name,
    slug: formData.slug,
    description: formData.description,
    logo: formData.logo || '', // Ensure logo is a string as required by schema
    // Properly handle null for cover_image which can be null in schema
    cover_image: formData.coverImage || null,
    industry: formData.industry,
    size: formData.size,
    founded: formData.founded,
    location: formData.location,
    // Convert website to null if empty (assuming website is in the schema but not shown)
    website: formData.website || null,
    status: formData.status || 'published',
    featured: formData.featured || false
    // Note: social field is not included as it's not in the Supabase schema
  };
}

/**
 * Converts form data to the format expected by Supabase for update operations
 * Handles null vs undefined conversion for proper TypeScript compatibility
 */
export function convertFormDataToUpdate(formData: FormData): TablesUpdate<'companies'> {
  return {
    name: formData.name,
    slug: formData.slug,
    description: formData.description,
    logo: formData.logo || '', // Ensure logo is a string as required by schema
    // Properly handle null for cover_image which can be null in schema
    cover_image: formData.coverImage || null,
    industry: formData.industry,
    size: formData.size,
    founded: formData.founded,
    location: formData.location,
    // Convert website to null if empty
    website: formData.website || null,
    status: formData.status || 'published',
    featured: formData.featured || false
    // Note: social field is not included as it's not in the Supabase schema
  };
}
