import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import type { Database } from '../types/supabase'; // Use relative path instead of path alias
import type { Resource as FrontendResource, ContentStatus } from '../types'; // Import FrontendResource and ContentStatus
import { IS_SUPABASE_ENABLED } from '@/config/env';

// Define ResourceInput type for create/update operations
type ResourceInput = {
  title: string;
  description: string;
  type?: string;
  url: string;
  image?: string | null;
  status?: string;
  featured?: boolean | null;
  contributorId?: string;
  groupId?: string | null;
  tags?: string[];
};

// Define ResourceType for type checking
type ResourceType = 'guide' | 'tool' | 'article' | 'video' | 'document' | 'link' | 'gallery';

// Base Types from Supabase schema
export type DBResource = Database['public']['Tables']['resources']['Row']; // This is DB-style Resource with string type/status
// Ensure we have a Group type for useGroupResources
export type Group = Database['public']['Tables']['groups']['Row'];
// Export a member type for contributor lookups
export type Member = Database['public']['Tables']['members']['Row'];

// Define mock data structure for type checking
type MockData = {
  resources: ResourceLike[];
  [key: string]: unknown;
};

// API clients
import { resourcesApi } from '@/features/resources/api/resourcesApi';

// Mock data
import mockDataImport from '../data/mock/mockData';

// Type cast mock data to ensure proper type checking
const allMockData = mockDataImport as unknown as MockData;

// Helper to convert a value to undefined if it's null
const nullToUndefined = <T>(val: T | null): T | undefined => {
  return val === null ? undefined : val;
};

// Configuration for using Supabase or mock data
const USE_SUPABASE = IS_SUPABASE_ENABLED; // Consistent with other query hooks

// Define a type that can handle both frontend and mock data structures
type ResourceLike = {
  id: string | number;
  title: string;
  description: string;
  type: string;
  url: string;
  image?: string | null;
  status?: string;
  featured?: boolean | null;
  contributor?: { 
    id: string | number; 
    name?: string | null;
    [key: string]: unknown; // Allow additional properties
  } | null;
  name?: string;
  contributor_id?: string | number;
  groupId?: string | number | null;
  group_id?: string | number | null; // For DB-style resources
  dateAdded?: string; // For frontend-style resources
  tags?: string[] | null; // For mock data
  created_at?: string | null; // For DB-style resources
  updated_at?: string | null; // For DB-style resources
  [key: string]: unknown; // Allow additional properties for flexibility with mock data
};

// Helper to convert FrontendResource to DBResource for mock returns
const frontendToDbResource = (fe: ResourceLike): DBResource => {
  // Handle various date fields from different data sources
  const dateField = fe.dateAdded || fe.created_at || new Date().toISOString();
  
  // Handle group_id from different sources
  const groupId = fe.groupId !== undefined ? fe.groupId : fe.group_id;
  
  // Handle contributor ID from different sources
  let contributorId: string;
  if (fe.contributor_id !== undefined) {
    contributorId = String(fe.contributor_id);
  } else if (fe.contributor && fe.contributor.id !== undefined) {
    contributorId = String(fe.contributor.id);
  } else {
    contributorId = '1'; // Default to first user if missing
  }
  
  // Handle tags, ensuring they're always an array
  const tags = Array.isArray(fe.tags) ? fe.tags : [];
  
  // Create a properly formatted resource object for the API
  // Rather than using an unsafe cast, create the object with the known fields
  // that exist on DBResource
  return {
    id: String(fe.id),
    created_at: dateField,
    title: fe.title || '',
    description: fe.description || '',
    type: fe.type || '',
    url: fe.url || '',
    image: fe.image ?? null,
    status: fe.status || 'published',
    featured: fe.featured ?? false,
    contributor_id: contributorId,
    group_id: groupId ? String(groupId) : null,
    // Include any other required fields with safe defaults
    updated_at: fe.updated_at || dateField,
    tags: tags
  } as unknown as DBResource; // Cast through unknown to avoid type mismatch issues
};

// Helper to validate resource type
function isValidResourceType(type: string): type is ResourceType {
  const validTypes: ResourceType[] = ['guide', 'tool', 'article', 'video', 'document', 'link', 'gallery'];
  return validTypes.includes(type as ResourceType);
}

// Helper function to validate and convert resource type
function validateResourceType(type: string | null | undefined): ResourceType {
  if (!type) return 'link'; // Default if no type provided
  return isValidResourceType(type) ? type : 'link';
}

// Helper to convert DBResource to FrontendResource
// Helper function to convert a database resource to a frontend resource
export const adaptResourceFromDatabase = (db: DBResource): FrontendResource => {
  // Validate and set resource type for FrontendResource
  const resourceType = validateResourceType(db.type);

  // Validate and set resource status for FrontendResource (via BaseEntity)
  const validFeStatuses: ContentStatus[] = ['draft', 'published', 'archived'];
  let feResourceStatus: ContentStatus = 'draft'; // Default
  if (db.status && validFeStatuses.includes(db.status as ContentStatus)) {
    feResourceStatus = db.status as ContentStatus;
  } else {
    console.warn(`DB to FE: Invalid resource status '${db.status}', defaulting to '${feResourceStatus}'.`);
  }

  // Create contributor object with required fields only
  // Always provide a contributor object to satisfy type requirements
  const contributor = db.contributor_id ? { id: db.contributor_id, name: '' } : { id: '', name: '' };
  
  // Handle tags - ensure we always have an array, even if it's empty
  // Use a type assertion with a more specific type than 'any'
  const extendedDb = db as DBResource & { tags?: string[] | null };
  const tags = Array.isArray(extendedDb.tags) ? extendedDb.tags : [];

  // Prepare the resource object
  return {
    id: db.id,
    title: db.title || '',
    description: db.description || '',
    type: resourceType,
    url: db.url || '',
    image: db.image || '',
    status: feResourceStatus,
    featured: db.featured || false,
    contributor: contributor,
    created_at: db.created_at || new Date().toISOString(),
    dateAdded: db.created_at || new Date().toISOString(), // Copy created_at to dateAdded for FE compatibility
    tags: tags,
    groupId: db.group_id === null ? undefined : db.group_id,
  };
};

export function useGroupResources(groupId: string | number | undefined): UseQueryResult<FrontendResource[], Error> {
  const queryKeySuffix = USE_SUPABASE ? 'supabase' : 'mock';
  
  return useQuery<FrontendResource[], Error>({
    queryKey: ['groupResources', groupId?.toString(), queryKeySuffix],
    queryFn: async (): Promise<FrontendResource[]> => {
      if (!groupId) {
        return [];
      }

      const stringGroupId = groupId.toString();

      if (!USE_SUPABASE) {
        // For mock data, filter the existing resources by group_id
        try {
          // Filter resources based on group_id
          const filteredResources = allMockData.resources.filter((resource: ResourceLike) => {
            // Check both groupId and group_id fields for compatibility
            const resourceGroupId = resource.groupId !== undefined ? resource.groupId : resource.group_id;
            return resourceGroupId !== undefined && resourceGroupId !== null && 
                   resourceGroupId.toString() === stringGroupId;
          });
          
          // Convert to FrontendResource
          return filteredResources.map((resource: ResourceLike) => {
            const dbResource = frontendToDbResource(resource);
            return adaptResourceFromDatabase(dbResource);
          });
        } catch (error) {
          console.error('Error fetching group resources from mock data:', error);
          return [];
        }
      }

      try {
        // Implement actual API call for group resources when needed
        // We need to handle the group filtering in memory since the API doesn't directly support it
        const resources = await resourcesApi.getAll();
        // Filter resources that match the group ID
        const filteredResources = resources.filter(resource => 
          resource.groupId && resource.groupId === stringGroupId
        );
        return filteredResources || [];
      } catch (error) {
        console.error(`Error fetching resources for group ${stringGroupId}:`, error);
        return [];
      }
    },
    enabled: !!groupId,
  });
}

export function useResources(): UseQueryResult<FrontendResource[], Error> {
  return useQuery<FrontendResource[], Error>({
    queryKey: ['resources', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<FrontendResource[]> => {
      if (!USE_SUPABASE) {
        return allMockData.resources.map(r => adaptResourceFromDatabase(frontendToDbResource(r)));
      }
      return await resourcesApi.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });
}

export function useResourcesWithFilters(filters?: { search?: string; types?: string[]; }): UseQueryResult<FrontendResource[], Error> {
  return useQuery<FrontendResource[], Error>({
    queryKey: ['resources', 'filters', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<FrontendResource[]> => {
      if (!USE_SUPABASE) {
        // Filter mock data based on search term and types
        let filteredResources = [...allMockData.resources];
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredResources = filteredResources.filter((resource: ResourceLike) => 
            resource.title?.toLowerCase().includes(searchLower) || 
            resource.description?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters?.types && filters.types.length > 0) {
          filteredResources = filteredResources.filter((resource: ResourceLike) => 
            resource.type && filters.types?.includes(resource.type)
          );
        }
        
        return filteredResources.map((resource: ResourceLike) => {
          const dbResource = frontendToDbResource(resource);
          return adaptResourceFromDatabase(dbResource);
        });
      }
      
      return resourcesApi.getAll(filters);
    },
  });
}

// Updated to use string IDs consistently throughout the application
export function useResource(id: string | undefined): UseQueryResult<FrontendResource | undefined, Error> {
  const queryKeySuffix = USE_SUPABASE ? 'supabase' : 'mock';
  
  return useQuery<FrontendResource | undefined, Error>({
    queryKey: ['resource', id?.toString(), queryKeySuffix],
    queryFn: async (): Promise<FrontendResource | undefined> => {
      if (!id) {
        return undefined;
      }
      
      // Convert id to string for API calls and comparisons
      const resourceId = id.toString();
      
      if (!USE_SUPABASE) {
        // Find resource in mock data
        try {
          const resource = allMockData.resources.find((r: ResourceLike) => {
            return r.id !== undefined && r.id.toString() === resourceId;
          });
          
          if (!resource) {
            console.warn(`Resource with ID ${resourceId} not found in mock data.`);
            return undefined;
          }
          
          const dbResource = frontendToDbResource(resource);
          return adaptResourceFromDatabase(dbResource);
        } catch (error) {
          console.error(`Error fetching resource ${resourceId} from mock data:`, error);
          return undefined;
        }
      }
      
      try {
        const resource = await resourcesApi.getById(resourceId);
        return resource || undefined;
      } catch (error) {
        console.error(`Error fetching resource ${resourceId}:`, error);
        return undefined;
      }
    },
    enabled: !!id,
  });
}

export function useCreateResource(): UseMutationResult<FrontendResource | null, Error, ResourceInput> {
  const queryClient = useQueryClient();

  return useMutation<FrontendResource | null, Error, ResourceInput>({
    mutationFn: async (resourceData: ResourceInput): Promise<FrontendResource | null> => {
      // --- Common validations and preparations ---
      // Validate and set the resource type
      const originalType = resourceData.type;
      resourceData.type = validateResourceType(resourceData.type);
      
      // Log warning if type was changed
      if (originalType && originalType !== resourceData.type) {
        console.warn(`Invalid resource type: ${originalType}. Defaulting to '${resourceData.type}'.`);
      }
      
      // Determine content status, defaulting to 'draft' if invalid
      const validContentStatuses: ContentStatus[] = ['draft', 'published', 'archived'];
      let feContentStatus: ContentStatus = 'draft';
      if (resourceData.status && validContentStatuses.includes(resourceData.status as ContentStatus)) {
        feContentStatus = resourceData.status as ContentStatus;
      }
      
      // Generate contributor information
      const feContributorId = resourceData.contributorId || '1'; // Default to first user if not provided
      
      // --- Mock Data Path (useCreateResource) ---
      if (!USE_SUPABASE) {
        // Generate new ID
        const newId = String(Date.now());
        
        // Create a resource with required fields
        // Validate the resource type using our defined validator
        const validatedResourceType = validateResourceType(resourceData.type);
        
        const resourceWithRequiredFields: FrontendResource = {
          id: newId,
          title: resourceData.title || '',
          description: resourceData.description || '',
          type: validatedResourceType,
          url: resourceData.url || '',
          image: nullToUndefined(resourceData.image) || '',
          status: feContentStatus,
          featured: resourceData.featured ?? false,
          contributor: {
            id: feContributorId,
            name: ''
          },
          tags: resourceData.tags || [],
          // Ensure all required fields are present
          created_at: new Date().toISOString(),
          dateAdded: new Date().toISOString(), // Required field for FrontendResource
          groupId: nullToUndefined(resourceData.groupId)
        };
        
        // The resource type is already validated above
        
        // Add the new resource to mock data for future queries
        // Create a version of the resource that matches the mock data structure
        // For mock data we need to convert the strictly-typed resource to a compatible format
        // Use type assertion since we know the structure is compatible with ResourceLike
        const mockResource: Record<string, unknown> = {
          id: resourceWithRequiredFields.id,
          title: resourceWithRequiredFields.title,
          description: resourceWithRequiredFields.description,
          // Convert enum types to string for mock data compatibility
          type: String(resourceWithRequiredFields.type),
          url: resourceWithRequiredFields.url,
          image: resourceWithRequiredFields.image,
          status: String(resourceWithRequiredFields.status),
          featured: resourceWithRequiredFields.featured,
          contributor_id: feContributorId,
          contributor: resourceWithRequiredFields.contributor,
          created_at: resourceWithRequiredFields.created_at,
          dateAdded: resourceWithRequiredFields.dateAdded,
          tags: resourceWithRequiredFields.tags,
          // Format conversions for mock data compatibility
          group_id: resourceWithRequiredFields.groupId
        };
        
        // Add to mock data array
        // TypeScript doesn't understand that our mock data structure is different from our frontend types
        // Use a more specific casting to avoid ESLint warnings about any
        (allMockData.resources as unknown as Array<Record<string, unknown>>).push(mockResource);
        
        return Promise.resolve(resourceWithRequiredFields);
      }
      
      // --- Supabase Path ---
      try {
        // Validate resource type for API call
        const validatedResourceType = validateResourceType(resourceData.type);
        
        // Prepare the resource data for the API
        const apiResourceData = {
          title: resourceData.title || '',
          description: resourceData.description || '',
          type: validatedResourceType, // Use validated ResourceType
          url: resourceData.url || '',
          status: feContentStatus,
          featured: resourceData.featured ?? false,
          image: resourceData.image === null ? undefined : resourceData.image,
          contributorId: feContributorId,
          groupId: resourceData.groupId === null ? undefined : resourceData.groupId,
          tags: resourceData.tags || []
        };
        
        // Call the actual API
        const result = await resourcesApi.create(apiResourceData);
        return result;
      } catch (error) {
        console.error('Error creating resource:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      const queryKeySuffix = USE_SUPABASE ? 'supabase' : 'mock';
      // Invalidate general lists
      queryClient.invalidateQueries({ queryKey: ['resources', queryKeySuffix] });
      if (data?.groupId) {
        // If the resource is associated with a group, invalidate that group's resources
        queryClient.invalidateQueries({ 
          queryKey: ['groupResources', String(data.groupId), queryKeySuffix] 
        });
      }
    },
  });
}

// Updated to use string IDs consistently throughout the application
export function useUpdateResource(): UseMutationResult<FrontendResource | null, Error, { id: string; } & Partial<ResourceInput>> {
  const queryClient = useQueryClient();

  return useMutation<FrontendResource | null, Error, { id: string; } & Partial<ResourceInput>>({
    mutationFn: async ({ id, ...data }: { id: string; } & Partial<ResourceInput>): Promise<FrontendResource | null> => {
      // Common validation setup
      const stringId = String(id);
      const validStatuses = ['draft', 'published', 'archived'];
      
      // --- Mock Path ---
      if (!USE_SUPABASE) {
        console.warn(`Mock: Updating resource ${stringId} with data:`, data);
        const resourceIndex = allMockData.resources.findIndex((r: ResourceLike) => String(r.id) === stringId);
        
        if (resourceIndex === -1) {
          console.warn(`Resource with ID ${stringId} not found for update.`);
          return null;
        }
        
        const currentResource = allMockData.resources[resourceIndex];
        
        // Get date-related fields from current resource
        const feDateAdded = currentResource.dateAdded || currentResource.created_at || new Date().toISOString();
        
        // Get contributor data
        const feContributorId = data.contributorId || 
          (currentResource.contributor?.id ? String(currentResource.contributor.id) : null) || 
          (currentResource as unknown as Record<string, unknown>).contributor_id as string || '1';
        const feContributorName = currentResource.contributor?.name || '';
        
        // Determine resource type - use validateResourceType helper for consistency
        const incomingType = data.type ?? currentResource.type;
        const validatedResourceType = validateResourceType(incomingType);
        
        // Determine content status
        let feContentStatus: ContentStatus = 'draft';
        if (data.status && validStatuses.includes(data.status as ContentStatus)) {
          feContentStatus = data.status as ContentStatus;
        } else if (currentResource.status && validStatuses.includes(currentResource.status as ContentStatus)) {
          feContentStatus = currentResource.status as ContentStatus;
        } else if (data.status) {
          console.warn(`Mock Update: Invalid resource status '${data.status}', defaulting to '${feContentStatus}'.`);
        }

        // Create the updated resource with proper type handling
        const updatedFrontendResource: FrontendResource = {
          id: stringId,
          title: data.title ?? (currentResource.title || ''),
          description: data.description ?? (currentResource.description || ''),
          type: validatedResourceType, // Use the validated resource type
          url: data.url ?? (currentResource.url || ''),
          // Handle image null/undefined correctly
          image: data.image !== undefined ? 
                 (data.image === null ? '' : data.image) : // Convert null to empty string
                 (currentResource.image || ''),
          dateAdded: feDateAdded, // Required for FrontendResource
          created_at: feDateAdded,
          status: feContentStatus,
          contributor: { 
            id: feContributorId, 
            name: feContributorName 
          },
          // Handle boolean featured field correctly
          featured: typeof data.featured === 'boolean' ? 
                    data.featured : 
                    Boolean(currentResource.featured), // Convert to boolean
          tags: data.tags ?? (Array.isArray(currentResource.tags) ? currentResource.tags : []),
          // Handle groupId null/undefined correctly
          groupId: data.groupId !== undefined ? 
                   (data.groupId === null ? undefined : String(data.groupId)) : // Ensure string type
                   (currentResource.groupId ? String(currentResource.groupId) : undefined)
        };
        
        // Update the mock data array
        // Create a mock-compatible version of the resource
        const mockUpdatedResource: Record<string, unknown> = {
          ...updatedFrontendResource,
          // Add any additional fields needed for mock data compatibility
          contributor_id: feContributorId,
          // Convert strict enum types to string type for mock data compatibility
          type: String(updatedFrontendResource.type),
          status: String(updatedFrontendResource.status),
          group_id: updatedFrontendResource.groupId
        };
        
        // Use a more specific type assertion to bypass TypeScript's type checking for mock data
        (allMockData.resources as Array<Record<string, unknown>>)[resourceIndex] = mockUpdatedResource;
        
        return Promise.resolve(updatedFrontendResource);
      }

      // --- Supabase Path ---
      try {
        // Validate the resource type if provided
        let validatedType: ResourceType | undefined = undefined;
        if (data.type) {
          validatedType = validateResourceType(data.type);
        }
        
        // Validate status if provided
        let validatedStatus: ContentStatus | undefined = undefined;
        if (data.status && validStatuses.includes(data.status as ContentStatus)) {
          validatedStatus = data.status as ContentStatus;
        }
        
        // Create API-compatible resource data object
        const safeResourceData = {
          title: data.title,
          description: data.description,
          type: validatedType,
          url: data.url,
          status: validatedStatus,
          featured: data.featured,
          // Handle null values by converting to undefined
          image: data.image === null ? undefined : data.image,
          contributorId: data.contributorId,
          groupId: data.groupId === null ? undefined : data.groupId,
          tags: data.tags
        };
        
        const updatedResource = await resourcesApi.update(stringId, safeResourceData);
        return updatedResource || null;
      } catch (error) {
        console.error(`Error updating resource ${stringId}:`, error);
        throw error;
      }
    },
    onSuccess: (data: FrontendResource | null, variables: { id: string; } & Partial<ResourceInput>) => {
      const queryKeySuffix = USE_SUPABASE ? 'supabase' : 'mock';
      // Invalidate general lists
      queryClient.invalidateQueries({ queryKey: ['resources', queryKeySuffix] });
      queryClient.invalidateQueries({ queryKey: ['groupResources'] }); // This might need a specific group ID if applicable
      
      // Invalidate and update the specific resource query
      const resourceIdString = String(variables.id);
      queryClient.invalidateQueries({ queryKey: ['resource', resourceIdString, queryKeySuffix] });
      if (data) {
        queryClient.setQueryData(['resource', resourceIdString, queryKeySuffix], data);
      }
    },
    onError: (error: Error, variables: { id: string; } & Partial<ResourceInput>) => {
      console.error(`Error updating resource ${variables.id}:`, error);
      // Optionally: Add user notification logic here (e.g., toast message)
    },
  });
}

export function useDeleteResource(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string): Promise<void> => {
      if (!USE_SUPABASE) {
        console.warn('Mock: Deleting resource with id:', id);
        // Use ResourceLike type to handle both frontend and mock data structures
        const index = allMockData.resources.findIndex((r: ResourceLike) => String(r.id) === id);
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
