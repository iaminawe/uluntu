import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { groupsApi, type GroupInput } from '@/features/groups/api/groupsApi';
import { Group as FrontendGroupType } from '../types'; // Import the main frontend Group type
import { Group as FeatureGroupType } from '@/features/groups/types/index';
import { Group as MockGroup } from '../data/mock/groups'; // This is the mock data's Group type
import { Event as MockEvent } from '../data/mock/events';
import { IS_SUPABASE_ENABLED } from '@/config/env';
import {
  GroupActivity,
  GroupAnnouncement,
  GroupInvitation,
  GroupResource,
  GroupPost,
  GroupActivityInput,
  GroupAnnouncementInput,
  CreateInvitationData,
} from './useGroupQueries.types';

// Type adapter to convert between different Group types
function adaptMockGroupToFeature(mockGroup: MockGroup): FeatureGroupType {
  // Map visibility values from mock format to feature format
  const mapVisibility = (vis: string): 'public' | 'private' | 'members_only' => {
    if (vis === 'open' || vis === 'public') return 'public';
    if (vis === 'closed' || vis === 'private') return 'private';
    if (vis === 'secret' || vis === 'members_only') return 'members_only';
    return 'public'; // default fallback
  };

  return {
    id: mockGroup.id,
    name: mockGroup.name,
    description: mockGroup.description || '',
    longDescription: mockGroup.longDescription,
    visibility: mapVisibility(mockGroup.visibility),
    heroImage: mockGroup.heroImage,
    coverImage: mockGroup.coverImage,
    status: mockGroup.status === 'published' ? 'published' : 'draft',
    featured: Boolean(mockGroup.featured),
    memberCount: mockGroup.memberCount,
    eventCount: mockGroup.eventCount,
    resourceCount: mockGroup.resourceCount,
    postCount: mockGroup.postCount,
    lastActive: mockGroup.lastActive,
    members: mockGroup.members || [],
    events: mockGroup.events || [],
    created_at: mockGroup.created_at || new Date().toISOString(),
    updated_at: mockGroup.updated_at || undefined
  };
}

// Interface for the mockQueries object structure
interface MockQueries {
  useGroups: () => UseQueryResult<FeatureGroupType[], Error>;
  useGroupsWithFilters: (filters?: GroupFilters) => UseQueryResult<FeatureGroupType[], Error>;
  useGroup: (id?: string) => UseQueryResult<FeatureGroupType | null, Error>;
}

// Mock queries implementation
const mockQueries: MockQueries = {
  useGroups: () => ({ 
    data: (mockData.groups as MockGroup[]).map(adaptMockGroupToFeature), 
    isLoading: false, 
    error: null, 
    isSuccess: true 
  } as UseQueryResult<FeatureGroupType[], Error>),
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
        filteredData = filteredData.filter((group) => {
          // Map visibility values from mock format to feature format
          const mapMockVisibility = (vis: string): 'public' | 'private' | 'members_only' => {
            if (vis === 'open' || vis === 'public') return 'public';
            if (vis === 'closed' || vis === 'private') return 'private';
            if (vis === 'secret' || vis === 'members_only') return 'members_only';
            return 'public'; // default fallback
          };
          const groupVisibility = mapMockVisibility(group.visibility);
          return filters.visibility!.includes(groupVisibility);
        });
      }
    }
    return { 
      data: filteredData.map(adaptMockGroupToFeature), 
      isLoading: false, 
      error: null, 
      isSuccess: true 
    } as UseQueryResult<FeatureGroupType[], Error>;
  },
  useGroup: (id?: string) => {
    const group = mockData.groups.find((group) => group.id.toString() === id);
    return { 
      data: group ? adaptMockGroupToFeature(group as MockGroup) : null, 
      isLoading: false, 
      error: null, 
      isSuccess: true 
    } as UseQueryResult<FeatureGroupType | null, Error>;
  },
};
// Mock data and types
import mockData from '../data/mock/mockData';

// Import the actual GroupMember type from main types
import { GroupMember as MainGroupMember } from '@/types';

// Use the main GroupMember type
export type MockGroupMemberType = MainGroupMember;

// useGroupEvents Hook

export function useGroupEvents(groupId: number | string | undefined): UseQueryResult<MockEvent[], Error> {
  const stringId = typeof groupId === 'string' ? groupId : (typeof groupId === 'number' ? groupId.toString() : undefined);

  return useQuery<MockEvent[], Error>({
    queryKey: ['groupEvents', stringId, IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
    queryFn: async (): Promise<MockEvent[]> => {
      if (stringId === undefined) {
        return [];
      }
      if (!IS_SUPABASE_ENABLED) {
        const groupEvents = mockData.events.filter((event) => String(event.group_id) === stringId);
        return groupEvents as MockEvent[];
      }
      
      const events = await groupsApi.getGroupEvents(stringId);
      return events.map((e): MockEvent => ({
        id: e.id,
        title: e.title || 'Untitled Event',
        description: e.description || '',
        date: e.date,
        end_date: e.end_date,
        location: e.location || '',
        image: e.image,
        status: e.status || 'active',
        group_id: e.group_id,
        type: e.type,
        organizer_id: e.organizer_id,
        organizer: { id: e.organizer_id, name: 'Organizer', image: '' }, // Add placeholder organizer
        current_attendees: e.current_attendees || 0,
        max_attendees: e.max_attendees,
        url: e.url,
        address: e.address,
        latitude: e.latitude,
        longitude: e.longitude,
        featured: e.featured || false,
        created_at: e.created_at
      }));
    },
    enabled: stringId !== undefined,
  });
}

// Group specific types
export interface GroupFilters {
  search?: string;
  visibility?: ('public' | 'private' | 'members_only')[];
}

// Groups hooks
export function useGroups() {
  const supabaseQuery = useQuery({
    queryKey: ['supabase', 'groups', 'all'],
    queryFn: (): Promise<FeatureGroupType[]> => groupsApi.getAll() as Promise<FeatureGroupType[]>,
    select: (data: FeatureGroupType[]) => data,
    staleTime: 5 * 60 * 1000,
    enabled: IS_SUPABASE_ENABLED,
  });
  const mockQuery = mockQueries.useGroups();

  if (!IS_SUPABASE_ENABLED) {
    return mockQuery;
  }
  return supabaseQuery;
}

export function useGroupsWithFilters(filters?: GroupFilters) {
  const supabaseQuery = useQuery({
    queryKey: ['supabase', 'groups', 'filters', filters],
    queryFn: (): Promise<FeatureGroupType[]> => groupsApi.getAll(filters ? { ...filters, visibility: filters.visibility as string[] } : undefined) as Promise<FeatureGroupType[]>,
    select: (data: FeatureGroupType[]) => data,
    staleTime: 5 * 60 * 1000,
    enabled: IS_SUPABASE_ENABLED,
  });
  const mockQuery = mockQueries.useGroupsWithFilters(filters);

  if (!IS_SUPABASE_ENABLED) {
    return mockQuery;
  }
  return supabaseQuery;
}

export function useGroup(id?: string) {
  const supabaseQuery = useQuery({
    queryKey: ['supabase', 'groups', id],
    queryFn: (): Promise<FeatureGroupType | null> => {
      if (id === undefined) {
        return Promise.resolve(null);
      }
      return groupsApi.getById(id) as Promise<FeatureGroupType | null>;
    },
    select: (data: FeatureGroupType | null) => data,
    enabled: IS_SUPABASE_ENABLED && id !== undefined,
    staleTime: 5 * 60 * 1000,
  });
  const numericId = id ? parseInt(id, 10) : undefined;
  const mockQuery = mockQueries.useGroup(numericId === undefined || isNaN(numericId) ? undefined : String(numericId));

  if (!IS_SUPABASE_ENABLED) {
    return mockQuery;
  }
  return supabaseQuery;
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  const mockMutation = {
    mutate: async (data: GroupInput) => { return mockData.groups?.[0] ? adaptMockGroupToFeature(mockData.groups[0] as MockGroup) : null; },
    mutateAsync: async (data: GroupInput) => { return mockData.groups?.[0] ? adaptMockGroupToFeature(mockData.groups[0] as MockGroup) : null; },
    status: 'success' as const,
    data: mockData.groups?.[0] ? adaptMockGroupToFeature(mockData.groups[0] as MockGroup) : null,
    error: null,
    isPending: false,
    isSuccess: true, 
    isError: false, 
    isIdle: false, 
    reset: () => {},
  } as unknown as UseMutationResult<FrontendGroupType | null, Error, GroupInput, unknown>;

  const supabaseMutation = useMutation({
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

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  const mockMutation = {
    mutate: async (data: { id: string } & Partial<GroupInput>) => { return (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null; },
    mutateAsync: async (data: { id: string } & Partial<GroupInput>) => { return (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null; },
    status: 'success' as const,
    data: (mockData.groups?.[0] || null) as unknown as FrontendGroupType | null,
    error: null, 
    isPending: false, 
    isSuccess: true, 
    isError: false, 
    isIdle: false, 
    reset: () => {},
  } as unknown as UseMutationResult<FrontendGroupType | null, Error, { id: string } & Partial<GroupInput>, unknown>;

  const supabaseMutation = useMutation({
    mutationFn: ({ id, ...updateData }: { id: string } & Partial<GroupInput>) => {
      return groupsApi.update(id, updateData);
    },
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
    const stringId = typeof groupId === 'string' ? groupId : (typeof groupId === 'number' ? groupId.toString() : undefined);

    return useQuery<MockGroupMemberType[], Error>({
        queryKey: ['groupMembers', stringId, IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
        queryFn: async (): Promise<MockGroupMemberType[]> => {
            if (stringId === undefined) {
                return [];
            }

            if (!IS_SUPABASE_ENABLED) {
                const groupData = mockData.groups.find((g: MockGroup) => g.id.toString() === stringId);
                return groupData?.members || [];
            }
            
            const members = await groupsApi.getGroupMembers(stringId);
            return members.map((m): MockGroupMemberType => ({
                id: m.member?.id || m.member_id,
                name: m.member?.name || 'Unknown',
                role: m.role || 'member',
                joinDate: m.joined_date,
                image: m.member?.avatar_url || '/placeholder-avatar.png',
                joinedDate: m.joined_date,
                title: m.member?.title
            }));
        },
        enabled: stringId !== undefined,
    });
}

export function useJoinGroup(): UseMutationResult<boolean, Error, { groupId: string }> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { groupId: string }>({
    mutationFn: ({ groupId }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock join group
        return Promise.resolve(true);
      }
      return groupsApi.joinGroup(groupId, ''); // userId determined from auth context
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

export function useGroupMemberRole(groupId?: string, memberId?: string): UseQueryResult<'admin' | 'moderator' | 'member' | null, Error> {
  return useQuery<'admin' | 'moderator' | 'member' | null, Error>({
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
  { groupId: string; memberId: string; role: 'admin' | 'moderator' | 'member' }
> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { groupId: string; memberId: string; role: 'admin' | 'moderator' | 'member' }>({
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
/**
 * Hook to fetch group activities (member actions, posts, events, etc.)
 *
 * @param groupId - The ID of the group to fetch activities for
 * @returns Query result containing array of GroupActivity objects
 *
 * @example
 * ```typescript
 * const { data: activities, isLoading } = useGroupActivities('group-123');
 * activities?.forEach(activity => {
 *   console.log(`${activity.actor?.name} ${activity.action}`);
 * });
 * ```
 */
export function useGroupActivities(groupId?: string): UseQueryResult<GroupActivity[], Error> {
  return useQuery<GroupActivity[], Error>({
    queryKey: ['groupActivities', groupId],
    queryFn: async (): Promise<GroupActivity[]> => {
      if (!groupId) return [];
      if (!IS_SUPABASE_ENABLED) {
        return []; // Mock returns empty array
      }
      const activities = await groupsApi.getGroupActivities(groupId);
      return activities as GroupActivity[];
    },
    enabled: !!groupId,
  });
}

/**
 * Hook to fetch group announcements (important messages for members)
 *
 * @param groupId - The ID of the group to fetch announcements for
 * @returns Query result containing array of GroupAnnouncement objects
 *
 * @example
 * ```typescript
 * const { data: announcements } = useGroupAnnouncements('group-123');
 * const urgentAnnouncements = announcements?.filter(a => a.priority === 'urgent');
 * ```
 */
export function useGroupAnnouncements(groupId?: string): UseQueryResult<GroupAnnouncement[], Error> {
  return useQuery<GroupAnnouncement[], Error>({
    queryKey: ['groupAnnouncements', groupId],
    queryFn: async (): Promise<GroupAnnouncement[]> => {
      if (!groupId) return [];
      if (!IS_SUPABASE_ENABLED) {
        return []; // Mock returns empty array
      }
      const announcements = await groupsApi.getAnnouncements(groupId);
      return announcements as GroupAnnouncement[];
    },
    enabled: !!groupId,
  });
}

/**
 * Hook to create a new group activity
 *
 * @returns Mutation result for creating activities
 *
 * @example
 * ```typescript
 * const createActivity = useCreateActivity();
 * await createActivity.mutateAsync({
 *   groupId: 'group-123',
 *   data: { action: 'post_created', target_id: 'post-456' }
 * });
 * ```
 */
export function useCreateActivity(): UseMutationResult<GroupActivity, Error, { groupId: string; data: GroupActivityInput }> {
  const queryClient = useQueryClient();

  return useMutation<GroupActivity, Error, { groupId: string; data: GroupActivityInput }>({
    mutationFn: async ({ groupId, data }): Promise<GroupActivity> => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock create activity
        return {
          id: `mock-${Date.now()}`,
          group_id: groupId,
          actor_id: 'mock-actor',
          action: data.action,
          target_type: data.target_type || null,
          target_id: data.target_id || null,
          metadata: data.metadata || null,
          created_at: new Date().toISOString()
        };
      }
      const result = await groupsApi.createActivity(groupId, data);
      return result as GroupActivity;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupActivities', variables.groupId] });
    },
  });
}

/**
 * Hook to create a new group announcement
 *
 * @returns Mutation result for creating announcements
 *
 * @example
 * ```typescript
 * const createAnnouncement = useCreateAnnouncement();
 * await createAnnouncement.mutateAsync({
 *   groupId: 'group-123',
 *   data: {
 *     title: 'Important Update',
 *     content: 'Meeting time changed to 3pm',
 *     priority: 'high'
 *   }
 * });
 * ```
 */
export function useCreateAnnouncement(): UseMutationResult<GroupAnnouncement, Error, { groupId: string; data: GroupAnnouncementInput }> {
  const queryClient = useQueryClient();

  return useMutation<GroupAnnouncement, Error, { groupId: string; data: GroupAnnouncementInput }>({
    mutationFn: async ({ groupId, data }): Promise<GroupAnnouncement> => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock create announcement
        return {
          id: `mock-${Date.now()}`,
          group_id: groupId,
          title: data.title || null,
          content: data.content,
          content_html: data.content_html || null,
          priority: data.priority || 'normal',
          author_id: 'mock-author',
          created_at: new Date().toISOString(),
          status: 'published'
        };
      }
      const result = await groupsApi.createAnnouncement(groupId, data);
      return result as GroupAnnouncement;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupAnnouncements', variables.groupId] });
    },
  });
}

// Updated invitation hooks
/**
 * Hook to fetch group invitations
 *
 * @param groupId - The ID of the group to fetch invitations for
 * @returns Query result containing array of GroupInvitation objects
 *
 * @example
 * ```typescript
 * const { data: invitations } = useGroupInvitations('group-123');
 * const pendingInvites = invitations?.filter(inv => inv.status === 'pending');
 * ```
 */
export function useGroupInvitations(groupId?: string): UseQueryResult<GroupInvitation[], Error> {
  return useQuery<GroupInvitation[], Error>({
    queryKey: ['groupInvitations', groupId, IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GroupInvitation[]> => {
      if (!groupId) return [];
      if (!IS_SUPABASE_ENABLED) {
        // Mock returns sample invitations
        return [
          {
            id: 'mock-inv-1',
            group_id: groupId,
            invited_email: 'user@example.com',
            invited_by: 'mock-admin',
            role: 'member',
            status: 'pending',
            created_at: new Date().toISOString(),
            token: 'mock-token-1',
            message: 'Welcome to join our group!'
          },
          {
            id: 'mock-inv-2',
            group_id: groupId,
            invited_member_id: 'mock-member-1',
            invited_by: 'mock-admin',
            role: 'moderator',
            status: 'pending',
            created_at: new Date().toISOString(),
            token: 'mock-token-2',
            message: 'Join us as a moderator!'
          }
        ];
      }
      const invitations = await groupsApi.getGroupInvitations(groupId);
      return invitations as GroupInvitation[];
    },
    enabled: !!groupId,
  });
}

/**
 * Hook to create a new group invitation
 *
 * @returns Mutation result for creating invitations
 *
 * @example
 * ```typescript
 * const createInvitation = useCreateInvitation();
 * await createInvitation.mutateAsync({
 *   groupId: 'group-123',
 *   data: { invited_email: 'user@example.com', role: 'member' }
 * });
 * ```
 */
export function useCreateInvitation(): UseMutationResult<string | null, Error, { groupId: string; data: CreateInvitationData }> {
  const queryClient = useQueryClient();

  return useMutation<string | null, Error, { groupId: string; data: CreateInvitationData }>({
    mutationFn: ({ groupId, data }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock create invitation - return a mock token
        return Promise.resolve('mock-invitation-token-' + Date.now());
      }
      return groupsApi.createInvitation(groupId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupInvitations', variables.groupId] });
    },
  });
}

export function useCancelInvitation(): UseMutationResult<boolean, Error, { invitationId: string; groupId: string }> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { invitationId: string; groupId: string }>({
    mutationFn: ({ invitationId }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock cancel invitation
        return Promise.resolve(true);
      }
      return groupsApi.cancelInvitation(invitationId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupInvitations', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupInvitations'] });
    },
  });
}

export function useAcceptInvitation(): UseMutationResult<boolean, Error, { token: string }> {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { token: string }>({
    mutationFn: ({ token }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock accept invitation
        return Promise.resolve(true);
      }
      return groupsApi.acceptInvitation(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] });
      queryClient.invalidateQueries({ queryKey: ['groupInvitations'] });
    },
  });
}

/**
 * Hook to fetch an invitation by its token (for accepting invites)
 *
 * @param token - The invitation token
 * @returns Query result containing the GroupInvitation object or null
 *
 * @example
 * ```typescript
 * const { data: invitation } = useInvitationByToken(tokenFromUrl);
 * if (invitation && invitation.status === 'pending') {
 *   // Show accept/decline buttons
 * }
 * ```
 */
export function useInvitationByToken(token?: string): UseQueryResult<GroupInvitation | null, Error> {
  return useQuery<GroupInvitation | null, Error>({
    queryKey: ['invitation', token, IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GroupInvitation | null> => {
      if (!token) return null;
      if (!IS_SUPABASE_ENABLED) {
        // Mock returns sample invitation data
        return {
          id: 'mock-inv-1',
          token: token,
          group_id: 'mock-group-1',
          invited_by: 'mock-admin',
          group: {
            id: 'mock-group-1',
            name: 'Mock Group',
            description: 'A mock group for testing',
            visibility: 'public'
          },
          invited_email: 'user@example.com',
          role: 'member',
          status: 'pending',
          message: 'Welcome to join our group!',
          created_at: new Date().toISOString()
        };
      }
      const invitation = await groupsApi.getInvitationByToken(token);
      return invitation as GroupInvitation | null;
    },
    enabled: !!token,
  });
}

// New invitation-related hooks

export function useInviteMember(): UseMutationResult<string | null, Error, { groupId: string; memberId: string; role?: 'admin' | 'moderator' | 'member'; message?: string }> {
  const queryClient = useQueryClient();

  return useMutation<string | null, Error, { groupId: string; memberId: string; role?: 'admin' | 'moderator' | 'member'; message?: string }>({
    mutationFn: ({ groupId, memberId, role = 'member', message }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock invite member - return a mock token
        return Promise.resolve('mock-member-invitation-token-' + Date.now());
      }
      return groupsApi.createInvitation(groupId, {
        invited_member_id: memberId,
        role,
        message
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupInvitations', variables.groupId] });
    },
  });
}

export function useInviteByEmail(): UseMutationResult<string | null, Error, { groupId: string; email: string; role?: 'admin' | 'moderator' | 'member'; message?: string; groupInfo?: { name: string; description?: string } }> {
  const queryClient = useQueryClient();

  return useMutation<string | null, Error, { groupId: string; email: string; role?: 'admin' | 'moderator' | 'member'; message?: string; groupInfo?: { name: string; description?: string } }>({
    mutationFn: ({ groupId, email, role = 'member', message }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock email invitation - return a mock token
        return Promise.resolve('mock-email-invitation-token-' + Date.now());
      }
      return groupsApi.createInvitation(groupId, {
        invited_email: email,
        role,
        message
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupInvitations', variables.groupId] });
    },
  });
}

export function useResendInvitation(): UseMutationResult<string | null, Error, { invitationId: string; groupId: string }> {
  const queryClient = useQueryClient();

  return useMutation<string | null, Error, { invitationId: string; groupId: string }>({
    mutationFn: async ({ invitationId, groupId }) => {
      if (!IS_SUPABASE_ENABLED) {
        // Mock resend invitation - return a mock token
        return Promise.resolve('mock-resent-invitation-token-' + Date.now());
      }
      
      // For resending, we need to get the original invitation details and create a new one
      // This is a simplified approach - in practice, you might want to implement a specific resend endpoint
      const invitations = await groupsApi.getGroupInvitations(groupId) as GroupInvitation[];
      const invitation = invitations.find((inv) => inv.id === invitationId);

      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      // Create a new invitation with the same details
      return groupsApi.createInvitation(groupId, {
        invited_email: invitation.invited_email,
        invited_member_id: invitation.invited_member_id,
        role: invitation.role,
        message: invitation.message
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupInvitations', variables.groupId] });
    },
  });
}

// Group Resources Hook
/**
 * Hook to fetch group resources (documents, links, files)
 *
 * @param groupId - The ID of the group to fetch resources for
 * @returns Query result containing array of GroupResource objects
 *
 * @example
 * ```typescript
 * const { data: resources } = useGroupResources('group-123');
 * const documents = resources?.filter(r => r.type === 'document');
 * ```
 */
export function useGroupResources(groupId: string | undefined): UseQueryResult<GroupResource[], Error> {
  return useQuery<GroupResource[], Error>({
    queryKey: ['groupResources', groupId, IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GroupResource[]> => {
      if (!groupId) {
        return [];
      }
      if (!IS_SUPABASE_ENABLED) {
        // Mock returns empty array for now
        return [];
      }

      const resources = await groupsApi.getGroupResources(groupId);
      return resources.map((r): GroupResource => ({
        id: r.id,
        group_id: groupId,
        title: r.title || 'Untitled Resource',
        description: r.description || null,
        url: r.url || '',
        type: (r.type as GroupResource['type']) || 'link',
        created_at: r.created_at,
        category: r.category || null,
        tags: r.tags || null,
        status: r.status || 'published'
      }));
    },
    enabled: !!groupId,
  });
}

// Group Posts Hook
/**
 * Hook to fetch group posts (discussions, updates, content)
 *
 * @param groupId - The ID of the group to fetch posts for
 * @returns Query result containing array of GroupPost objects
 *
 * @example
 * ```typescript
 * const { data: posts } = useGroupPosts('group-123');
 * const pinnedPosts = posts?.filter(p => p.is_pinned);
 * ```
 */
export function useGroupPosts(groupId: string | undefined): UseQueryResult<GroupPost[], Error> {
  return useQuery<GroupPost[], Error>({
    queryKey: ['groupPosts', groupId, IS_SUPABASE_ENABLED ? 'supabase' : 'mock'],
    queryFn: async (): Promise<GroupPost[]> => {
      if (!groupId) {
        return [];
      }
      if (!IS_SUPABASE_ENABLED) {
        // Mock returns empty array for now
        return [];
      }

      const posts = await groupsApi.getGroupPosts(groupId);
      return posts.map((p): GroupPost => ({
        id: p.post?.id || p.post_id || p.id,
        group_id: groupId,
        title: p.post?.title || p.title || null,
        content: p.post?.content || p.content || '',
        author_id: p.post?.author_id || p.author_id,
        type: (p.type as GroupPost['type']) || 'post',
        status: (p.status as GroupPost['status']) || 'published',
        created_at: p.post?.created_at || p.created_at,
        updated_at: p.post?.updated_at || p.updated_at || null,
        post: p.post ? {
          id: p.post.id,
          title: p.post.title || null,
          content: p.post.content,
          author_id: p.post.author_id,
          created_at: p.post.created_at,
          updated_at: p.post.updated_at || null
        } : undefined
      }));
    },
    enabled: !!groupId,
  });
}
