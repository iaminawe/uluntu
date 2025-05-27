import { useState, useEffect, useCallback } from 'react';
import { 
  ContentManagementState, 
  Language, 
  ContentEditRequest, 
  PageContent
  // ContentSection - removed unused import
} from '../types/content';
import { DEFAULT_PAGES, DEFAULT_SECTIONS } from '../data/defaultContent';
import { DEFAULT_LANGUAGE } from '../constants/languages';

const STORAGE_KEY = 'nelson-tech-content';

export const useContentManagement = () => {
  const [state, setState] = useState<ContentManagementState>({
    pages: DEFAULT_PAGES,
    sections: DEFAULT_SECTIONS,
    currentLanguage: DEFAULT_LANGUAGE,
    isEditMode: false,
    loading: false,
    error: null
  });

  // Load content from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedContent = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          pages: { ...DEFAULT_PAGES, ...parsedContent.pages },
          sections: { ...DEFAULT_SECTIONS, ...parsedContent.sections }
        }));
      }
    } catch (error) {
      console.error('Failed to load content from storage:', error);
    }
  }, []);

  // Save content to localStorage
  const saveContent = useCallback(() => {
    try {
      const contentToSave = {
        pages: state.pages,
        sections: state.sections,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contentToSave));
    } catch (error) {
      console.error('Failed to save content:', error);
      setState(prev => ({ ...prev, error: 'Failed to save content' }));
    }
  }, [state.pages, state.sections]);

  // Get localized content
  const getLocalizedContent = useCallback((
    content: Record<string, string>, 
    language: Language = state.currentLanguage
  ): string => {
    return content[language] || content[DEFAULT_LANGUAGE] || '';
  }, [state.currentLanguage]);

  // Get page content
  const getPageContent = useCallback((pageId: string): PageContent | null => {
    return state.pages[pageId] || null;
  }, [state.pages]);

  // Get section content
  const getSectionContent = useCallback((pageId: string, sectionKey: string): string => {
    const sections = state.sections[pageId] || [];
    const section = sections.find(s => s.sectionKey === sectionKey);
    return section ? getLocalizedContent(section.content) : '';
  }, [state.sections, getLocalizedContent]);

  // Update page content
  const updatePageContent = useCallback((request: ContentEditRequest) => {
    if (!request.pageId || !request.field) return;

    setState(prev => {
      const updatedPages = { ...prev.pages };
      const page = updatedPages[request.pageId!];
      
      if (!page) return prev;

      const updatedPage = { ...page };
      
      if (request.field === 'title' || request.field === 'description') {
        updatedPage[request.field] = {
          ...updatedPage[request.field],
          [request.language]: request.content
        };
      } else if (request.field) {
        // Ensure field is not undefined before using as an index
        // Use a type-safe approach instead of 'any'
        (updatedPage as Record<string, unknown>)[request.field] = request.content;
      }
      
      updatedPage.lastModified = new Date().toISOString();
      updatedPage.modifiedBy = 'user'; // In real app, this would be the current user
      
      updatedPages[request.pageId!] = updatedPage;
      
      return {
        ...prev,
        pages: updatedPages
      };
    });
  }, []);

  // Update section content
  const updateSectionContent = useCallback((request: ContentEditRequest) => {
    if (!request.sectionId) return;

    setState(prev => {
      const updatedSections = { ...prev.sections };
      
      // Find the section across all pages
      for (const pageId in updatedSections) {
        const sections = updatedSections[pageId];
        const sectionIndex = sections.findIndex(s => s.id === request.sectionId);
        
        if (sectionIndex !== -1) {
          const updatedPageSections = [...sections];
          const updatedSection = {
            ...updatedPageSections[sectionIndex],
            content: {
              ...updatedPageSections[sectionIndex].content,
              [request.language]: request.content
            },
            lastModified: new Date().toISOString(),
            modifiedBy: 'user'
          };
          
          updatedPageSections[sectionIndex] = updatedSection;
          updatedSections[pageId] = updatedPageSections;
          break;
        }
      }
      
      return {
        ...prev,
        sections: updatedSections
      };
    });
  }, []);

  // Change language
  const changeLanguage = useCallback((language: Language) => {
    setState(prev => ({ ...prev, currentLanguage: language }));
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setState(prev => ({ ...prev, isEditMode: !prev.isEditMode }));
  }, []);

  // Export content
  const exportContent = useCallback(() => {
    const exportData = {
      pages: state.pages,
      sections: state.sections,
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
  }, [state.pages, state.sections]);

  // Import content
  const importContent = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        setState(prev => ({
          ...prev,
          pages: { ...prev.pages, ...content.pages },
          sections: { ...prev.sections, ...content.sections }
        }));
      } catch {
        // Catch without parameter to avoid unused variable warnings
        setState(prev => ({ ...prev, error: 'Failed to import content' }));
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    ...state,
    getLocalizedContent,
    getPageContent,
    getSectionContent,
    updatePageContent,
    updateSectionContent,
    changeLanguage,
    toggleEditMode,
    saveContent,
    exportContent,
    importContent
  };
};
