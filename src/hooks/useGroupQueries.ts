import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { type Database } from '../types/supabase'; // Fixed path
import { groupsApi, type GroupInput } from '../api/groupsApi';

// Environment variable to switch between Supabase and mock data
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

// Mock data and types
import mockData from '../data/mock/mockData';
// Import types from mockData
type Group = typeof mockData.groups[0];
// Define GroupMember type since it's not directly exported from mockData
interface GroupMember {
  id: string | number;
  name: string;
  role?: string;
  joinDate?: string;
}

export type MockGroupMemberType = GroupMember;
export type MockGroupType = Group;

// Event Types (related to groups)
export type GroupEvent = Database['public']['Tables']['events']['Row'];
export type EventInput = Database['public']['Tables']['events']['Insert'];

// Helper type for mock query results
interface MockQueryResult<TData> {
  data: TData;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

// Interface for the mockQueries object structure
interface MockQueries {
  useGroups: () => MockQueryResult<Group[]>;
  useGroupsWithFilters: (filters?: GroupFilters) => MockQueryResult<Group[]>;
  useGroup: (id?: string) => MockQueryResult<Group | null>;
}

// TODO: Define or import mockQueries. This is a placeholder object.
const mockQueries: MockQueries = {
  useGroups: () => ({ data: mockData.groups, isLoading: false, error: null, isSuccess: true }),
  useGroupsWithFilters: (filters?: GroupFilters) => {
    let filteredData = mockData.groups;
    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(group =>
          group.name.toLowerCase().includes(searchTerm) ||
          (group.description && group.description.toLowerCase().includes(searchTerm))
        );
      }
      if (filters.visibility && filters.visibility.length > 0) {
        filteredData = filteredData.filter(group => filters.visibility!.includes(group.visibility as 'open' | 'closed' | 'secret'));
      }
    }
    return { data: filteredData, isLoading: false, error: null, isSuccess: true };
  },
  useGroup: (id?: string) => ({ data: mockData.groups.find((group: Group) => group.id.toString() === id) || null, isLoading: false, error: null, isSuccess: true }),
};

// useGroupEvents Hook
export function useGroupEvents(groupId: number | string | undefined): UseQueryResult<GroupEvent[], Error> {
  const numericId = typeof groupId === 'string' ? parseInt(groupId, 10) : (typeof groupId === 'number' ? groupId : undefined);
  const validNumericId = numericId !== undefined && !isNaN(numericId) ? numericId : undefined;

  return useQuery<GroupEvent[], Error>({
    queryKey: ['groupEvents', validNumericId, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GroupEvent[]> => {
      if (validNumericId === undefined) {
        return [];
      }
      if (!useSupabase) {
        const groupEvents = mockData.events.filter((event: GroupEvent) => String(event.group_id) === String(validNumericId));
        return groupEvents;
      }
      // TODO: Implement Supabase fetch for group events, e.g., using an eventsApi
      console.warn(`Supabase fetch for groupEvents with groupId: ${validNumericId} is not implemented. Returning empty array.`);
      return []; // Placeholder for Supabase call
    },
    enabled: validNumericId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Group specific types
export interface GroupFilters {
  search?: string;
  visibility?: ('open' | 'closed' | 'secret')[];
}

// Groups hooks
export function useGroups(): UseQueryResult<Database['public']['Tables']['groups']['Row'][], Error> {
  const supabaseQuery = useQuery<Database['public']['Tables']['groups']['Row'][], Error>({
    queryKey: ['supabase', 'groups', 'all'],
    queryFn: () => groupsApi.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: useSupabase,
  });
  const mockQuery = mockQueries.useGroups(); 

  if (!useSupabase) {
    return mockQuery as unknown as UseQueryResult<Database['public']['Tables']['groups']['Row'][], Error>;
  }
  return supabaseQuery;
}

export function useGroupsWithFilters(filters?: GroupFilters): UseQueryResult<Database['public']['Tables']['groups']['Row'][], Error> {
  const supabaseQuery = useQuery<Database['public']['Tables']['groups']['Row'][], Error>({
    queryKey: ['supabase', 'groups', 'filters', filters],
    queryFn: () => groupsApi.getAll(filters ? { ...filters, visibility: filters.visibility as string[] } : undefined),
    staleTime: 5 * 60 * 1000,
    enabled: useSupabase,
  });
  const mockQuery = mockQueries.useGroupsWithFilters(filters) as unknown as UseQueryResult<Database['public']['Tables']['groups']['Row'][], Error>;

  if (!useSupabase) {
    return mockQuery as UseQueryResult<Database['public']['Tables']['groups']['Row'][], Error>;
  }
  return supabaseQuery;
}

export function useGroup(id?: string): UseQueryResult<Database['public']['Tables']['groups']['Row'] | null, Error> {
  const supabaseQuery = useQuery<Database['public']['Tables']['groups']['Row'] | null, Error>({
    queryKey: ['supabase', 'groups', id],
    queryFn: () => {
      if (id === undefined) {
        return Promise.reject(new Error('Group ID is undefined'));
      }
      return groupsApi.getById(id);
    },
    enabled: useSupabase && id !== undefined,
    staleTime: 5 * 60 * 1000,
  });
  const numericId = id ? parseInt(id, 10) : undefined;
  const mockQuery = mockQueries.useGroup(numericId === undefined || isNaN(numericId) ? undefined : String(numericId));

  if (!useSupabase) {
    return mockQuery as unknown as UseQueryResult<Database['public']['Tables']['groups']['Row'] | null, Error>;
  }
  return supabaseQuery;
}

export function useCreateGroup(): UseMutationResult<
  Database['public']['Tables']['groups']['Row'] | null,
  Error,
  GroupInput
> {
  const queryClient = useQueryClient();

  const mockMutation = {
    mutate: async (data: GroupInput) => { console.log('Mock create group:', data); return (mockData.groups?.[0] || null) as Database['public']['Tables']['groups']['Row'] | null; },
    mutateAsync: async (data: GroupInput) => { console.log('Mock create group async:', data); return (mockData.groups?.[0] || null) as Database['public']['Tables']['groups']['Row'] | null; },
    status: 'success' as const,
    data: (mockData.groups?.[0] || null) as Database['public']['Tables']['groups']['Row'] | null,
    error: null,
    isPending: false, // Changed from isLoading to isPending for Tanstack Query v5 compatibility
    isSuccess: true, 
    isError: false, 
    isIdle: false, 
    reset: () => {},
    // variables: undefined, // variables is part of the hook's state, not typically part of a manual mock like this
    // context: undefined, 
    // submittedAt:0,
  } as unknown as UseMutationResult<Database['public']['Tables']['groups']['Row'] | null, Error, GroupInput, unknown>;

  const supabaseMutation = useMutation<
    Database['public']['Tables']['groups']['Row'] | null,
    Error,
    GroupInput
  >({
    mutationFn: (groupData: GroupInput) => groupsApi.create(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups'] });
    },
  });

  if (!useSupabase) {
    return mockMutation;
  }
  return supabaseMutation;
}

export function useUpdateGroup(): UseMutationResult<
  Database['public']['Tables']['groups']['Row'] | null,
  Error,
  { id: string; data: Partial<GroupInput> }
> {
  const queryClient = useQueryClient();

  const mockMutation = {
    mutate: async (vars: { id: string; data: Partial<GroupInput> }) => { console.log('Mock update group:', vars); return (mockData.groups?.[0] || null) as Database['public']['Tables']['groups']['Row'] | null; },
    mutateAsync: async (vars: { id: string; data: Partial<GroupInput> }) => { console.log('Mock update group async:', vars); return (mockData.groups?.[0] || null) as Database['public']['Tables']['groups']['Row'] | null; },
    status: 'success' as const,
    data: (mockData.groups?.[0] || null) as Database['public']['Tables']['groups']['Row'] | null,
    error: null, 
    isPending: false, 
    isSuccess: true, 
    isError: false, 
    isIdle: false, 
    reset: () => {},
  } as unknown as UseMutationResult<Database['public']['Tables']['groups']['Row'] | null, Error, { id: string; data: Partial<GroupInput> }, unknown>;

  const supabaseMutation = useMutation<
    Database['public']['Tables']['groups']['Row'] | null,
    Error,
    { id: string; data: Partial<GroupInput> }
  >({
    mutationFn: ({ id, data }: { id: string; data: Partial<GroupInput> }) => groupsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups', variables.id] });
    },
  });

  if (!useSupabase) {
    return mockMutation;
  }
  return supabaseMutation;
}

export function useDeleteGroup(): UseMutationResult<
  boolean,
  Error,
  string // ID
> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string): Promise<boolean> => {
      if (!useSupabase) {
        console.log('Mock: Deleting group with id:', id);
        // const index = mockData.groups.findIndex(g => g.id.toString() === id);
        // if (index > -1) { mockData.groups.splice(index, 1); } // Avoid direct mutation
        return true;
      }
      return groupsApi.delete(id);
    },
    onSuccess: (_data, id) => {
      const queryPrefix = useSupabase ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: [queryPrefix, 'groups'] });
      queryClient.invalidateQueries({ queryKey: [queryPrefix, 'groups', id] });
    },
  });
}

export function useGroupMembers(groupId: number | string | undefined): UseQueryResult<MockGroupMemberType[], Error> {
  const numericId = typeof groupId === 'string' ? parseInt(groupId, 10) : (typeof groupId === 'number' ? groupId : undefined);
  const validNumericId = numericId !== undefined && !isNaN(numericId) ? numericId : undefined;

  return useQuery<MockGroupMemberType[], Error>({
    queryKey: ['groupMembers', validNumericId, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<MockGroupMemberType[]> => {
      if (validNumericId === undefined) {
        return [];
      }

      if (!useSupabase) {
        const groupData = mockData.groups.find((g: MockGroupType) => g.id.toString() === validNumericId.toString());
        return groupData?.members || []; 
      }
      
      console.warn(`Supabase fetch for group_members with groupId: ${validNumericId} is not implemented. Returning empty array as placeholder.`);
      return [];
    },
    enabled: validNumericId !== undefined,
  });
}
