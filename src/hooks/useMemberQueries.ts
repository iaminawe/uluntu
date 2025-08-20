import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { membersApi, MemberInput } from '@/features/directory/api/membersApi';
import allMockData from '../data/mock/mockData';
import { ContentStatus } from '../types/common';
import { IS_SUPABASE_ENABLED } from '@/config/env';

// Define a Member type for consistency with our UI needs
export type Member = {
  id: string;
  slug?: string; // Slug for URL generation
  name: string;
  email?: string;
  bio?: string;
  image: string;
  title: string; // Job title/role
  role?: string; // Maps to title in the API (for backwards compatibility)
  skills?: string[];
  interests?: string[];
  joinDate: string; // Standard property name for API
  joinedDate?: string; // Used in mock data
  created_at?: string;
  status: ContentStatus;
  featured?: boolean;
  location?: string;
  company?: string;
  social?: any;
  [key: string]: unknown; // Allow for additional properties
};

// Type guard to check if a value is a string
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Type guard to check if a value is an array
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Type guard to check if a value is a boolean
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// Helper function to convert between API Member and our UI Member
function adaptMember(data: unknown): Member {
  // Cast to a record to safely access properties
  const member = data as Record<string, unknown>;
  
  // Safe property access with type checking
  const adaptedMember = {
    id: isString(member.id) ? member.id : String(member.id),
    slug: isString(member.slug) ? member.slug : undefined, // Include slug field
    name: isString(member.name) ? member.name : '',
    email: isString(member.email) ? member.email : undefined,
    bio: isString(member.bio) ? member.bio : undefined,
    title: isString(member.title) ? member.title : isString(member.role) ? member.role : '',
    location: isString(member.location) ? member.location : undefined,
    company: isString(member.company) ? member.company : undefined,
    social: member.social || undefined,
    image: isString(member.image) ? member.image : 'https://via.placeholder.com/150',
    role: isString(member.title) ? member.title : 
          isString(member.role) ? member.role : undefined,
    skills: isArray(member.skills) ? 
            (member.skills as unknown[]).filter(isString) as string[] : [],
    // Support both joinDate (API) and joinedDate (mock)
    joinDate: isString(member.joinDate) ? member.joinDate :
              isString(member.joinedDate) ? member.joinedDate :
              isString(member.joined_date) ? member.joined_date : new Date().toISOString(),
    joinedDate: isString(member.joinedDate) ? member.joinedDate :
               isString(member.joined_date) ? member.joined_date :
               isString(member.joinDate) ? member.joinDate : undefined,
    created_at: isString(member.created_at) ? member.created_at : undefined,
    status: isString(member.status) ? member.status as ContentStatus : 'published' as ContentStatus,
    featured: isBoolean(member.featured) ? member.featured : undefined
  };
  
  // Add user_id if available
  if (isString(member.user_id)) {
    (adaptedMember as any).user_id = member.user_id;
  }
  
  return adaptedMember;
}

// No need for a separate function since we're now using adaptMember directly

// Configuration to switch between mock and real data
const USE_SUPABASE = IS_SUPABASE_ENABLED;

// Members hooks
// Define filter types for Members
export type MemberFilters = {
  search?: string;
  skills?: string[];
  // Add other filter properties as needed from membersApi.getMembers if they exist
};

export function useMembers(): UseQueryResult<Member[], Error> {
  return useQuery<Member[], Error>({
    queryKey: ['members', 'all', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (USE_SUPABASE) {
        const members = await membersApi.getAll();
        return members.map(m => adaptMember(m));
      } else {
        // Type assertion needed for mock data
        return allMockData.members.map(m => adaptMember(m));
      }
    },
  });
}

export function useMembersWithFilters(filters?: MemberFilters): UseQueryResult<Member[], Error> {
  return useQuery<Member[], Error>({
    queryKey: ['members', 'filters', filters, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (USE_SUPABASE) {
        const members = await membersApi.getAll(filters);
        return members.map(m => adaptMember(m));
      } else {
        // Filter mock data
        let filteredMembers = [...allMockData.members];
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredMembers = filteredMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            (member.bio && member.bio.toLowerCase().includes(searchTerm))
          );
        }
        if (filters?.skills && filters.skills.length > 0) {
          filteredMembers = filteredMembers.filter(member => 
            member.skills && filters.skills?.some(skill => member.skills?.includes(skill))
          );
        }
        return filteredMembers.map(m => adaptMember(m));
      }
    },
  });
}

export function useMemberById(id?: string): UseQueryResult<Member | null, Error> {
  return useQuery<Member | null, Error>({
    queryKey: ['members', id, USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      
      if (USE_SUPABASE) {
        try {
          const member = await membersApi.getById(id);
          return member ? adaptMember(member) : null;
        } catch (error) {
          console.error(`Error fetching member with ID ${id}:`, error);
          throw error;
        }
      } else {
        // Get from mock data
        const member = allMockData.members.find(m => String(m.id) === id);
        return member ? adaptMember(member) : null;
      }
    },
    enabled: !!id
  });
}

export function useCreateMember(): UseMutationResult<
  Member | null,
  Error,
  MemberInput // API expects MemberInput
> {
  const queryClient = useQueryClient();
  
  // Create a properly typed mutation for both mock and Supabase
  return useMutation<Member | null, Error, MemberInput>({
    mutationFn: async (data: MemberInput): Promise<Member | null> => {
      if (USE_SUPABASE) {
        // Use the actual API
        const createdMember = await membersApi.create(data);
        return createdMember ? adaptMember(createdMember) : null;
      } else {
        console.log('Mock create member:', data);
        
        // Create a new member with the provided data
        const newMember = {
          id: Date.now().toString(),
          name: data.name || '',
          email: `${(data.name || '').toLowerCase().replace(/\s+/g, '.')}@example.com`,
          bio: data.bio || '',
          image: data.image || '',
          title: data.title || '',
          // Use title as role for UI compatibility
          role: data.title || '',
          skills: [],
          joinDate: new Date().toISOString(),
          joinedDate: new Date().toISOString(), // Keep both for compatibility
          created_at: new Date().toISOString(),
          status: data.status || 'published' as ContentStatus,
          featured: data.featured || false
        };
        
        // Add to mock data (this is just for simulation)
        allMockData.members.unshift(newMember);
        
        return adaptMember(newMember);
      }
    },
    onSuccess: () => {
      // Invalidate both mock and Supabase queries to be safe
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });
}

export function useUpdateMember(): UseMutationResult<
  Member | null,
  Error,
  { id: string; data: Partial<MemberInput> }
> {
  const queryClient = useQueryClient();

  // Create a properly typed mutation for both mock and Supabase
  return useMutation<Member | null, Error, { id: string; data: Partial<MemberInput> }>({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MemberInput> }): Promise<Member | null> => {
      if (USE_SUPABASE) {
        // Use the actual API
        const updatedMember = await membersApi.update(id, data);
        return updatedMember ? adaptMember(updatedMember) : null;
      } else {
        console.log('Mock update member:', { id, data });
        
        // Find the member to update
        const memberIndex = allMockData.members.findIndex(m => String(m.id) === id);
        if (memberIndex === -1) {
          console.error(`Member with id ${id} not found`);
          return null;
        }
        
        // Update the member
        const originalMember = allMockData.members[memberIndex];
        const updatedMember = {
          ...originalMember,
          name: data.name || originalMember.name,
          bio: data.bio !== undefined ? data.bio : originalMember.bio,
          image: data.image !== undefined ? data.image : originalMember.image,
          title: data.title !== undefined ? data.title : originalMember.title,
          status: data.status !== undefined ? data.status : originalMember.status,
          featured: data.featured !== undefined ? data.featured : originalMember.featured,
        };
        
        // Update in the mock data
        allMockData.members[memberIndex] = updatedMember;
        
        return adaptMember(updatedMember);
      }
    },
    onSuccess: (_data, { id }) => {
      // Invalidate both mock and Supabase queries to be safe
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', id] });
    }
  });
}

export function useDeleteMember(): UseMutationResult<
  boolean, // API returns boolean
  Error,
  string // Variables type is the ID (string)
> {
  const queryClient = useQueryClient();

  // Create a properly typed mutation for both mock and Supabase
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string): Promise<boolean> => {
      if (USE_SUPABASE) {
        // Use the actual API
        return await membersApi.delete(id);
      } else {
        console.log('Mock delete member:', id);
        
        // Find the member to delete
        const memberIndex = allMockData.members.findIndex(m => String(m.id) === id);
        if (memberIndex === -1) {
          console.warn(`Member with id ${id} not found for deletion`);
          return false;
        }
        
        // Remove from mock data
        allMockData.members.splice(memberIndex, 1);
        return true;
      }
    },
    onSuccess: (_, id) => {
      // Invalidate both mock and Supabase queries to be safe
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', id] });
    }
  });
}
