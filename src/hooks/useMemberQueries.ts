import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { Tables } from '../types/supabase';
import { membersApi, MemberInput } from '../api/membersApi';
import * as mockQueries from './useQueries';

// Configuration to switch between mock and real data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Members hooks
// Define filter types for Members, using the structure from mockQueries as a base
export type MemberFilters = {
  search?: string;
  skills?: string[];
  // Add other filter properties as needed from membersApi.getMembers if they exist
};

export function useMembers(): UseQueryResult<Tables<'members'>['Row'][], Error> {
  const supabaseQueryResult = useQuery({
    queryKey: ['supabase', 'members', 'all'],
    queryFn: () => membersApi.getAll(),
    enabled: USE_SUPABASE,
  });

  const mockQueryResult = mockQueries.useMembers();

  if (!USE_SUPABASE) {
    return mockQueryResult;
  }
  return supabaseQueryResult;
}

export function useMembersWithFilters(filters?: MemberFilters): UseQueryResult<Tables<'members'>['Row'][], Error> {
  const supabaseQueryResult = useQuery({
    queryKey: ['supabase', 'members', 'filters', filters],
    queryFn: () => membersApi.getAll(filters),
    enabled: USE_SUPABASE,
  });

  const mockQueryResult = mockQueries.useMembersWithFilters(filters);

  if (!USE_SUPABASE) {
    return mockQueryResult;
  }
  return supabaseQueryResult;
}

export function useMemberById(id?: string): UseQueryResult<Tables<'members'>['Row'] | null, Error> {
  const supabaseQueryResult = useQuery({
    queryKey: ['supabase', 'members', id],
    queryFn: () => {
      if (id === undefined) {
        return Promise.reject(new Error('Member ID is undefined'));
      }
      return membersApi.getById(id);
    },
    enabled: id !== undefined && USE_SUPABASE,
  });

  // mockQueries.useMember internally handles 'enabled: !!id'
  const mockQueryResult = mockQueries.useMember(id ? parseInt(id, 10) : NaN); 

  if (!USE_SUPABASE) {
    return mockQueryResult;
  }
  return supabaseQueryResult;
}

export function useCreateMember(): UseMutationResult<
  Tables<'members'>['Row'] | null,
  Error,
  MemberInput // API expects MemberInput
> {
  const queryClient = useQueryClient();

  const supabaseMutation = useMutation<
    Tables<'members'>['Row'] | null,
    Error,
    MemberInput
  >({
    mutationFn: (memberData: MemberInput) => membersApi.create(memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'members'] });
      // Consider invalidating specific filtered queries if applicable
    },
  });

  if (!USE_SUPABASE) {
    // Fallback to mock implementation if Supabase is not used
    console.warn('Supabase is disabled, using mock create member.');
    return {
      mutate: async (data: MemberInput) => { console.log('Mock create member:', data); return mockQueries.mockData.members[0] as Tables<'members'>['Row']; },
      mutateAsync: async (data: MemberInput) => { console.log('Mock create member async:', data); return mockQueries.mockData.members[0] as Tables<'members'>['Row']; },
      status: 'success',
      data: mockQueries.mockData.members[0] as Tables<'members'>['Row'] | null,
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isIdle: false,
      reset: () => {},
      variables: undefined,
      isPaused: false,
      failureCount:0,
      failureReason: null,
      context: undefined,
      submittedAt:0,
    } as unknown as UseMutationResult<Tables<'members'>['Row'] | null, Error, MemberInput, unknown>;
  }
  return supabaseMutation;
}

export function useUpdateMember(): UseMutationResult<
  Tables<'members'>['Row'] | null,
  Error,
  { id: string; data: Partial<MemberInput> }
> {
  const queryClient = useQueryClient();

  const supabaseMutation = useMutation<
    Tables<'members'>['Row'] | null,
    Error,
    { id: string; data: Partial<MemberInput> }
  >({
    mutationFn: ({ id, data }: { id: string; data: Partial<MemberInput> }) => membersApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'members', String(variables.id)] });
      // Consider invalidating specific filtered queries if applicable
    },
  });

  if (!USE_SUPABASE) {
    // Fallback to mock implementation if Supabase is not used
    console.warn('Supabase is disabled, using mock update member.');
    return {
      mutate: async (variables: { id: string; data: Partial<MemberInput> }) => { console.log('Mock update member:', variables); return mockQueries.mockData.members[0] as Tables<'members'>['Row']; },
      mutateAsync: async (variables: { id: string; data: Partial<MemberInput> }) => { console.log('Mock update member async:', variables); return mockQueries.mockData.members[0] as Tables<'members'>['Row']; },
      status: 'success',
      data: mockQueries.mockData.members[0] as Tables<'members'>['Row'] | null,
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isIdle: false,
      reset: () => {},
      variables: undefined,
      isPaused: false,
      failureCount:0,
      failureReason: null,
      context: undefined,
      submittedAt:0,
    } as unknown as UseMutationResult<Tables<'members'>['Row'] | null, Error, { id: string; data: Partial<MemberInput> }, unknown>;
  }
  return supabaseMutation;
}

export function useDeleteMember(): UseMutationResult<
  boolean, // API returns boolean
  Error,
  string // Variables type is the ID (string)
> {
  const queryClient = useQueryClient();

  const supabaseMutation = useMutation<boolean, Error, string>({
    mutationFn: (id: string) => membersApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'members', String(id)] });
      // Consider invalidating specific filtered queries if applicable
    },
  });

  if (!USE_SUPABASE) {
    // Fallback to mock implementation if Supabase is not used
    console.warn('Supabase is disabled, using mock delete member.');
    return {
      mutate: async (id: string) => { console.log('Mock delete member:', id); return true; },
      mutateAsync: async (id: string) => { console.log('Mock delete member async:', id); return true; },
      status: 'success',
      data: true,
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
      isIdle: false,
      reset: () => {},
      variables: undefined,
      isPaused: false,
      failureCount:0,
      failureReason: null,
      context: undefined,
      submittedAt:0,
    } as unknown as UseMutationResult<boolean, Error, string, unknown>;
  }
  return supabaseMutation;
}
