import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { 
  fetchMembers, 
  fetchMemberById, 
  fetchFilteredMembers,
  createMember,
  updateMember,
  deleteMember,
  setFilters,
  clearFilters,
  MemberFilters,
  Member
} from '@/features/directory/store/membersSlice';
import { MemberInput } from '@/features/directory/api/membersApi';

export const useMembersRedux = () => {
  const dispatch = useAppDispatch();
  const { 
    members, 
    filteredMembers,
    currentMember,
    filters, 
    status, 
    error 
  } = useAppSelector(state => state.members);

  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Dispatch actions
  const getAllMembers = useCallback(() => {
    return dispatch(fetchMembers());
  }, [dispatch]);

  const getMemberById = useCallback((id: string) => {
    return dispatch(fetchMemberById(id));
  }, [dispatch]);

  const getFilteredMembers = useCallback((memberFilters: MemberFilters) => {
    dispatch(setFilters(memberFilters));
    return dispatch(fetchFilteredMembers(memberFilters));
  }, [dispatch]);

  const addMember = useCallback((memberData: MemberInput) => {
    return dispatch(createMember(memberData));
  }, [dispatch]);

  const editMember = useCallback((id: string, data: Partial<MemberInput>) => {
    return dispatch(updateMember({ id, data }));
  }, [dispatch]);

  const removeMember = useCallback((id: string) => {
    return dispatch(deleteMember(id));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
    return dispatch(fetchMembers());
  }, [dispatch]);

  return {
    // State
    members,
    filteredMembers,
    currentMember,
    filters,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    
    // Actions
    getAllMembers,
    getMemberById,
    getFilteredMembers,
    addMember,
    editMember,
    removeMember,
    resetFilters
  };
};

// Helper hook to fetch and work with a single member
export const useMemberRedux = (id?: string) => {
  const dispatch = useAppDispatch();
  const { currentMember, status, error } = useAppSelector(state => state.members);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  const getMember = useCallback(() => {
    if (id) {
      return dispatch(fetchMemberById(id));
    }
    return Promise.resolve();
  }, [dispatch, id]);

  const updateMemberData = useCallback((data: Partial<MemberInput>) => {
    if (id) {
      return dispatch(updateMember({ id, data }));
    }
    return Promise.resolve();
  }, [dispatch, id]);

  const deleteMemberById = useCallback(() => {
    if (id) {
      return dispatch(deleteMember(id));
    }
    return Promise.resolve();
  }, [dispatch, id]);

  return {
    member: currentMember as Member | null,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    getMember,
    updateMemberData,
    deleteMemberById
  };
};

// Helper hook for filtered members with pagination support
export const useFilteredMembersRedux = (initialFilters?: MemberFilters) => {
  const dispatch = useAppDispatch();
  const { filteredMembers, filters, status, error } = useAppSelector(state => state.members);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  const applyFilters = useCallback((newFilters: MemberFilters) => {
    dispatch(setFilters(newFilters));
    return dispatch(fetchFilteredMembers(newFilters));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
    return dispatch(fetchMembers());
  }, [dispatch]);

  // Initialize with filters if provided
  const initializeFilters = useCallback(() => {
    if (initialFilters) {
      return dispatch(fetchFilteredMembers(initialFilters));
    }
    return dispatch(fetchMembers());
  }, [dispatch, initialFilters]);

  return {
    members: filteredMembers,
    currentFilters: filters,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    applyFilters,
    clearAllFilters,
    initializeFilters
  };
};
