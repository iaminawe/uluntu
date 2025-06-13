import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useContent();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="font-medium">{currentLang?.nativeName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg z-20">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  changeLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors first:rounded-t-md last:rounded-b-md ${
                  currentLanguage === language.code 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : ''
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div>
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{language.name}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
