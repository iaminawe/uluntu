import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import type { Database } from '@/types/supabase';
import { Opportunity as FrontendOpportunity } from '@/types';
import { IS_SUPABASE_ENABLED } from '@/config/env';

// Define Tables type to correctly access the Row property
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];

// Base Types from Supabase schema
export type SupabaseOpportunity = Tables<'opportunities'>['Row'];
export type OpportunityInput = Database['public']['Tables']['opportunities']['Insert'];
export type OpportunityUpdateInput = Database['public']['Tables']['opportunities']['Update'];

// Define valid opportunity types and statuses for type checking
export type OpportunityType = 'full-time' | 'part-time' | 'contract' | 'volunteer';
export type OpportunityStatus = 'draft' | 'published' | 'archived';

// Define a type for the mock data structure
type MockOpportunityType = {
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
};

type MockDataType = {
  opportunities: MockOpportunityType[];
};

export type OpportunityFilters = {
  status?: string;
  // Add other potential filter keys as needed
};

// API clients
import { opportunitiesApi } from '@/features/opportunities/api/opportunitiesApi';

// Mock data and types
import mockData from '../data/mock/mockData';

const useSupabase = IS_SUPABASE_ENABLED; // Use strict equality check

/**
 * Custom hook to fetch a list of opportunities.
 * Supports fetching from Supabase or mock data based on the useSupabase flag.
 * Allows filtering by status when using mock data.
 *
 * @param filters - Optional filters to apply to the opportunity list (e.g., status).
 * @returns A UseQueryResult object from Tanstack Query containing the list of opportunities or an error.
 */
export function useOpportunities(filters?: OpportunityFilters): UseQueryResult<FrontendOpportunity[], Error> {
  return useQuery<FrontendOpportunity[], Error>({
    queryKey: ['opportunities', filters, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<FrontendOpportunity[]> => {
      if (!useSupabase) {
        // Type cast mockData with proper type checking
        const typedMockData = mockData as unknown as MockDataType;
        
        // Ensure opportunities array exists
        const opportunities = typedMockData.opportunities || [];
        
        const mockOpportunities = opportunities.map((opp_raw) => {
          // Helper function to validate opportunity type
          const validateOpportunityType = (type?: string | null): OpportunityType => {
            if (!type) return 'full-time';
            const validTypes: OpportunityType[] = ['full-time', 'part-time', 'contract', 'volunteer'];
            return validTypes.includes(type as OpportunityType) ? (type as OpportunityType) : 'full-time';
          };
          
          // Helper function to validate opportunity status
          const validateOpportunityStatus = (status?: string | null): OpportunityStatus => {
            if (!status) return 'draft';
            const validStatuses: OpportunityStatus[] = ['draft', 'published', 'archived'];
            return validStatuses.includes(status as OpportunityStatus) ? (status as OpportunityStatus) : 'draft';
          };
          
          // Map mock data to frontend opportunity format with proper type handling
          return {
            id: String(opp_raw.id),
            title: opp_raw.title,
            company: {
              id: String(opp_raw.company?.id || ''),
              name: opp_raw.company?.name || '',
              logo: opp_raw.company?.logo || ''
            },
            type: validateOpportunityType(opp_raw.type),
            location: opp_raw.location || '',
            remote: opp_raw.remoteStatus === 'Remote' || opp_raw.remoteStatus === 'Hybrid',
            description: opp_raw.description || '',
            salary: opp_raw.salaryRange,
            postedDate: opp_raw.postedDate || new Date().toISOString(),
            deadline: opp_raw.deadline,
            status: opp_raw.status === 'approved' ? 'published' : validateOpportunityStatus(opp_raw.status),
            featured: Boolean(opp_raw.featured),
            created_at: opp_raw.postedDate || new Date().toISOString()
          };
        });
        
        // Apply filters if provided
        if (filters?.status) {
          // Safely filter by status with null check
          return mockOpportunities.filter(opp => opp?.status === filters.status);
        }
        
        return mockOpportunities;
      }
      
      try {
        // Convert filters to the format expected by opportunitiesApi.getAll
        const apiFilters: Record<string, unknown> = {};
        if (filters?.status) {
          // Add status filter if needed - currently not directly supported in the API
          apiFilters.status = filters.status;
        }
        
        // Call the real API
        return await opportunitiesApi.getAll(apiFilters) as any;
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
      }
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
export function useOpportunity(id: string): UseQueryResult<FrontendOpportunity | null, Error> {
  return useQuery<FrontendOpportunity | null, Error>({
    queryKey: ['opportunity', id, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<FrontendOpportunity | null> => {
      if (!useSupabase) {
        const typedMockData = mockData as unknown as MockDataType;
        const mockOpp = typedMockData.opportunities.find(opp => String(opp.id) === id);
        
        if (!mockOpp) {
          return null;
        }
        
        return {
          id: String(mockOpp.id),
          title: mockOpp.title,
          company: {
            id: String(mockOpp.company.id),
            name: mockOpp.company.name,
            logo: mockOpp.company.logo
          },
          type: mockOpp.type as 'full-time' | 'part-time' | 'contract' | 'volunteer',
          location: mockOpp.location,
          remote: mockOpp.remoteStatus === 'Remote' || mockOpp.remoteStatus === 'Hybrid',
          description: mockOpp.description,
          salary: mockOpp.salaryRange,
          postedDate: mockOpp.postedDate,
          deadline: mockOpp.deadline,
          status: mockOpp.status === 'approved' ? 'published' : ((mockOpp.status || 'draft') as 'draft' | 'published' | 'archived'),
          featured: mockOpp.featured ?? false,
          created_at: mockOpp.postedDate
        };
      }
      
      try {
        // Call the real API to get a single opportunity by ID
        return await opportunitiesApi.getById(id) as any;
      } catch (error) {
        console.error(`Error fetching opportunity with id ${id}:`, error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOpportunity(): UseMutationResult<FrontendOpportunity | null, Error, OpportunityInput> {
  const queryClient = useQueryClient();

  return useMutation<FrontendOpportunity | null, Error, OpportunityInput>({
    mutationFn: async (data: OpportunityInput): Promise<FrontendOpportunity | null> => {
      if (!useSupabase) {
        // Create a unique ID for the mock opportunity
        const mockId = `mock-${Date.now()}`;
        
        // Helper function to validate opportunity type
        const validateOpportunityType = (type?: string): 'full-time' | 'part-time' | 'contract' | 'volunteer' => {
          if (!type) return 'full-time';
          const validTypes = ['full-time', 'part-time', 'contract', 'volunteer'];
          return validTypes.includes(type) 
            ? type as 'full-time' | 'part-time' | 'contract' | 'volunteer' 
            : 'full-time';
        };
        
        // Helper function to validate opportunity status
        const validateOpportunityStatus = (status?: string): 'draft' | 'published' | 'archived' => {
          if (!status) return 'draft';
          const validStatuses = ['draft', 'published', 'archived'];
          return validStatuses.includes(status) 
            ? status as 'draft' | 'published' | 'archived' 
            : 'draft';
        };
        
        // Create a new opportunity based on the input data with proper type handling
        const mockOpp: FrontendOpportunity = {
          id: mockId,
          title: data.title || 'New Opportunity',
          company: {
            id: data.posted_by || '1',
            name: data.organization ?? 'Company Name', // Use nullish coalescing
            logo: data.image ?? '/placeholder-logo.png' // Use nullish coalescing
          },
          type: validateOpportunityType(data.type === null ? undefined : data.type),
          location: data.location || 'Remote',
          remote: Boolean(data.remote),
          description: data.description || 'No description provided',
          salary: data.compensation === null ? undefined : data.compensation,
          postedDate: new Date().toISOString(),
          deadline: data.deadline === null ? undefined : data.deadline,
          status: validateOpportunityStatus(data.status === null ? undefined : data.status),
          featured: Boolean(data.featured),
          created_at: new Date().toISOString()
        };
        
        // In a real implementation, we would push to mockData.opportunities
        return Promise.resolve(mockOpp);
      }
      
      try {
        // Convert from Supabase OpportunityInput to our API's OpportunityInput format
        const opportunityData: import('../features/opportunities/api/opportunitiesApi').OpportunityInput = {
          title: data.title,
          description: data.description === undefined ? null : data.description,
          type: data.type === undefined ? null : data.type as 'job' | 'volunteer' | 'funding' | 'community',
          location: data.location === undefined ? null : data.location,
          remote: data.remote === undefined ? null : data.remote,
          compensation: data.compensation === undefined ? null : data.compensation,
          deadline: data.deadline === undefined ? null : data.deadline,
          postedBy: data.posted_by || '1',
          organization: data.organization || 'Unknown Company',
          image: data.image || '/placeholder-company.png',
          status: data.status === undefined ? null : data.status as 'draft' | 'published' | 'archived',
          featured: data.featured === undefined ? null : data.featured
        };
        
        // Call the real API
        return await opportunitiesApi.create(opportunityData) as any;
      } catch (error) {
        console.error('Error creating opportunity:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity(): UseMutationResult<FrontendOpportunity | null, Error, { id: string; data: OpportunityUpdateInput }> {
  const queryClient = useQueryClient();

  return useMutation<FrontendOpportunity | null, Error, { id: string; data: OpportunityUpdateInput }>({
    mutationFn: async ({ id, data }: { id: string; data: OpportunityUpdateInput }): Promise<FrontendOpportunity | null> => {
      if (!useSupabase) {
        const typedMockData = mockData as unknown as MockDataType;
        
        // Ensure opportunities array exists
        const opportunities = typedMockData.opportunities || [];
        const mockOppIndex = opportunities.findIndex(opp => String(opp.id) === id);
        
        if (mockOppIndex === -1) {
          return Promise.resolve(null);
        }
        
        const mockOpp = opportunities[mockOppIndex];
        
        // Helper function to validate opportunity type
        const validateOpportunityType = (type?: string): 'full-time' | 'part-time' | 'contract' | 'volunteer' => {
          if (!type) return 'full-time';
          const validTypes = ['full-time', 'part-time', 'contract', 'volunteer'];
          return validTypes.includes(type) 
            ? type as 'full-time' | 'part-time' | 'contract' | 'volunteer' 
            : 'full-time';
        };
        
        // Helper function to validate opportunity status
        const validateOpportunityStatus = (status?: string): 'draft' | 'published' | 'archived' => {
          if (!status) return 'draft';
          const validStatuses = ['draft', 'published', 'archived'];
          return validStatuses.includes(status) 
            ? status as 'draft' | 'published' | 'archived' 
            : 'draft';
        };
        
        // Update the opportunity with new data, keeping existing values where not provided
        const updatedOpp: FrontendOpportunity = {
          id: id,
          title: data.title ?? mockOpp.title ?? '',
          company: {
            id: data.posted_by ?? String(mockOpp.company?.id || '1'),
            name: data.organization ?? mockOpp.company?.name ?? 'Unknown Company',
            logo: data.image ?? mockOpp.company?.logo ?? '/placeholder-logo.png'
          },
          type: validateOpportunityType(data.type || mockOpp.type),
          location: data.location ?? mockOpp.location ?? '',
          remote: data.remote ?? (mockOpp.remoteStatus === 'Remote' || mockOpp.remoteStatus === 'Hybrid'),
          description: data.description ?? mockOpp.description ?? '',
          salary: data.compensation ?? mockOpp.salaryRange,
          postedDate: mockOpp.postedDate || new Date().toISOString(),
          deadline: data.deadline ?? mockOpp.deadline,
          status: validateOpportunityStatus(data.status || mockOpp.status),
          featured: Boolean(data.featured ?? mockOpp.featured),
          created_at: mockOpp.postedDate || new Date().toISOString()
        };
        
        // In a real implementation, we would update mockData.opportunities[mockOppIndex]
        return updatedOpp;
      }
      
      try {
        // Convert from Supabase OpportunityUpdateInput to our API's OpportunityInput format
        const opportunityData: Partial<import('../features/opportunities/api/opportunitiesApi').OpportunityInput> = {};
        
        // Only include defined properties to avoid overwriting with null/undefined
        if (data.title !== undefined) opportunityData.title = data.title;
        if (data.description !== undefined) opportunityData.description = data.description;
        if (data.type !== undefined) opportunityData.type = data.type as 'job' | 'volunteer' | 'funding' | 'community';
        if (data.location !== undefined) opportunityData.location = data.location;
        if (data.remote !== undefined) opportunityData.remote = data.remote;
        if (data.compensation !== undefined) opportunityData.compensation = data.compensation;
        if (data.deadline !== undefined) opportunityData.deadline = data.deadline;
        // Handle company information: only include if posted_by (company_id) is present
        if (data.posted_by !== undefined && data.posted_by !== null) {
          opportunityData.postedBy = String(data.posted_by);
        }
        if (data.organization !== undefined) {
          opportunityData.organization = data.organization;
        }
        if (data.image !== undefined) {
          opportunityData.image = data.image;
        }
        // Organization and image are handled above
        if (data.status !== undefined) opportunityData.status = data.status as OpportunityStatus;
        if (data.featured !== undefined) opportunityData.featured = data.featured;
        
        // Call the real API
        return await opportunitiesApi.update(id, opportunityData) as any;
      } catch (error) {
        console.error(`Error updating opportunity with id ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (_data: FrontendOpportunity | null, variables: { id: string; data: OpportunityUpdateInput }) => {
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
        const typedMockData = mockData as unknown as MockDataType;
        const opportunityIndex = typedMockData.opportunities.findIndex(opp => String(opp.id) === id);
        
        if (opportunityIndex === -1) {
          return;
        }

        // In a real implementation, we would remove the opportunity from the array
        // mockData.opportunities.splice(opportunityIndex, 1);
        return;
      }
      
      try {
        // Call the real API
        const success = await opportunitiesApi.delete(id);
        if (!success) {
          throw new Error(`Failed to delete opportunity with id ${id}`);
        }
        return;
      } catch (error) {
        console.error(`Error deleting opportunity with id ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
    },
  });
}
