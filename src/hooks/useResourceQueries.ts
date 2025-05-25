import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import type { Database } from '@/types/supabase'; // Or '../types/supabase' if no path alias
import type { Resource as FrontendResource, EntityStatus } from '../types'; // Import FrontendResource and EntityStatus
import type { ResourceInput } from '../api/resourcesApi'; // Import ResourceInput

// Base Types from Supabase schema
export type DBResource = Database['public']['Tables']['resources']['Row']; // This is DB-style Resource. DBResource['type'] and DBResource['status'] are likely string.
// Group type might be needed for useGroupResources
export type Group = Database['public']['Tables']['groups']['Row'];


// API clients
import { resourcesApi } from '../api/resourcesApi';

// Mock data
import allMockData from '../data/mock/mockData';

// Configuration for using Supabase or mock data
const USE_SUPABASE = process.env.REACT_APP_USE_SUPABASE === 'true' || true; // Default to true if not set

// Helper to convert FrontendResource to DBResource for mock returns
const frontendToDbResource = (fe: FrontendResource): DBResource => {
  const dbResource: Partial<DBResource> = {
    id: String(fe.id),
    created_at: fe.dateAdded,
    title: fe.title,
    description: fe.description,
    type: fe.type,
    url: fe.url,
    image: fe.image ?? null,
    status: fe.status,
    featured: fe.featured ?? false,
    contributor_id: String(fe.contributor.id),
    group_id: fe.groupId ?? null,
  };
  // This cast assumes that the manually constructed object is compatible enough.
  // For a true DBResource, all non-nullable fields from the Supabase schema must be present.
  return dbResource as DBResource;
};

export function useGroupResources(groupId: number | string | undefined): UseQueryResult<DBResource[], Error> {
  const numericId = typeof groupId === 'string' ? parseInt(groupId, 10) : (typeof groupId === 'number' ? groupId : undefined);
  const validNumericId = numericId !== undefined && !isNaN(numericId) ? numericId : undefined;

  return useQuery<DBResource[], Error>({
    queryKey: ['groupResources', validNumericId, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<DBResource[]> => {
      if (validNumericId === undefined) {
        return [];
      }
      if (!USE_SUPABASE) {
        // Find resources linked to this group from mockResourcesArray
        const groupFrontendResources = allMockData.resources.filter((r: FrontendResource) => String(r.groupId) === String(validNumericId));
        return groupFrontendResources.map(r => frontendToDbResource(r));
      }
      // Actual Supabase call (placeholder)
      console.warn(`Supabase fetch for groupResources with groupId: ${validNumericId} is not implemented. Returning empty array.`);
      // Example: const data = await resourcesApi.getByGroupId(validNumericId); return data || [];
      return [];
    },
    enabled: validNumericId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useResources(): UseQueryResult<DBResource[], Error> {
  return useQuery<DBResource[], Error>({
    queryKey: ['resources', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<DBResource[]> => {
      if (!USE_SUPABASE) return allMockData.resources.map(r => frontendToDbResource(r));
      return resourcesApi.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useResourcesWithFilters(filters?: { search?: string; types?: string[]; }): UseQueryResult<DBResource[], Error> {
  return useQuery<DBResource[], Error>({
    queryKey: ['resources', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<DBResource[]> => {
      if (!USE_SUPABASE) {
        let filteredMockResources = [...allMockData.resources];
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredMockResources = filteredMockResources.filter((r: FrontendResource) =>
            (r.title?.toLowerCase() || '').includes(searchTerm) ||
            (r.description?.toLowerCase() || '').includes(searchTerm)
          );
        }
        if (filters?.types && filters.types.length > 0) {
          filteredMockResources = filteredMockResources.filter((r: FrontendResource) => r.type && filters.types?.includes(r.type));
        }
        return filteredMockResources.map(r => frontendToDbResource(r));
      }
      return resourcesApi.getAll(filters); // Assuming resourcesApi.getAll supports these filters
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useResource(id: number | string | undefined): UseQueryResult<DBResource | undefined, Error> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : (typeof id === 'number' ? id : undefined);
  const validNumericId = numericId !== undefined && !isNaN(numericId) ? numericId : undefined;

  return useQuery<DBResource | undefined, Error>({
    queryKey: ['resource', validNumericId, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<DBResource | undefined> => {
      if (validNumericId === undefined) return undefined;
      if (!USE_SUPABASE) {
        const resource = allMockData.resources.find((r: FrontendResource) => r.id === validNumericId);
        return resource ? frontendToDbResource(resource) : undefined;
      }
      return resourcesApi.getById(String(validNumericId));
    },
    enabled: validNumericId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateResource(): UseMutationResult<FrontendResource | null, Error, ResourceInput> {
  const queryClient = useQueryClient();

  return useMutation<FrontendResource | null, Error, ResourceInput>({
    mutationFn: async (resourceData: ResourceInput): Promise<FrontendResource | null> => {
      if (!USE_SUPABASE) {
        console.warn('Mock: Creating resource with data:', resourceData);
        const newId = allMockData.resources.length > 0 ? Math.max(...allMockData.resources.map((r: FrontendResource) => r.id)) + 1 : 1;

        const placeholderFrontendResource: FrontendResource = {
          id: newId,
          title: resourceData.title,
          description: resourceData.description,
          type: resourceData.type as FrontendResource['type'], // Ensure type compatibility
          url: resourceData.url,
          image: resourceData.image ?? undefined,
          dateAdded: new Date().toISOString(),
          contributor: {
            id: parseInt(resourceData.contributorId, 10),
            name: allMockData.members.find(m => m.id === parseInt(resourceData.contributorId, 10))?.name || 'Unknown Contributor',
          },
          status: (resourceData.status ?? 'pending') as EntityStatus,
          featured: resourceData.featured ?? false,
          groupId: resourceData.groupId ?? undefined,
        };
        allMockData.resources.push(placeholderFrontendResource);

        // The mutationFn now expects a FrontendResource | null
        return Promise.resolve(placeholderFrontendResource);
      }
      // Prepare payload for API: map contributor_id to contributorId (camelCase)
      // This is necessary as ResourceInput type expects contributorId (camelCase)
      const apiPayload: ResourceInput = {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        url: resourceData.url,
        image: resourceData.image,
        status: resourceData.status,
        featured: resourceData.featured,
        contributorId: resourceData.contributorId,
        groupId: resourceData.groupId,
        tags: resourceData.tags,
      };

      const newResource = await resourcesApi.create(apiPayload);
      if (!newResource) {
        throw new Error('Failed to create resource');
      }
      return newResource;
    },
    onSuccess: (data) => { // data is FrontendResource | null
      const queryKeySuffix = USE_SUPABASE ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: ['resources', queryKeySuffix] });
      queryClient.invalidateQueries({ queryKey: ['groupResources'] }); // Invalidate all group resources queries
      if (data) { // data can be null if API returns null
        queryClient.setQueryData(['resource', data.id, queryKeySuffix], data);
      }
    },
  });
}

export function useUpdateResource(): UseMutationResult<FrontendResource | null, Error, { id: string; data: Partial<ResourceInput> }> {
  const queryClient = useQueryClient();

  return useMutation<FrontendResource | null, Error, { id: string; data: Partial<ResourceInput> }>({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ResourceInput> }): Promise<FrontendResource | null> => {
      if (!USE_SUPABASE) {
        console.warn(`Mock: Updating resource ${id} with data:`, data);
        const resourceIndex = allMockData.resources.findIndex((r: FrontendResource) => String(r.id) === id);
        if (resourceIndex === -1) {
          throw new Error(`Mock: Resource with id ${id} not found for update.`);
        }
        const existingResource = allMockData.resources[resourceIndex] as FrontendResource;
        const updatedFrontendResource: FrontendResource = {
          ...existingResource, // Start with existing fields
          id: existingResource.id, // Ensure id is not overwritten by data and remains number
          title: data.title ?? existingResource.title,
          description: data.description ?? existingResource.description,
          type: (data.type ?? existingResource.type) as FrontendResource['type'],
          url: data.url ?? existingResource.url,
          image: data.image === null ? undefined : (data.image ?? existingResource.image),
          status: (data.status ?? existingResource.status) as EntityStatus,
          featured: data.featured === null ? undefined : (data.featured ?? existingResource.featured),
          groupId: data.groupId === null ? undefined : (data.groupId ?? existingResource.groupId),
          // dateAdded remains from existingResource
        };

        // Handle contributor update separately if contributorId is in data
        if (data.contributorId) {
          updatedFrontendResource.contributor = {
            id: parseInt(data.contributorId, 10),
            name: allMockData.members.find(m => m.id === parseInt(data.contributorId as string, 10))?.name || existingResource.contributor.name || 'Unknown Contributor',
          };
        }
        // Note: 'tags' from ResourceInput are not directly on FrontendResource, handled separately if needed.
        allMockData.resources[resourceIndex] = updatedFrontendResource; // Mutates the imported array
        return Promise.resolve(updatedFrontendResource);
      }
      const updatedResource = await resourcesApi.update(id, data);
      if (!updatedResource) throw new Error(`Failed to update resource ${id}`);
      return updatedResource;
    },
    onSuccess: (data, { id }) => { // data is FrontendResource | null
      const queryKeySuffix = USE_SUPABASE ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: ['resources', queryKeySuffix] });
      queryClient.invalidateQueries({ queryKey: ['groupResources'] }); // Invalidate all group resources queries
      if (data) { // data can be null
        queryClient.setQueryData(['resource', id, queryKeySuffix], data);
      }
    },
  });
}

export function useDeleteResource(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string): Promise<void> => {
      if (!USE_SUPABASE) {
        console.warn('Mock: Deleting resource with id:', id);
        const index = allMockData.resources.findIndex((r: FrontendResource) => String(r.id) === id);
        if (index > -1) {
          allMockData.resources.splice(index, 1); // Mutates the imported array
        } else {
          console.warn(`Mock: Resource with id ${id} not found for deletion.`);
        }
        return Promise.resolve();
      }
      await resourcesApi.delete(id);
    },
    onSuccess: (_data, id) => {
      const queryKeySuffix = USE_SUPABASE ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: ['resources', queryKeySuffix] });
      queryClient.invalidateQueries({ queryKey: ['groupResources'] }); // Invalidate all group resources queries
      queryClient.removeQueries({ queryKey: ['resource', id, queryKeySuffix], exact: true });
    },
  });
}
