import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  initializeContent,
  saveContent,
  exportContent,
  importContent,
  updatePageContent,
  updateSectionContent,
  changeLanguage,
  toggleEditMode,
  selectPages,
  selectSections,
  selectCurrentLanguage,
  selectIsEditMode,
  selectLoading,
  selectError,
  selectPageById,
  selectSectionsByPageId
} from '../redux/slices/contentSlice';
import { ContentEditRequest, Language, PageContent, ContentSection } from '../types/content';

/**
 * Hook for accessing and managing content throughout the application
 */
export function useContentRedux() {
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);
  const sections = useAppSelector(selectSections);
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const isEditMode = useAppSelector(selectIsEditMode);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // Initialize content on mount
  useEffect(() => {
    dispatch(initializeContent());
  }, [dispatch]);

  // Update page content
  const handleUpdatePageContent = useCallback((request: ContentEditRequest) => {
    dispatch(updatePageContent(request));
  }, [dispatch]);

  // Update section content
  const handleUpdateSectionContent = useCallback((request: ContentEditRequest) => {
    dispatch(updateSectionContent(request));
  }, [dispatch]);

  // Change language
  const handleChangeLanguage = useCallback((language: Language) => {
    dispatch(changeLanguage(language));
  }, [dispatch]);

  // Toggle edit mode
  const handleToggleEditMode = useCallback(() => {
    dispatch(toggleEditMode());
  }, [dispatch]);

  // Save content
  const handleSaveContent = useCallback(() => {
    return dispatch(saveContent());
  }, [dispatch]);

  // Export content
  const handleExportContent = useCallback(() => {
    return dispatch(exportContent());
  }, [dispatch]);

  // Import content
  const handleImportContent = useCallback((file: File) => {
    return dispatch(importContent(file));
  }, [dispatch]);

  // Get localized content
  const getLocalizedContent = useCallback((
    content: Record<string, string>,
    language: Language = currentLanguage
  ): string => {
    return content[language] || content['en'] || '';
  }, [currentLanguage]);

  return {
    // State
    pages,
    sections,
    currentLanguage,
    isEditMode,
    loading,
    error,
    
    // Actions
    updatePageContent: handleUpdatePageContent,
    updateSectionContent: handleUpdateSectionContent,
    changeLanguage: handleChangeLanguage,
    toggleEditMode: handleToggleEditMode,
    saveContent: handleSaveContent,
    exportContent: handleExportContent,
    importContent: handleImportContent,
    
    // Helpers
    getLocalizedContent
  };
}

/**
 * Hook for accessing and managing content for a specific page
 */
export function usePageContentRedux(pageId: string) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(selectPageById(pageId));
  const sections = useAppSelector(selectSectionsByPageId(pageId));
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const isEditMode = useAppSelector(selectIsEditMode);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // Get localized content
  const getLocalizedContent = useCallback((
    content: Record<string, string>,
    language: Language = currentLanguage
  ): string => {
    return content[language] || content['en'] || '';
  }, [currentLanguage]);

  // Update page content
  const handleUpdatePageContent = useCallback((field: ContentEditRequest['field'], content: string) => {
    if (!field) return;
    
    dispatch(updatePageContent({
      pageId,
      field,
      language: currentLanguage,
      content
    }));
  }, [dispatch, pageId, currentLanguage]);

  // Update section content
  const handleUpdateSectionContent = useCallback((sectionId: string, content: string) => {
    dispatch(updateSectionContent({
      sectionId,
      language: currentLanguage,
      content
    }));
  }, [dispatch, currentLanguage]);

  // Get section content
  const getSectionContent = useCallback((sectionKey: string): string => {
    const section = sections.find(s => s.sectionKey === sectionKey);
    return section ? getLocalizedContent(section.content) : '';
  }, [sections, getLocalizedContent]);

  // Get section by key
  const getSectionByKey = useCallback((sectionKey: string): ContentSection | undefined => {
    return sections.find(s => s.sectionKey === sectionKey);
  }, [sections]);

  return {
    // State
    page,
    sections,
    currentLanguage,
    isEditMode,
    loading,
    error,
    
    // Actions
    updatePageContent: handleUpdatePageContent,
    updateSectionContent: handleUpdateSectionContent,
    
    // Helpers
    getLocalizedContent,
    getSectionContent,
    getSectionByKey
  };
}

/**
 * Hook for accessing and managing content for a specific section
 */
export function useSectionContentRedux(pageId: string, sectionKey: string) {
  const sections = useAppSelector(selectSectionsByPageId(pageId));
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const isEditMode = useAppSelector(selectIsEditMode);
  const dispatch = useAppDispatch();

  const section = sections.find(s => s.sectionKey === sectionKey);

  // Get localized content
  const getLocalizedContent = useCallback((
    content: Record<string, string>,
    language: Language = currentLanguage
  ): string => {
    return content[language] || content['en'] || '';
  }, [currentLanguage]);

  // Update section content
  const updateContent = useCallback((content: string) => {
    if (!section) return;
    
    dispatch(updateSectionContent({
      sectionId: section.id,
      language: currentLanguage,
      content
    }));
  }, [dispatch, section, currentLanguage]);

  // Get current content
  const content = section ? getLocalizedContent(section.content) : '';

  return {
    section,
    content,
    isEditMode,
    currentLanguage,
    updateContent,
    getLocalizedContent
  };
}
