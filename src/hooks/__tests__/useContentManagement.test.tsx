/**
 * @jest-environment jsdom
 */

import { configureStore } from '@reduxjs/toolkit';
import contentReducer, {
  initializeContent,
  updatePageContent,
  updateSectionContent,
  changeLanguage,
  toggleEditMode,
  saveContent
} from '@/store/contentSlice';
import { DEFAULT_PAGES, DEFAULT_SECTIONS } from '../../data/defaultContent';
import { DEFAULT_LANGUAGE } from '../../constants/languages';
import { RootState } from '@/store/index';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock for URL and document operations in exportContent
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

const mockAnchorElement = {
  href: '',
  download: '',
  click: mockClick
};

Object.defineProperty(global.document, 'createElement', {
  value: jest.fn(() => mockAnchorElement),
  writable: true
});

Object.defineProperty(global.document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
});

Object.defineProperty(global.document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
});

// Mock FileReader for importContent
const mockFileReader = {
  onload: null as any,
  readAsText: jest.fn(function(this: any, file: Blob) {
    if (this.onload) {
      const event = { target: { result: JSON.stringify({
        pages: {
          imported: {
            id: 'imported',
            title: { en: 'Imported Page' },
            description: { en: 'This is an imported page' },
            lastModified: new Date().toISOString(),
            modifiedBy: 'user'
          }
        },
        sections: {
          imported: [{
            id: 'imported-section',
            pageId: 'imported',
            sectionKey: 'imported.section',
            type: 'text',
            content: { en: 'Imported content' },
            lastModified: new Date().toISOString(),
            modifiedBy: 'user'
          }]
        }
      })} };
      this.onload(event);
    }
  })
};

(global as any).FileReader = jest.fn(() => mockFileReader);

// Helper function to create a test store
function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      content: contentReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false
    })
  });
}

describe('useContentManagement Redux Integration', () => {
  let store: ReturnType<typeof createTestStore>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    // Create a fresh store for each test
    store = createTestStore({
      content: {
        pages: DEFAULT_PAGES,
        sections: DEFAULT_SECTIONS,
        currentLanguage: DEFAULT_LANGUAGE,
        isEditMode: false,
        loading: false,
        error: null
      }
    });
  });
  
  it('should initialize content with default values', () => {
    // Dispatch the initialize action
    store.dispatch(initializeContent());
    
    // Get the current state
    const state = store.getState().content;
    
    // Verify the state matches expected values
    expect(state.pages).toEqual(DEFAULT_PAGES);
    expect(state.sections).toEqual(DEFAULT_SECTIONS);
    expect(state.currentLanguage).toBe(DEFAULT_LANGUAGE);
    expect(state.isEditMode).toBe(false);
  });
  
  it('should toggle edit mode', () => {
    // Initial state should have edit mode as false
    expect(store.getState().content.isEditMode).toBe(false);
    
    // Toggle edit mode
    store.dispatch(toggleEditMode());
    
    // Edit mode should now be true
    expect(store.getState().content.isEditMode).toBe(true);
    
    // Toggle edit mode again
    store.dispatch(toggleEditMode());
    
    // Edit mode should now be false again
    expect(store.getState().content.isEditMode).toBe(false);
  });
  
  it('should change language', () => {
    // Initial language should be the default
    expect(store.getState().content.currentLanguage).toBe(DEFAULT_LANGUAGE);
    
    // Change language to French
    store.dispatch(changeLanguage('fr'));
    
    // Language should now be 'fr'
    expect(store.getState().content.currentLanguage).toBe('fr');
  });
  
  it('should update page content', () => {
    // Initial page title
    expect(store.getState().content.pages.home.title.en).toBe(DEFAULT_PAGES.home.title.en);
    
    // Update the page title
    store.dispatch(updatePageContent({
      pageId: 'home',
      field: 'title',
      language: 'en',
      content: 'Updated Title'
    }));
    
    // Page title should now be updated
    expect(store.getState().content.pages.home.title.en).toBe('Updated Title');
  });
  
  it('should update section content', () => {
    // Find a section to update
    const section = store.getState().content.sections.home[0];
    const originalContent = section.content.en;
    
    // Update the section content
    store.dispatch(updateSectionContent({
      sectionId: section.id,
      language: 'en',
      content: 'Updated Section Content'
    }));
    
    // Get the updated section
    const updatedSection = store.getState().content.sections.home.find(s => s.id === section.id);
    
    // Section content should be updated
    expect(updatedSection?.content.en).toBe('Updated Section Content');
    expect(updatedSection?.content.en).not.toBe(originalContent);
  });
  
  it('should save content to localStorage', () => {
    // Dispatch save content action
    store.dispatch(saveContent());
    
    // localStorage.setItem should have been called
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });
});
