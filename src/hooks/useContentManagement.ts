import { useCallback } from 'react';
import { 
  ContentManagementState, 
  Language, 
  ContentEditRequest, 
  PageContent
} from '../types/content';
import { useContentRedux, usePageContentRedux } from './useContentRedux';

// This hook now wraps the Redux implementation for backward compatibility
// New components should use useContentRedux directly

export const useContentManagement = () => {
  // Use the Redux hook internally
  const { 
    pages, 
    sections, 
    currentLanguage, 
    isEditMode, 
    loading, 
    error,
    updatePageContent: reduxUpdatePageContent,
    updateSectionContent: reduxUpdateSectionContent,
    changeLanguage: reduxChangeLanguage,
    toggleEditMode: reduxToggleEditMode,
    saveContent: reduxSaveContent,
    exportContent: reduxExportContent,
    importContent: reduxImportContent,
    getLocalizedContent: reduxGetLocalizedContent
  } = useContentRedux();

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
