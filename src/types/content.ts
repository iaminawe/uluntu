export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

export interface LocalizedText {
  [key: string]: string;
}

export interface PageContent {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  backgroundImage?: string;
  gradientFrom?: string;
  gradientTo?: string;
  lastModified: string;
  modifiedBy: string;
}

export interface ContentSection {
  id: string;
  pageId: string;
  sectionKey: string;
  content: LocalizedText;
  type: 'text' | 'heading' | 'button' | 'description';
  lastModified: string;
  modifiedBy: string;
}

export interface ContentManagementState {
  pages: Record<string, PageContent>;
  sections: Record<string, ContentSection[]>;
  currentLanguage: Language;
  isEditMode: boolean;
  loading: boolean;
  error: string | null;
}

export interface ContentEditRequest {
  pageId?: string;
  sectionId?: string;
  language: Language;
  content: string;
  field?: 'title' | 'description' | 'backgroundImage' | 'gradientFrom' | 'gradientTo';
}

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}
