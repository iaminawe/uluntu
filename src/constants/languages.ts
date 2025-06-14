import { LanguageConfig } from '../types/content';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  }
];

export const DEFAULT_LANGUAGE = 'en';

// Simple language mapping for admin settings
export const LANGUAGES = {
  en: 'English',
  es: 'Spanish', 
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese'
} as const;
