import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  ContentManagementState, 
  ContentEditRequest, 
  PageContent, 
  ContentSection,
  Language
} from '@/types/content';
import { DEFAULT_PAGES, DEFAULT_SECTIONS } from '@/data/defaultContent';
import { DEFAULT_LANGUAGE } from '@/constants/languages';
import { RootState } from '@/store/index';

// Storage key for localStorage
const STORAGE_KEY = 'nelson-tech-content';

// Initial state
const initialState: ContentManagementState = {
  pages: DEFAULT_PAGES,
  sections: DEFAULT_SECTIONS,
  currentLanguage: DEFAULT_LANGUAGE,
  isEditMode: false,
  loading: false,
  error: null
};

// Helper function to load content from localStorage
const loadFromLocalStorage = (): Partial<ContentManagementState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedContent = JSON.parse(stored);
      return {
        pages: { ...DEFAULT_PAGES, ...parsedContent.pages },
        sections: { ...DEFAULT_SECTIONS, ...parsedContent.sections }
      };
    }
  } catch (error) {
    console.error('Failed to load content from storage:', error);
  }
  return {};
};

// Helper function to save content to localStorage
const saveToLocalStorage = (pages: Record<string, PageContent>, sections: Record<string, ContentSection[]>) => {
  try {
    const contentToSave = {
      pages,
      sections,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contentToSave));
    return true;
  } catch (error) {
    console.error('Failed to save content:', error);
    return false;
  }
};

// Async thunk to initialize content
export const initializeContent = createAsyncThunk(
  'content/initialize',
  async (_, { rejectWithValue }) => {
    try {
      return loadFromLocalStorage();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize content');
    }
  }
);

// Async thunk to save content
export const saveContent = createAsyncThunk(
  'content/save',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { pages, sections } = state.content;
      const success = saveToLocalStorage(pages, sections);
      if (!success) {
        return rejectWithValue('Failed to save content');
      }
      return { success };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save content');
    }
  }
);

// Async thunk to export content
export const exportContent = createAsyncThunk(
  'content/export',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { pages, sections } = state.content;
      
      const exportData = {
        pages,
        sections,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nelson-tech-content-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export content');
    }
  }
);

// Async thunk to import content
export const importContent = createAsyncThunk(
  'content/import',
  async (file: File, { rejectWithValue }) => {
    try {
      return new Promise<{ pages: Record<string, PageContent>, sections: Record<string, ContentSection[]> }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = JSON.parse(e.target?.result as string);
            resolve({
              pages: content.pages,
              sections: content.sections
            });
          } catch (error) {
            reject('Failed to parse imported content');
          }
        };
        reader.onerror = () => reject('Failed to read file');
        reader.readAsText(file);
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import content');
    }
  }
);

// Create the slice
const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    // Update page content
    updatePageContent: (state, action: PayloadAction<ContentEditRequest>) => {
      const { pageId, field, language, content } = action.payload;
      
      if (!pageId || !field) return;
      
      const page = state.pages[pageId];
      if (!page) return;
      
      if (field === 'title' || field === 'description') {
        page[field] = {
          ...page[field],
          [language]: content
        };
      } else if (field) {
        // Ensure field is not undefined before using as an index
        (page as Record<string, unknown>)[field] = content;
      }
      
      page.lastModified = new Date().toISOString();
      page.modifiedBy = 'user'; // In real app, this would be the current user
    },
    
    // Update section content
    updateSectionContent: (state, action: PayloadAction<ContentEditRequest>) => {
      const { sectionId, language, content } = action.payload;
      
      if (!sectionId) return;
      
      // Find the section across all pages
      for (const pageId in state.sections) {
        const sections = state.sections[pageId];
        const sectionIndex = sections.findIndex(s => s.id === sectionId);
        
        if (sectionIndex !== -1) {
          const updatedSection = sections[sectionIndex];
          updatedSection.content = {
            ...updatedSection.content,
            [language]: content
          };
          updatedSection.lastModified = new Date().toISOString();
          updatedSection.modifiedBy = 'user';
          break;
        }
      }
    },
    
    // Change language
    changeLanguage: (state, action: PayloadAction<Language>) => {
      state.currentLanguage = action.payload;
    },
    
    // Toggle edit mode
    toggleEditMode: (state) => {
      state.isEditMode = !state.isEditMode;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize content
      .addCase(initializeContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeContent.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        if (action.payload.pages) {
          state.pages = action.payload.pages;
        }
        
        if (action.payload.sections) {
          state.sections = action.payload.sections;
        }
      })
      .addCase(initializeContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Save content
      .addCase(saveContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveContent.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Import content
      .addCase(importContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(importContent.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        if (action.payload.pages) {
          state.pages = {
            ...state.pages,
            ...action.payload.pages
          };
        }
        
        if (action.payload.sections) {
          state.sections = {
            ...state.sections,
            ...action.payload.sections
          };
        }
      })
      .addCase(importContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { 
  updatePageContent, 
  updateSectionContent, 
  changeLanguage, 
  toggleEditMode 
} = contentSlice.actions;

// Export selectors
export const selectPages = (state: RootState) => state.content.pages;
export const selectSections = (state: RootState) => state.content.sections;
export const selectCurrentLanguage = (state: RootState) => state.content.currentLanguage;
export const selectIsEditMode = (state: RootState) => state.content.isEditMode;
export const selectLoading = (state: RootState) => state.content.loading;
export const selectError = (state: RootState) => state.content.error;
export const selectPageById = (pageId: string) => (state: RootState) => state.content.pages[pageId];
export const selectSectionsByPageId = (pageId: string) => (state: RootState) => state.content.sections[pageId] || [];

// Export reducer
export default contentSlice.reducer;
