import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Eye, 
  EyeOff,
  RefreshCw,
  FileText,
  X
} from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { LanguageSelector } from './LanguageSelector';

export const ContentManagementPanel: React.FC = () => {
  const { 
    isEditMode, 
    toggleEditMode, 
    saveContent, 
    exportContent, 
    importContent,
    pages,
    sections
  } = useContent();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importContent(file);
      event.target.value = ''; // Reset input
    }
  };

  const getContentStats = () => {
    const pageCount = Object.keys(pages).length;
    const sectionCount = Object.values(sections).reduce((total, pageSections) => total + pageSections.length, 0);
    const totalTranslations = Object.values(pages).reduce((total, page) => {
      const titleTranslations = Object.keys(page.title).length;
      const descriptionTranslations = Object.keys(page.description).length;
      return total + titleTranslations + descriptionTranslations;
    }, 0) + Object.values(sections).reduce((total, pageSections) => {
      return total + pageSections.reduce((sectionTotal, section) => {
        return sectionTotal + Object.keys(section.content).length;
      }, 0);
    }, 0);

    return { pageCount, sectionCount, totalTranslations };
  };

  const stats = getContentStats();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Content Management"
      >
        <Settings className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Content Management
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            Current Language
          </label>
          <LanguageSelector />
        </div>

        {/* Edit Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Edit Mode
          </span>
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isEditMode 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isEditMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isEditMode ? 'Exit Edit' : 'Start Edit'}
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={saveContent}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportContent}
              className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <label className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors cursor-pointer text-sm">
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Content Statistics */}
        <div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            <FileText className="h-4 w-4" />
            Content Statistics
            <RefreshCw className={`h-3 w-3 ml-auto transition-transform ${showStats ? 'rotate-180' : ''}`} />
          </button>

          {showStats && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Pages:</span>
                  <span className="font-medium">{stats.pageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sections:</span>
                  <span className="font-medium">{stats.sectionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Translations:</span>
                  <span className="font-medium">{stats.totalTranslations}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        {isEditMode && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Edit Mode Active</p>
            <p>Click on any text to edit. Use the background edit button on hero sections to change images and gradients.</p>
          </div>
        )}
      </div>
    </div>
  );
};
