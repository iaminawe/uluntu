import { useCallback } from 'react';
import { 
  ContentManagementState, 
  Language, 
  ContentEditRequest, 
  PageContent
} from '../types/content';
// import { useContentRedux, usePageContentRedux } from './useContentRedux';

// This hook now wraps the Redux implementation for backward compatibility
// New components should use useContentRedux directly

export const useContentManagement = () => {
  // Temporary stub implementation until useContentRedux is available
  const pages = {};
  const sections = {};
  const currentLanguage: Language = 'en';
  const isEditMode = false;
  const loading = false;
  const error = null;
  
  const reduxUpdatePageContent = useCallback((request: ContentEditRequest) => {
    console.warn('updatePageContent not implemented');
  }, []);
  
  const reduxUpdateSectionContent = useCallback((request: ContentEditRequest) => {
    console.warn('updateSectionContent not implemented');
  }, []);
  
  const reduxChangeLanguage = useCallback((language: Language) => {
    console.warn('changeLanguage not implemented');
  }, []);
  
  const reduxToggleEditMode = useCallback(() => {
    console.warn('toggleEditMode not implemented');
  }, []);
  
  const reduxSaveContent = useCallback(() => {
    console.warn('saveContent not implemented');
  }, []);
  
  const reduxExportContent = useCallback(() => {
    console.warn('exportContent not implemented');
  }, []);
  
  const reduxImportContent = useCallback((file: File) => {
    console.warn('importContent not implemented');
  }, []);
  
  const reduxGetLocalizedContent = useCallback((content: Record<string, string>, language?: Language): string => {
    const lang = language || currentLanguage;
    return content[lang] || content['en'] || '';
  }, [currentLanguage]);

  // Save content wrapper function
  const saveContent = useCallback(() => {
    reduxSaveContent();
  }, [reduxSaveContent]);

  // Get localized content wrapper function
  const getLocalizedContent = useCallback((content: Record<string, string>, language?: Language): string => {
    return reduxGetLocalizedContent(content, language);
  }, [reduxGetLocalizedContent]);

  // Get page content wrapper function
  const getPageContent = useCallback((pageId: string): PageContent | null => {
    return pages[pageId] || null;
  }, [pages]);

  // Get section content wrapper function
  const getSectionContent = useCallback((pageId: string, sectionKey: string): string => {
    const pageSections = sections[pageId] || [];
    const section = pageSections.find(s => s.sectionKey === sectionKey);
    return section ? getLocalizedContent(section.content) : '';
  }, [sections, getLocalizedContent]);

  // Update page content wrapper function
  const updatePageContent = useCallback((request: ContentEditRequest) => {
    reduxUpdatePageContent(request);
  }, [reduxUpdatePageContent]);

  // Update section content wrapper function
  const updateSectionContent = useCallback((request: ContentEditRequest) => {
    reduxUpdateSectionContent(request);
  }, [reduxUpdateSectionContent]);

  // Change language wrapper function
  const changeLanguage = useCallback((language: Language) => {
    reduxChangeLanguage(language);
  }, [reduxChangeLanguage]);

  // Toggle edit mode wrapper function
  const toggleEditMode = useCallback(() => {
    reduxToggleEditMode();
  }, [reduxToggleEditMode]);

  // Export content wrapper function
  const exportContent = useCallback(() => {
    reduxExportContent();
  }, [reduxExportContent]);

  // Import content wrapper function
  const importContent = useCallback((file: File) => {
    reduxImportContent(file);
  }, [reduxImportContent]);

  // Create a state object that mimics the original API
  const state: ContentManagementState = {
    pages,
    sections,
    currentLanguage,
    isEditMode,
    loading,
    error
  };

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
