import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import type { Database } from '@/types/supabase';

// Define Tables type to correctly access the Row property
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];

// Base Types from Supabase schema
export type Opportunity = Tables<'opportunities'>['Row'];
export type OpportunityInput = Database['public']['Tables']['opportunities']['Insert'];
export type OpportunityUpdateInput = Database['public']['Tables']['opportunities']['Update'];

// Define a type for the mock opportunity data structure
interface MockOpportunity {
  id: string | number;
  title: string;
  description: string;
  postedDate: string;
  deadline?: string;
  location: string;
  type: string;
  featured?: boolean;
  salaryRange?: string;
  skillsRequired?: string[];
  url?: string;
  status?: string;
  remoteStatus?: 'Remote' | 'Hybrid' | 'On-site';
  company: {
    id: string | number;
    name: string;
    logo: string;
  };
}

export type OpportunityFilters = {
  status?: string;
  // Add other potential filter keys as needed
};

// API clients
// import { opportunitiesApi } from '../api/opportunitiesApi'; // File not found, commenting out

// Mock data and types
import mockData from '../data/mock/mockData';

const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true' || true; // Default to true if not set

/**
 * Custom hook to fetch a list of opportunities.
 * Supports fetching from Supabase or mock data based on the useSupabase flag.
 * Allows filtering by status when using mock data.
 *
 * @param filters - Optional filters to apply to the opportunity list (e.g., status).
 * @returns A UseQueryResult object from Tanstack Query containing the list of opportunities or an error.
 */
export function useOpportunities(filters?: OpportunityFilters): UseQueryResult<Opportunity[], Error> {
  return useQuery<Opportunity[], Error>({
    queryKey: ['opportunities', filters, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<Opportunity[]> => {
      if (!useSupabase) {
        console.log('Mock: Returning opportunities from mockData');
        const mockOpportunities = mockData.opportunities.map((opp_raw: MockOpportunity) => {
          // opp_raw is now correctly inferred from the structure in mockData.ts
          // Its properties like .postedDate, .company.name, .remoteStatus will be recognized.
          return {
            // Ensure these fields match the Supabase 'Opportunity' type
            id: String(opp_raw.id),
            created_at: opp_raw.postedDate, // from mockData.ts
            updated_at: opp_raw.postedDate, // using postedDate for both for mock data
            title: opp_raw.title,
            description: opp_raw.description,
            organization: opp_raw.company.name, // map company.name to organization
            deadline: opp_raw.deadline ?? null, // mockData.ts might not have deadline for all items
            location: opp_raw.location,
            type: opp_raw.type, // ensure this type aligns with Supabase enum if any
            featured: opp_raw.featured ?? false,
            benefits: [], // Default to empty array as 'benefits' is not in mockData.ts opportunity structure
            compensation: opp_raw.salaryRange ?? null, // mockData.ts items have .salaryRange
            contact_email: null, // Default to null as 'contactEmail' is not in mockData.ts opportunity structure
            image: opp_raw.company.logo, // mockData.ts items have .company.logo
            requirements: opp_raw.skillsRequired ?? [], // mockData.ts items have .skillsRequired
            responsibilities: [], // Default to empty array as 'responsibilities' is not in mockData.ts opportunity structure
            posted_by: String(opp_raw.company.id), // use company.id as poster_id
            remote: opp_raw.remoteStatus === 'Remote' || opp_raw.remoteStatus === 'Hybrid',
            // Map status from mockData.ts (e.g., 'approved') to Supabase status (e.g., 'open')
            status: opp_raw.status === 'approved' ? 'open' : (opp_raw.status ?? 'draft'),
            website: opp_raw.url ?? null // mockData.ts items have .url
          };
        }) as Opportunity[];
        
        // Apply filters if provided
        if (filters?.status) {
          return mockOpportunities.filter(opp => opp.status === filters.status);
        }
        
        return mockOpportunities;
      }
      
      console.warn('Supabase call for useOpportunities not implemented as opportunitiesApi is unavailable.');
      throw new Error("Supabase fetch opportunities not implemented");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch a single opportunity by its ID.
 * Supports fetching from Supabase or mock data based on the useSupabase flag.
 *
 * @param id - The ID of the opportunity to fetch (can be number or string).
 * @returns A UseQueryResult object from Tanstack Query containing the opportunity data or null if not found, or an error.
 */
export function useOpportunity(id: number | string): UseQueryResult<Opportunity | null, Error> {
  return useQuery<Opportunity | null, Error>({
    queryKey: ['opportunity', id, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<Opportunity | null> => {
      if (!useSupabase) {
        console.log(`Mock: Fetching opportunity with id: ${id}`);
        // Find the opportunity in the mock data
        const mockOpp = mockData.opportunities.find(opp => String(opp.id) === String(id));
        
        if (!mockOpp) {
          console.warn(`Mock: Opportunity with id ${id} not found`);
          return null;
        }
        
        // Map the mock opportunity to the Supabase Opportunity type
        return {
          id: String(mockOpp.id),
          created_at: mockOpp.postedDate,
          updated_at: mockOpp.postedDate,
          title: mockOpp.title,
          description: mockOpp.description,
          organization: mockOpp.company.name,
          deadline: mockOpp.deadline ?? null,
          location: mockOpp.location,
          type: mockOpp.type,
          featured: mockOpp.featured ?? false,
          benefits: [],
          compensation: mockOpp.salaryRange ?? null,
          contact_email: null,
          image: mockOpp.company.logo,
          requirements: mockOpp.skillsRequired ?? [],
          responsibilities: [],
          posted_by: String(mockOpp.company.id),
          remote: mockOpp.remoteStatus === 'Remote' || mockOpp.remoteStatus === 'Hybrid',
          status: mockOpp.status === 'approved' ? 'open' : (mockOpp.status ?? 'draft'),
          website: mockOpp.url ?? null
        };
      }
      console.warn(`Supabase call for useOpportunity (id: ${id}) not implemented as opportunitiesApi is unavailable.`);
      throw new Error("Supabase fetch opportunity not implemented");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOpportunity(): UseMutationResult<Opportunity | null, Error, OpportunityInput> {
  const queryClient = useQueryClient();

  return useMutation<Opportunity | null, Error, OpportunityInput>({
    mutationFn: async (data: OpportunityInput): Promise<Opportunity | null> => {
      if (!useSupabase) {
        console.log('Mock: Creating opportunity', data);
        
        // Generate a random ID for the mock opportunity
        const mockId = `mock_${Math.random().toString(36).substring(2, 11)}`;
        
        // Create a new opportunity with the provided data
        const newOpportunity: Opportunity = {
          id: mockId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          title: data.title,
          description: data.description,
          organization: data.organization,
          deadline: data.deadline,
          location: data.location,
          type: data.type,
          featured: data.featured ?? false,
          benefits: data.benefits ?? [],
          compensation: data.compensation,
          contact_email: data.contact_email,
          image: data.image,
          requirements: data.requirements ?? [],
          responsibilities: data.responsibilities ?? [],
          posted_by: data.posted_by,
          remote: data.remote ?? false,
          status: data.status ?? 'open',
          website: data.website
        };
        
        // In a real implementation, we would add this to mockData.opportunities
        console.log('Mock: Successfully created opportunity', newOpportunity);
        return newOpportunity;
      }
      console.warn('Supabase call for useCreateOpportunity not implemented as opportunitiesApi is unavailable.');
      throw new Error("Supabase create opportunity not implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity(): UseMutationResult<Opportunity | null, Error, { id: string; data: OpportunityUpdateInput }> {
  const queryClient = useQueryClient();

  return useMutation<Opportunity | null, Error, { id: string; data: OpportunityUpdateInput }>({
    mutationFn: async ({ id, data }: { id: string; data: OpportunityUpdateInput }): Promise<Opportunity | null> => {
      if (!useSupabase) {
        console.log(`Mock: Updating opportunity with id: ${id}`, data);
        const mockOppIndex = mockData.opportunities.findIndex(opp => String(opp.id) === id);
        
        if (mockOppIndex === -1) {
          console.warn(`Mock: Opportunity with id ${id} not found for update`);
          return null;
        }
        
        // Create updated opportunity
        const mockOpp = mockData.opportunities[mockOppIndex] as MockOpportunity;
        const updatedOpp: Opportunity = {
          id: String(mockOpp.id),
          created_at: mockOpp.postedDate,
          updated_at: new Date().toISOString(),
          title: data.title ?? mockOpp.title,
          description: data.description ?? mockOpp.description,
          organization: data.organization ?? mockOpp.company.name,
          deadline: data.deadline ?? mockOpp.deadline ?? null,
          location: data.location ?? mockOpp.location,
          type: data.type ?? mockOpp.type,
          featured: data.featured ?? mockOpp.featured ?? false,
          benefits: data.benefits ?? [],
          compensation: data.compensation ?? null,
          contact_email: data.contact_email ?? null,
          image: data.image ?? mockOpp.company.logo,
          requirements: data.requirements ?? [],
          responsibilities: data.responsibilities ?? [],
          posted_by: data.posted_by ?? String(mockOpp.company.id),
          // Handle remote status properly with type safety
          remote: data.remote ?? (mockOpp.remoteStatus === 'Remote' || mockOpp.remoteStatus === 'Hybrid'),
          status: data.status ?? 'open',
          website: data.website ?? null
        };
        
        // In a real implementation, we would update mockData.opportunities[mockOppIndex]
        return updatedOpp;
      }
      console.warn(`Supabase call for useUpdateOpportunity (id: ${id}) not implemented as opportunitiesApi is unavailable.`);
      throw new Error("Supabase update opportunity not implemented");
    },
    onSuccess: (_data: Opportunity | null, variables: { id: string; data: OpportunityUpdateInput }) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.id] });
    },
  });
}

export function useDeleteOpportunity(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string): Promise<void> => {
      if (!useSupabase) {
        console.log(`Mock: Deleting opportunity with id: ${id}`);
        const opportunityIndex = mockData.opportunities.findIndex(opp => String(opp.id) === id);
        
        if (opportunityIndex === -1) {
          console.warn(`Mock: Opportunity with id ${id} not found for deletion`);
          return;
        }
        
        // In a real implementation, we would remove the opportunity from the array
        // mockData.opportunities.splice(opportunityIndex, 1);
        console.log(`Mock: Successfully deleted opportunity with id: ${id}`);
        return;
      }
      console.warn(`Supabase call for useDeleteOpportunity (id: ${id}) not implemented as opportunitiesApi is unavailable.`);
      throw new Error("Supabase delete opportunity not implemented");
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
    },
  });
}
