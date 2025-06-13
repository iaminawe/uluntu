import React, { createContext, useContext, ReactNode } from 'react';
import { useContentManagement } from '../hooks/useContentManagement';
import { 
  Language, 
  ContentEditRequest, 
  PageContent,
  ContentManagementState 
} from '../types/content';

interface ContentContextType extends ContentManagementState {
  getLocalizedContent: (content: Record<string, string>, language?: Language) => string;
  getPageContent: (pageId: string) => PageContent | null;
  getSectionContent: (pageId: string, sectionKey: string) => string;
  updatePageContent: (request: ContentEditRequest) => void;
  updateSectionContent: (request: ContentEditRequest) => void;
  changeLanguage: (language: Language) => void;
  toggleEditMode: () => void;
  saveContent: () => void;
  exportContent: () => void;
  importContent: (file: File) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const contentManagement = useContentManagement();

  return (
    <ContentContext.Provider value={contentManagement}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
