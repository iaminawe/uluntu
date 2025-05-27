import { configureStore } from '@reduxjs/toolkit';
import contentReducer, {
  updatePageContent,
  updateSectionContent,
  changeLanguage,
  toggleEditMode,
  initializeContent,
  saveContent,
  importContent
} from './contentSlice';
import { DEFAULT_PAGES, DEFAULT_SECTIONS } from '../../data/defaultContent';
import { DEFAULT_LANGUAGE } from '../../constants/languages';
import { ContentManagementState } from '../../types/content';

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

describe('content slice', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    mockLocalStorage.clear();
    
    store = configureStore({
      reducer: {
        content: contentReducer
      }
    });
  });
  
  it('should handle initial state', () => {
    const initialState = store.getState().content;
    
    expect(initialState).toEqual({
      pages: DEFAULT_PAGES,
      sections: DEFAULT_SECTIONS,
      currentLanguage: DEFAULT_LANGUAGE,
      isEditMode: false,
      loading: false,
      error: null
    });
  });
  
  it('should handle updatePageContent', () => {
    const pageId = 'home';
    const updatedTitle = 'Updated Home Title';
    
    store.dispatch(updatePageContent({
      pageId,
      field: 'title',
      language: 'en',
      content: updatedTitle
    }));
    
    const state = store.getState().content;
    expect(state.pages[pageId].title.en).toBe(updatedTitle);
  });
  
  it('should handle updateSectionContent', () => {
    const sectionId = 'hero-heading';
    const updatedContent = 'Updated Heading';
    
    store.dispatch(updateSectionContent({
      sectionId,
      language: 'en',
      content: updatedContent
    }));
    
    const state = store.getState().content;
    const section = state.sections.home.find(s => s.id === sectionId);
    
    expect(section).toBeDefined();
    expect(section!.content.en).toBe(updatedContent);
  });
  
  it('should handle changeLanguage', () => {
    store.dispatch(changeLanguage('fr'));
    
    const state = store.getState().content;
    expect(state.currentLanguage).toBe('fr');
  });
  
  it('should handle toggleEditMode', () => {
    // Initial state is false
    expect(store.getState().content.isEditMode).toBe(false);
    
    // Toggle to true
    store.dispatch(toggleEditMode());
    expect(store.getState().content.isEditMode).toBe(true);
    
    // Toggle back to false
    store.dispatch(toggleEditMode());
    expect(store.getState().content.isEditMode).toBe(false);
  });
  
  it('should handle initializeContent', async () => {
    // Setup mock localStorage with content
    const mockContent = {
      pages: {
        custom: {
          id: 'custom',
          title: { en: 'Custom Page' },
          description: { en: 'Custom page description' },
          lastModified: new Date().toISOString(),
          modifiedBy: 'user'
        }
      },
      sections: {}
    };
    
    mockLocalStorage.getItem.mockImplementationOnce(() => JSON.stringify(mockContent));
    
    await store.dispatch(initializeContent());
    
    const state = store.getState().content;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pages.custom).toBeDefined();
    expect(state.pages.custom.title.en).toBe('Custom Page');
  });
  
  it('should handle saveContent', async () => {
    await store.dispatch(saveContent());
    
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const state = store.getState().content;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
  
  it('should handle importContent', async () => {
    const mockFile = new File(['{}'], 'content.json', { type: 'application/json' });
    
    await store.dispatch(importContent(mockFile));
    
    const state = store.getState().content;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pages.imported).toBeDefined();
    expect(state.pages.imported.title.en).toBe('Imported Page');
    expect(state.sections.imported).toBeDefined();
    expect(state.sections.imported[0].content.en).toBe('Imported content');
  });
});
