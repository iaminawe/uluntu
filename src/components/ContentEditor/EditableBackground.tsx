import React, { useState } from 'react';
import { Image, Palette, Check, X } from 'lucide-react';
import { useContent } from '@/shared/contexts/ContentContext';

interface EditableBackgroundProps {
  pageId: string;
  children: React.ReactNode;
  className?: string;
}

export const EditableBackground: React.FC<EditableBackgroundProps> = ({
  pageId,
  children,
  className = ''
}) => {
  const { isEditMode, getPageContent, updatePageContent } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [gradientFrom, setGradientFrom] = useState('');
  const [gradientTo, setGradientTo] = useState('');

  const pageContent = getPageContent(pageId);
  
  const handleEdit = () => {
    if (!isEditMode || !pageContent) return;
    setBackgroundImage(pageContent.backgroundImage || '');
    setGradientFrom(pageContent.gradientFrom || '#1e40af');
    setGradientTo(pageContent.gradientTo || '#7c3aed');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!pageContent) return;
    
    updatePageContent({
      pageId,
      field: 'backgroundImage',
      language: 'en', // Background settings are language-independent
      content: backgroundImage
    });
    
    updatePageContent({
      pageId,
      field: 'gradientFrom',
      language: 'en',
      content: gradientFrom
    });
    
    updatePageContent({
      pageId,
      field: 'gradientTo',
      language: 'en',
      content: gradientTo
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getBackgroundStyle = () => {
    if (!pageContent) return {};
    
    const styles: React.CSSProperties = {};
    
    if (pageContent.backgroundImage) {
      styles.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${pageContent.backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
    } else if (pageContent.gradientFrom && pageContent.gradientTo) {
      styles.background = `linear-gradient(135deg, ${pageContent.gradientFrom}, ${pageContent.gradientTo})`;
    }
    
    return styles;
  };

  if (isEditing) {
    return (
      <div className={`relative ${className}`} style={getBackgroundStyle()}>
        <div className="absolute inset-0 bg-black/50 z-10">
          <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg z-20 max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Edit Background
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={backgroundImage}
                  onChange={(e) => setBackgroundImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Gradient From
                  </label>
                  <input
                    type="color"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Gradient To
                  </label>
                  <input
                    type="color"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={getBackgroundStyle()}>
      {isEditMode && (
        <button
          onClick={handleEdit}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Edit Background"
        >
          <div className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            <Palette className="h-4 w-4" />
          </div>
        </button>
      )}
      {children}
    </div>
  );
};
