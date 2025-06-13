import {
  createSlice,
  createAsyncThunk,
  PayloadAction
} from '@reduxjs/toolkit';
import { membersApi, MemberInput } from '@/features/directory/api/membersApi';
import allMockData from '../../data/mock/mockData';
import { ContentStatus } from '../../types/common';

// Define Member type for the Redux state
export interface Member {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  image?: string;
  role?: string; // Maps to title in the API
  title?: string; // Added for UI compatibility
  skills?: string[];
  joinDate?: string;
  joinedDate?: string;
  created_at?: string;
  status?: ContentStatus;
  featured?: boolean;
  company?: string;
}

// Type guard helpers
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// Helper function to convert between API Member and our UI Member
export function adaptMember(data: unknown): Member {
  // Cast to a record to safely access properties
  const member = data as Record<string, unknown>;
  
  return {
    id: isString(member.id) ? member.id : String(member.id),
    name: isString(member.name) ? member.name : '',
    email: isString(member.email) ? member.email : undefined,
    bio: isString(member.bio) ? member.bio : undefined,
    image: isString(member.image) ? member.image : undefined,
    role: isString(member.title) ? member.title : 
          isString(member.role) ? member.role : undefined,
    title: isString(member.title) ? member.title : 
           isString(member.role) ? member.role : undefined,
    skills: isArray(member.skills) ? 
            (member.skills as unknown[]).filter(isString) as string[] : [],
    // Support both joinDate (API) and joinedDate (mock)
    joinDate: isString(member.joinDate) ? member.joinDate :
              isString(member.joinedDate) ? member.joinedDate :
              isString(member.joined_date) ? member.joined_date : undefined,
    joinedDate: isString(member.joinedDate) ? member.joinedDate :
               isString(member.joined_date) ? member.joined_date :
               isString(member.joinDate) ? member.joinDate : undefined,
    created_at: isString(member.created_at) ? member.created_at : undefined,
    status: isString(member.status) ? member.status as ContentStatus : undefined,
    featured: isBoolean(member.featured) ? member.featured : undefined,
    company: isString(member.company) ? member.company : undefined
  };
}

export interface MemberFilters {
  search?: string;
  skills?: string[];
}

export interface MembersState {
  members: Member[];
  currentMember: Member | null;
  filteredMembers: Member[];
  filters: MemberFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MembersState = {
  members: [],
  currentMember: null,
  filteredMembers: [],
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks for members
export const fetchMembers = createAsyncThunk(
  'members/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const members = await membersApi.getAll();
        return members.map(m => adaptMember(m));
      } else {
        // Use mock data
        return allMockData.members.map(m => adaptMember(m));
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch members');
    }
  }
);

export const fetchMemberById = createAsyncThunk(
  'members/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (!id) {
        return undefined;
      }

      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const member = await membersApi.getById(id);
        return member ? adaptMember(member) : undefined;
      } else {
        // Find in mock data
        const member = allMockData.members.find((m) => String(m.id) === id);
        return member ? adaptMember(member) : undefined;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch member with ID ${id}`);
    }
  }
);

export const fetchFilteredMembers = createAsyncThunk(
  'members/fetchFiltered',
  async (filters: MemberFilters, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const members = await membersApi.getAll(filters);
        return members.map(m => adaptMember(m));
      } else {
        // Filter mock data
        let filteredMembers = [...allMockData.members];
        
        // Apply search filter
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredMembers = filteredMembers.filter((m) => {
            return (
              (m.name || '').toLowerCase().includes(searchTerm) ||
              (m.title || m.role || '').toLowerCase().includes(searchTerm) ||
              (m.bio || '').toLowerCase().includes(searchTerm)
            );
          });
        }
        
        // Apply skills filter
        if (filters?.skills && filters.skills.length > 0) {
          filteredMembers = filteredMembers.filter((m) => {
            if (!m.skills || !Array.isArray(m.skills)) return false;
            return filters.skills?.some(skill => m.skills?.includes(skill)) ?? false;
          });
        }
        
        return filteredMembers.map(m => adaptMember(m));
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered members');
    }
  }
);

export const createMember = createAsyncThunk(
  'members/create',
  async (memberData: MemberInput, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const member = await membersApi.create(memberData);
        return member ? adaptMember(member) : null;
      } else {
        // Mock creation
        console.log('Mock creating member:', memberData);
        
        // Generate a mock response with a new ID
        const newId = String(Date.now());
        const newMember = {
          id: newId,
          name: memberData.name || '',
          email: `${(memberData.name || '').toLowerCase().replace(/\s+/g, '.')}@example.com`,
          bio: memberData.bio || '',
          image: memberData.image || '',
          title: memberData.title || '',
          role: memberData.title || '',
          skills: [],
          joinDate: new Date().toISOString(),
          joinedDate: new Date().toISOString(),
          created_at: new Date().toISOString(),
          status: memberData.status || 'published' as ContentStatus,
          featured: memberData.featured || false
        };
        
        // Add to mock data (this is just for simulation)
        allMockData.members.unshift(newMember);
        
        return adaptMember(newMember);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create member');
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/update',
  async ({ id, data }: { id: string; data: Partial<MemberInput> }, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const member = await membersApi.update(id, data);
        return member ? adaptMember(member) : null;
      } else {
        // Mock update
        console.log('Mock updating member:', id, data);
        
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
          role: data.title !== undefined ? data.title : originalMember.role,
          status: data.status !== undefined ? data.status : originalMember.status,
          featured: data.featured !== undefined ? data.featured : originalMember.featured,
        };
        
        // Update in the mock data
        allMockData.members[memberIndex] = updatedMember;
        
        return adaptMember(updatedMember);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to update member with ID ${id}`);
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
      
      if (useSupabase) {
        const success = await membersApi.delete(id);
        return success ? id : null;
      } else {
        console.log('Mock deleting member with ID:', id);
        
        // Find the member to delete
        const memberIndex = allMockData.members.findIndex(m => String(m.id) === id);
        if (memberIndex === -1) {
          console.warn(`Member with id ${id} not found for deletion`);
          return null;
        }
        
        // Remove from mock data
        allMockData.members.splice(memberIndex, 1);
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to delete member with ID ${id}`);
    }
  }
);

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<MemberFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearMembers(state) {
      state.members = [];
      state.filteredMembers = [];
      state.currentMember = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Handle fetchMembers
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.members = action.payload as Member[];
        state.error = null;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle fetchMemberById
    builder
      .addCase(fetchMemberById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentMember = action.payload as Member;
        state.error = null;
      })
      .addCase(fetchMemberById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle fetchFilteredMembers
    builder
      .addCase(fetchFilteredMembers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredMembers = action.payload as Member[];
        state.error = null;
      })
      .addCase(fetchFilteredMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle createMember
    builder
      .addCase(createMember.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.members.unshift(action.payload as Member);
        }
        state.error = null;
      })
      .addCase(createMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle updateMember
    builder
      .addCase(updateMember.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          const updatedMember = action.payload as Member;
          const index = state.members.findIndex(m => m.id === updatedMember.id);
          if (index !== -1) {
            state.members[index] = updatedMember;
          }
          // Also update currentMember if it's the same member
          if (state.currentMember && state.currentMember.id === updatedMember.id) {
            state.currentMember = updatedMember;
          }
          // Update in filteredMembers if present
          const filteredIndex = state.filteredMembers.findIndex(m => m.id === updatedMember.id);
          if (filteredIndex !== -1) {
            state.filteredMembers[filteredIndex] = updatedMember;
          }
        }
        state.error = null;
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
    
    // Handle deleteMember
    builder
      .addCase(deleteMember.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const id = action.payload as string;
        if (id) {
          state.members = state.members.filter(m => m.id !== id);
          state.filteredMembers = state.filteredMembers.filter(m => m.id !== id);
          if (state.currentMember && state.currentMember.id === id) {
            state.currentMember = null;
          }
        }
        state.error = null;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, clearFilters, clearMembers } = membersSlice.actions;

export default membersSlice.reducer;
