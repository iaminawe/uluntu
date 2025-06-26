import React, { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Download, 
  Upload,
  Clock,
  Edit2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Theme } from './types';

interface ThemeManagerProps {
  currentTheme: Theme;
  savedThemes: Theme[];
  onSaveTheme: (theme: Theme) => void;
  onLoadTheme: (theme: Theme) => void;
  onDeleteTheme: (themeName: string) => void;
}

export default function ThemeManager({
  currentTheme,
  savedThemes,
  onSaveTheme,
  onLoadTheme,
  onDeleteTheme
}: ThemeManagerProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [themeName, setThemeName] = useState(currentTheme.name || '');
  const [themeDescription, setThemeDescription] = useState('');
  const [editingTheme, setEditingTheme] = useState<string | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSaveTheme = () => {
    if (!themeName.trim()) return;
    
    const themeToSave: Theme = {
      ...currentTheme,
      name: themeName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSaveTheme(themeToSave);
    setShowSaveModal(false);
    setThemeName('');
    setThemeDescription('');
  };

  const handleRenameTheme = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditingTheme(null);
      return;
    }
    
    const themeToUpdate = savedThemes.find(t => t.name === oldName);
    if (themeToUpdate) {
      const updatedTheme = {
        ...themeToUpdate,
        name: newName,
        updatedAt: new Date().toISOString()
      };
      onDeleteTheme(oldName);
      onSaveTheme(updatedTheme);
    }
    
    setEditingTheme(null);
    setNewThemeName('');
  };

  const handleDeleteTheme = (themeName: string) => {
    onDeleteTheme(themeName);
    setDeleteConfirm(null);
  };

  const exportAllThemes = () => {
    const data = {
      themes: savedThemes,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `all-themes-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importThemes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.themes && Array.isArray(data.themes)) {
          data.themes.forEach((theme: Theme) => {
            onSaveTheme(theme);
          });
          alert(`Successfully imported ${data.themes.length} themes`);
        }
      } catch (error) {
        console.error('Failed to import themes:', error);
        alert('Failed to import themes. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Theme Manager</h4>
            <p className="text-sm text-gray-500 mt-1">Save and manage your custom themes</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importThemes}
                className="hidden"
              />
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload className="h-5 w-5" />
              </div>
            </label>
            
            <button
              onClick={exportAllThemes}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Export All Themes"
              disabled={savedThemes.length === 0}
            >
              <Download className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center text-sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Current
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {savedThemes.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No saved themes yet</p>
            <p className="text-sm text-gray-400 mt-1">Save your current theme to build a collection</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedThemes.map((theme) => (
              <div
                key={theme.name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  {editingTheme === theme.name ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newThemeName}
                        onChange={(e) => setNewThemeName(e.target.value)}
                        placeholder={theme.name}
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameTheme(theme.name, newThemeName)}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTheme(null);
                          setNewThemeName('');
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-medium text-gray-900">{theme.name}</h5>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(theme.updatedAt || theme.createdAt)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  {/* Color Preview */}
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200" 
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200" 
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200" 
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onLoadTheme(theme)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Load Theme"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingTheme(theme.name);
                        setNewThemeName(theme.name);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Rename Theme"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    {deleteConfirm === theme.name ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDeleteTheme(theme.name)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                          title="Confirm Delete"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(theme.name)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete Theme"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Save Theme Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Theme</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Name
                  </label>
                  <input
                    type="text"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="Enter theme name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={themeDescription}
                    onChange={(e) => setThemeDescription(e.target.value)}
                    placeholder="Add a description for this theme"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                {/* Theme Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-200" 
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-200" 
                        style={{ backgroundColor: currentTheme.colors.secondary }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-200" 
                        style={{ backgroundColor: currentTheme.colors.accent }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {currentTheme.typography.fontFamily}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setThemeName('');
                    setThemeDescription('');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTheme}
                  disabled={!themeName.trim()}
                  className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  Save Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <p>Saved themes are stored locally in your browser. Export themes to back them up or share with others.</p>
          </div>
        </div>
      </div>
    </div>
  );
}