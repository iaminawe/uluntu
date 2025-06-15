import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { groupsApi, type GroupInput } from '@/features/groups/api/groupsApi';
import { Group as FrontendGroupType } from '../types'; // Import the main frontend Group type
import { Group as MockGroup } from '@/features/groups/components/GroupsList/types';
import { Group } from '../data/mock/groups'; // This is the mock data's Group type
import { Event as MockEvent } from '../data/mock/events';
import { IS_SUPABASE_ENABLED } from '@/config/env';

// Interface for the mockQueries object structure
interface MockQueries {
  useGroups: () => UseQueryResult<MockGroup[], Error>;
  useGroupsWithFilters: (filters?: GroupFilters) => UseQueryResult<MockGroup[], Error>;
  useGroup: (id?: string) => UseQueryResult<MockGroup | null, Error>;
}

// Mock queries implementation
const mockQueries: MockQueries = {
  useGroups: () => ({ data: mockData.groups as MockGroup[], isLoading: false, error: null, isSuccess: true } as UseQueryResult<MockGroup[], Error>),
  useGroupsWithFilters: (filters?: GroupFilters) => {
    let filteredData = mockData.groups as MockGroup[];
    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter((group) =>
          group.name.toLowerCase().includes(searchTerm) ||
          (group.description && group.description.toLowerCase().includes(searchTerm))
        );
      }
      if (filters.visibility && filters.visibility.length > 0) {
        filteredData = filteredData.filter((group) => filters.visibility!.includes(group.visibility));
      }
    }
    return { data: filteredData, isLoading: false, error: null, isSuccess: true } as UseQueryResult<MockGroup[], Error>;
  },
  useGroup: (id?: string) => ({ data: mockData.groups.find((group) => group.id.toString() === id) || null, isLoading: false, error: null, isSuccess: true }) as UseQueryResult<MockGroup | null, Error>,
};
// Mock data and types
import mockData from '../data/mock/mockData';

// Define GroupMember type since it's not directly exported from mockData
interface GroupMember {
  id: string;
  name: string;
  role?: string;
  joinDate?: string;
}
export type MockGroupMemberType = GroupMember;

// useGroupEvents Hook

export function useGroupEvents(groupId: number | string | undefined): UseQueryResult<MockEvent[], Error> {
  const numericId = typeof groupId === 'string' ? parseInt(groupId, 10) : (typeof groupId === 'number' ? groupId : undefined);
  const validNumericId = numericId !== undefined && !isNaN(numericId) ? numericId : undefined;

  return useQuery<MockEvent[], Error>({
    queryKey: ['groupEvents', validNumericId, IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
    queryFn: async (): Promise<MockEvent[]> => {
      if (validNumericId === undefined) {
        return [];
      }
      if (!IS_SUPABASE_ENABLED) {
        const groupEvents = mockData.events.filter((event) => String(event.group_id) === String(validNumericId));
        return groupEvents as MockEvent[];
      }
      // TODO: Implement Supabase fetch for group events, e.g., using an eventsApi
      console.warn(`Supabase fetch for groupEvents with groupId: ${validNumericId} is not implemented. Returning empty array.`);
      return []; // Placeholder for Supabase call
    },
    enabled: validNumericId !== undefined,
  });
}

// Group specific types
export interface GroupFilters {
  search?: string;
  visibility?: ('open' | 'closed' | 'secret')[];
}

// Groups hooks
export function useGroups(): UseQueryResult<FrontendGroupType[], Error> {
  const supabaseQuery = useQuery<FrontendGroupType[], Error>({
    queryKey: ['supabase', 'groups', 'all'],
    queryFn: () => groupsApi.getAll(), // groupsApi.getAll() returns Promise<FrontendGroupType[]>
    select: (data: FrontendGroupType[]) => data, // Explicit select
    staleTime: 5 * 60 * 1000,
    enabled: IS_SUPABASE_ENABLED,
  });
  const mockQuery = mockQueries.useGroups();

  if (!IS_SUPABASE_ENABLED) {
    // Assuming MockGroup is compatible enough or this path needs its own specific typing
    return mockQuery as unknown as UseQueryResult<FrontendGroupType[], Error>; 
  }
  return supabaseQuery;
}

export function useGroupsWithFilters(filters?: GroupFilters): UseQueryResult<FrontendGroupType[], Error> {
  const supabaseQuery = useQuery<FrontendGroupType[], Error>({
    queryKey: ['supabase', 'groups', 'filters', filters],
    queryFn: () => groupsApi.getAll(filters ? { ...filters, visibility: filters.visibility as string[] } : undefined), // Returns Promise<FrontendGroupType[]>
    select: (data: FrontendGroupType[]) => data, // Explicit select to reinforce type
    staleTime: 5 * 60 * 1000,
    enabled: IS_SUPABASE_ENABLED,
  });
  const mockQuery = mockQueries.useGroupsWithFilters(filters);

  if (!IS_SUPABASE_ENABLED) {
    return mockQuery as unknown as UseQueryResult<FrontendGroupType[], Error>;
  }
  return supabaseQuery;
}

export function useGroup(id?: string): UseQueryResult<FrontendGroupType | null, Error> {
  const supabaseQuery = useQuery<FrontendGroupType | null, Error>({
    queryKey: ['supabase', 'groups', id],
    queryFn: () => { // groupsApi.getById(id) returns Promise<FrontendGroupType | null>
      if (id === undefined) {
        // Tanstack Query expects queryFn to not throw for 'enabled: false' cases,
        // but returning a rejected promise is fine if it's genuinely an error state for an enabled query.
        // Or, ensure 'enabled' correctly handles this scenario to prevent queryFn execution.
        return Promise.resolve(null); // Or handle appropriately if id must be present when enabled
      }
      return groupsApi.getById(id);
    },
    select: (data: FrontendGroupType | null) => data, // Explicit select
    enabled: IS_SUPABASE_ENABLED && id !== undefined,
    staleTime: 5 * 60 * 1000,
  });
  const numericId = id ? parseInt(id, 10) : undefined;
  const mockQuery = mockQueries.useGroup(numericId === undefined || isNaN(numericId) ? undefined : String(numericId));

  if (!IS_SUPABASE_ENABLED) {
    return mockQuery as unknown as UseQueryResult<FrontendGroupType | null, Error>;
  }
  return supabaseQuery;
}

export function useCreateGroup(): UseMutationResult<
  FrontendGroupType | null, // Updated return type
  Error,
  GroupInput
> {
  const queryClient = useQueryClient();

  const mockMutation = {
    mutate: async (data: GroupInput) => { return (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null; },
    mutateAsync: async (data: GroupInput) => { return (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null; },
    status: 'success' as const,
    data: (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null,
    error: null,
    isPending: false,
    isSuccess: true, 
    isError: false, 
    isIdle: false, 
    reset: () => {},
  } as unknown as UseMutationResult<FrontendGroupType | null, Error, GroupInput, unknown>;

  const supabaseMutation = useMutation<
    FrontendGroupType | null, // Updated return type
    Error,
    GroupInput
  >({
    mutationFn: (groupData: GroupInput) => groupsApi.create(groupData), // groupsApi.create returns Promise<FrontendGroupType | null>
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups'] });
    },
  });

  if (!IS_SUPABASE_ENABLED) {
    return mockMutation;
  }
  return supabaseMutation;
}

export function useUpdateGroup(): UseMutationResult<
  FrontendGroupType | null, // Updated return type
  Error,
  { id: string; data: Partial<GroupInput> }
> {
  const queryClient = useQueryClient();

  const mockMutation = {
    mutate: async (vars: { id: string; data: Partial<GroupInput> }) => { return (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null; },
    mutateAsync: async (vars: { id: string; data: Partial<GroupInput> }) => { return (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null; },
    status: 'success' as const,
    data: (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null,
    error: null, 
    isPending: false, 
    isSuccess: true, 
    isError: false, 
    isIdle: false, 
    reset: () => {},
  } as unknown as UseMutationResult<FrontendGroupType | null, Error, { id: string; data: Partial<GroupInput> }, unknown>;

  const supabaseMutation = useMutation<
    FrontendGroupType | null, // Updated return type
    Error,
    { id: string; data: Partial<GroupInput> }
  >({
    mutationFn: ({ id, data }: { id: string; data: Partial<GroupInput> }) => groupsApi.update(id, data), // groupsApi.update returns Promise<FrontendGroupType | null>
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups', variables.id] });
    },
  });

  if (!IS_SUPABASE_ENABLED) {
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
      if (!IS_SUPABASE_ENABLED) {
        // Mock delete group
        // const index = mockData.groups.findIndex(g => g.id.toString() === id);
        // if (index > -1) { mockData.groups.splice(index, 1); } // Avoid direct mutation
        return true;
      }
      return groupsApi.delete(id);
    },
    onSuccess: (_data, id) => {
      const queryPrefix = !IS_SUPABASE_ENABLED ? 'supabase' : 'mock';
      queryClient.invalidateQueries({ queryKey: [queryPrefix, 'groups'] });
      queryClient.invalidateQueries({ queryKey: [queryPrefix, 'groups', id] });
    },
  });
}

export function useGroupMembers(groupId: number | string | undefined): UseQueryResult<MockGroupMemberType[], Error> {
    const numericId = typeof groupId === 'string' ? parseInt(groupId, 10) : (typeof groupId === 'number' ? groupId : undefined);
    const validNumericId = numericId !== undefined && !isNaN(numericId) ? numericId : undefined;

    return useQuery<MockGroupMemberType[], Error>({
        queryKey: ['groupMembers', validNumericId, !IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
        queryFn: async (): Promise<MockGroupMemberType[]> => {
            if (validNumericId === undefined) {
                return [];
            }

            if (!IS_SUPABASE_ENABLED) {
                const groupData = mockData.groups.find((g: Group) => g.id.toString() === validNumericId.toString());
                return groupData?.members || [];
            }
            
            console.warn(`Supabase fetch for group_members with groupId: ${validNumericId} is not implemented. Returning empty array as placeholder.`);
            return [];
        },
        enabled: validNumericId !== undefined,
    });
}

export function useJoinGroup(): UseMutationResult<boolean, Error, { groupId: string; memberId: string }> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { groupId: string; memberId: string }>({
    mutationFn: ({ groupId, memberId }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock join group
        return Promise.resolve(true);
      }
      return groupsApi.joinGroup(groupId, memberId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
    },
  });
}

export function useLeaveGroup(): UseMutationResult<boolean, Error, { groupId: string; memberId: string }> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { groupId: string; memberId: string }>({
    mutationFn: ({ groupId, memberId }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock leave group
        return Promise.resolve(true);
      }
      return groupsApi.leaveGroup(groupId, memberId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
    },
  });
}

export function useGroupMembership(groupId?: string, memberId?: string): UseQueryResult<boolean, Error> {
  return useQuery<boolean, Error>({
    queryKey: ['groupMembership', groupId, memberId],
    queryFn: async () => {
      if (!groupId || !memberId) return false;
      if (!IS_SUPABASE_ENABLED) {
        return false; // Mock always returns false
      }
      return groupsApi.isMember(groupId, memberId);
    },
    enabled: !!groupId && !!memberId,
  });
}

export function useGroupMemberRole(groupId?: string, memberId?: string): UseQueryResult<'admin' | 'member' | null, Error> {
  return useQuery<'admin' | 'member' | null, Error>({
    queryKey: ['groupMemberRole', groupId, memberId],
    queryFn: async () => {
      if (!groupId || !memberId) return null;
      if (!IS_SUPABASE_ENABLED) {
        return null; // Mock always returns null
      }
      return groupsApi.getMemberRole(groupId, memberId);
    },
    enabled: !!groupId && !!memberId,
  });
}

export function useUpdateMemberRole(): UseMutationResult<
  boolean,
  Error,
  { groupId: string; memberId: string; role: 'admin' | 'member' }
> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { groupId: string; memberId: string; role: 'admin' | 'member' }>({
    mutationFn: ({ groupId, memberId, role }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock update member role
        return Promise.resolve(true);
      }
      return groupsApi.updateMemberRole(groupId, memberId, role);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMemberRole', variables.groupId, variables.memberId] });
    },
  });
}

export function useRemoveMember(): UseMutationResult<
  boolean,
  Error,
  { groupId: string; memberId: string }
> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { groupId: string; memberId: string }>({
    mutationFn: ({ groupId, memberId }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock remove member
        return Promise.resolve(true);
      }
      return groupsApi.removeMember(groupId, memberId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups', variables.groupId] });
    },
  });
}

// Activities and Announcements hooks
export function useGroupActivities(groupId?: string): UseQueryResult<any[], Error> {
  return useQuery<any[], Error>({
    queryKey: ['groupActivities', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      if (!IS_SUPABASE_ENABLED) {
        return []; // Mock returns empty array
      }
      return groupsApi.getActivities(groupId);
    },
    enabled: !!groupId,
  });
}

export function useGroupAnnouncements(groupId?: string): UseQueryResult<any[], Error> {
  return useQuery<any[], Error>({
    queryKey: ['groupAnnouncements', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      if (!IS_SUPABASE_ENABLED) {
        return []; // Mock returns empty array
      }
      return groupsApi.getAnnouncements(groupId);
    },
    enabled: !!groupId,
  });
}

export function useCreateActivity(): UseMutationResult<any, Error, { groupId: string; data: any }> {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { groupId: string; data: any }>({
    mutationFn: ({ groupId, data }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock create activity
        return Promise.resolve(data);
      }
      return groupsApi.createActivity(groupId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupActivities', variables.groupId] });
    },
  });
}

export function useCreateAnnouncement(): UseMutationResult<any, Error, { groupId: string; data: any }> {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { groupId: string; data: any }>({
    mutationFn: ({ groupId, data }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock create announcement
        return Promise.resolve(data);
      }
      return groupsApi.createAnnouncement(groupId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupAnnouncements', variables.groupId] });
    },
  });
}

// Invitation hooks
export function useGroupInvitations(groupId?: string): UseQueryResult<any[], Error> {
  return useQuery<any[], Error>({
    queryKey: ['groupInvitations', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      if (!IS_SUPABASE_ENABLED) {
        return []; // Mock returns empty array
      }
      return groupsApi.getInvitations(groupId);
    },
    enabled: !!groupId,
  });
}

export function useCreateInvitation(): UseMutationResult<any, Error, { groupId: string; data: any }> {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { groupId: string; data: any }>({
    mutationFn: ({ groupId, data }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock create invitation
        return Promise.resolve(data);
      }
      return groupsApi.createInvitation(groupId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupInvitations', variables.groupId] });
    },
  });
}

export function useCancelInvitation(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (invitationId) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock cancel invitation
        return Promise.resolve(true);
      }
      return groupsApi.cancelInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupInvitations'] });
    },
  });
}

export function useAcceptInvitation(): UseMutationResult<boolean, Error, { token: string; memberId: string }> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { token: string; memberId: string }>({
    mutationFn: ({ token, memberId }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock accept invitation
        return Promise.resolve(true);
      }
      return groupsApi.acceptInvitation(token, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] });
    },
  });
}

export function useInvitationByToken(token?: string): UseQueryResult<any, Error> {
  return useQuery<any, Error>({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null;
      if (!IS_SUPABASE_ENABLED) {
        return null; // Mock returns null
      }
      return groupsApi.getInvitationByToken(token);
    },
    enabled: !!token,
  });
}
