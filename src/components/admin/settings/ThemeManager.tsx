import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Palette, 
  Upload, 
  Download,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info,
  Loader2,
  Smartphone,
  Tablet,
  Monitor,
  Moon,
  Sun,
  Copy,
  FileJson,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { themePresets, ThemePreset, generateThemeCSS, validateThemeAccessibility } from '@/lib/themes/presets';
import { useDebounce } from '@/hooks/useDebounce';

interface ThemeManagerProps {
  currentTheme?: ThemePreset;
  onThemeChange: (theme: ThemePreset) => void;
  onSave: (theme: ThemePreset) => Promise<void>;
  loading?: boolean;
}

type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
type ThemeMode = 'light' | 'dark';

export const ThemeManager: React.FC<ThemeManagerProps> = ({
  currentTheme,
  onThemeChange,
  onSave,
  loading = false
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(currentTheme || themePresets[0]);
  const [customTheme, setCustomTheme] = useState<ThemePreset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debounce theme changes for performance
  const debouncedTheme = useDebounce(selectedTheme, 300);

  // Apply theme CSS variables in real-time
  useEffect(() => {
    if (!debouncedTheme || !showPreview) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'theme-preview';
    style.innerHTML = generateThemeCSS(debouncedTheme);
    
    // Remove existing preview style
    const existing = document.getElementById('theme-preview');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(style);
    
    return () => {
      const preview = document.getElementById('theme-preview');
      if (preview) {
        preview.remove();
      }
    };
  }, [debouncedTheme, showPreview]);

  // Validate theme accessibility
  useEffect(() => {
    if (selectedTheme) {
      const validation = validateThemeAccessibility(selectedTheme);
      setValidationErrors([...validation.errors, ...validation.warnings]);
    }
  }, [selectedTheme]);

  const handleThemeSelect = (theme: ThemePreset) => {
    setSelectedTheme(theme);
    setIsEditing(false);
    onThemeChange(theme);
  };

  const handleCustomThemeChange = (updates: Partial<ThemePreset>) => {
    if (selectedTheme) {
      const updatedTheme = { ...selectedTheme, ...updates };
      setSelectedTheme(updatedTheme);
      setCustomTheme(updatedTheme);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    if (selectedTheme) {
      const updatedTheme = {
        ...selectedTheme,
        configurations: {
          ...selectedTheme.configurations,
          colors: {
            ...selectedTheme.configurations.colors,
            [colorKey]: value,
          },
        },
      };
      setSelectedTheme(updatedTheme);
      setCustomTheme(updatedTheme);
    }
  };

  const handleSave = async () => {
    if (!selectedTheme) return;
    
    setIsSaving(true);
    try {
      await onSave(selectedTheme);
      toast.success('Theme saved successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save theme');
      console.error('Save theme error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportTheme = () => {
    if (!selectedTheme) return;
    
    const exportData = {
      ...selectedTheme,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${selectedTheme.slug}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Theme exported successfully');
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTheme = JSON.parse(content) as ThemePreset;
        
        // Validate imported theme structure
        if (!importedTheme.name || !importedTheme.slug || !importedTheme.configurations?.colors) {
          throw new Error('Invalid theme file structure');
        }
        
        // Generate new slug for imported theme
        importedTheme.slug = `custom-${Date.now()}`;
        importedTheme.name = `${importedTheme.name} (Imported)`;
        
        setSelectedTheme(importedTheme);
        setCustomTheme(importedTheme);
        setIsEditing(true);
        setShowImportDialog(false);
        
        toast.success('Theme imported successfully');
      } catch (error) {
        toast.error('Failed to import theme file');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyCSS = () => {
    if (!selectedTheme) return;
    
    const css = generateThemeCSS(selectedTheme);
    navigator.clipboard.writeText(css);
    toast.success('CSS variables copied to clipboard');
  };

  const resetToDefault = () => {
    const defaultTheme = themePresets[0];
    setSelectedTheme(defaultTheme);
    setCustomTheme(null);
    setIsEditing(false);
    onThemeChange(defaultTheme);
  };

  const deviceSizes = {
    mobile: 'max-w-sm',
    tablet: 'max-w-2xl',
    desktop: 'max-w-full',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Theme Manager
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Customize your platform's visual appearance with professional themes
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Import theme"
            >
              <Upload className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleExportTheme}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Export theme"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleCopyCSS}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Copy CSS variables"
            >
              <Copy className="h-4 w-4" />
            </button>
            
            <button
              onClick={resetToDefault}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Reset to default"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading || isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Theme
            </button>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportTheme}
          className="hidden"
          aria-label="Import theme file"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Preset Themes */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Preset Themes</h4>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {themePresets.map((preset) => (
                <button
                  key={preset.slug}
                  onClick={() => handleThemeSelect(preset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTheme?.slug === preset.slug
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {preset.name}
                        {preset.name.toLowerCase().includes('dark') && <Moon className="h-3 w-3" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                    </div>
                    {selectedTheme?.slug === preset.slug && (
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  {/* Color preview */}
                  <div className="flex gap-1 mt-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-200"
                      style={{ backgroundColor: preset.configurations.colors.primary }}
                      aria-label="Primary color"
                    />
                    <div
                      className="w-6 h-6 rounded border border-gray-200"
                      style={{ backgroundColor: preset.configurations.colors.secondary }}
                      aria-label="Secondary color"
                    />
                    <div
                      className="w-6 h-6 rounded border border-gray-200"
                      style={{ backgroundColor: preset.configurations.colors.background }}
                      aria-label="Background color"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Validation Issues */}
          {validationErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-amber-900 mb-1">Accessibility Issues</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Editor */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTheme && (
            <>
              {/* Color Editor */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Color Palette</h4>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {isEditing ? 'Cancel Editing' : 'Edit Colors'}
                  </button>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(selectedTheme.configurations.colors).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          disabled={!isEditing}
                          className="h-10 w-16 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          disabled={!isEditing}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              {showPreview && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Live Preview</h4>
                      <div className="flex items-center gap-2">
                        {/* Device selector */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={`p-1.5 rounded transition-colors ${
                              previewDevice === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                            }`}
                            aria-label="Mobile preview"
                          >
                            <Smartphone className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('tablet')}
                            className={`p-1.5 rounded transition-colors ${
                              previewDevice === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                            }`}
                            aria-label="Tablet preview"
                          >
                            <Tablet className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={`p-1.5 rounded transition-colors ${
                              previewDevice === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                            }`}
                            aria-label="Desktop preview"
                          >
                            <Monitor className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Theme mode toggle */}
                        <button
                          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
                        >
                          {themeMode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className={`mx-auto transition-all duration-300 ${deviceSizes[previewDevice]}`}>
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html ${selectedTheme.name.toLowerCase().includes('dark') || themeMode === 'dark' ? 'class="dark"' : ''}>
                            <head>
                              <meta charset="UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <style>
                                ${generateThemeCSS(selectedTheme)}
                                
                                * {
                                  margin: 0;
                                  padding: 0;
                                  box-sizing: border-box;
                                }
                                
                                body {
                                  font-family: var(--font-family);
                                  font-size: var(--font-size-base);
                                  line-height: var(--line-height-base);
                                  letter-spacing: var(--letter-spacing);
                                  color: var(--color-text);
                                  background: var(--color-background);
                                }
                                
                                .container {
                                  max-width: var(--container-max-width);
                                  margin: 0 auto;
                                  padding: var(--spacing-md);
                                }
                                
                                .header {
                                  background: var(--color-surface);
                                  border-bottom: 1px solid var(--color-border);
                                  padding: var(--spacing-md) 0;
                                  margin-bottom: var(--spacing-lg);
                                }
                                
                                .nav {
                                  display: flex;
                                  align-items: center;
                                  justify-content: space-between;
                                  gap: var(--spacing-md);
                                }
                                
                                .logo {
                                  font-size: 1.25rem;
                                  font-weight: var(--font-weight-bold);
                                  color: var(--color-primary);
                                }
                                
                                .button {
                                  padding: var(--spacing-sm) var(--spacing-md);
                                  border-radius: var(--border-radius);
                                  border: none;
                                  font-weight: var(--font-weight-medium);
                                  cursor: pointer;
                                  transition: all 0.2s;
                                }
                                
                                .button-primary {
                                  background: var(--color-primary);
                                  color: white;
                                }
                                
                                .button-primary:hover {
                                  opacity: 0.9;
                                }
                                
                                .card {
                                  background: var(--color-surface);
                                  border: 1px solid var(--color-border);
                                  border-radius: var(--border-radius);
                                  padding: var(--spacing-lg);
                                  margin-bottom: var(--spacing-md);
                                  box-shadow: var(--shadow-sm);
                                }
                                
                                .card-title {
                                  font-size: 1.125rem;
                                  font-weight: var(--font-weight-bold);
                                  margin-bottom: var(--spacing-sm);
                                }
                                
                                .card-text {
                                  color: var(--color-text-secondary);
                                  margin-bottom: var(--spacing-md);
                                }
                                
                                .badge {
                                  display: inline-block;
                                  padding: var(--spacing-xs) var(--spacing-sm);
                                  border-radius: calc(var(--border-radius) / 2);
                                  font-size: 0.875rem;
                                  font-weight: var(--font-weight-medium);
                                  margin-right: var(--spacing-sm);
                                }
                                
                                .badge-success {
                                  background: var(--color-success);
                                  color: white;
                                }
                                
                                .badge-info {
                                  background: var(--color-info);
                                  color: white;
                                }
                                
                                .badge-warning {
                                  background: var(--color-warning);
                                  color: white;
                                }
                                
                                .grid {
                                  display: grid;
                                  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                                  gap: var(--spacing-md);
                                }
                              </style>
                            </head>
                            <body>
                              <header class="header">
                                <div class="container">
                                  <nav class="nav">
                                    <div class="logo">Community Platform</div>
                                    <button class="button button-primary">Sign In</button>
                                  </nav>
                                </div>
                              </header>
                              
                              <main class="container">
                                <div class="card">
                                  <h1 class="card-title">Welcome to Our Community</h1>
                                  <p class="card-text">
                                    Connect with professionals, share knowledge, and grow together in a vibrant community.
                                  </p>
                                  <button class="button button-primary">Get Started</button>
                                </div>
                                
                                <div class="grid">
                                  <div class="card">
                                    <h2 class="card-title">Upcoming Events</h2>
                                    <p class="card-text">Join our next community meetup</p>
                                    <span class="badge badge-info">Online</span>
                                    <span class="badge badge-success">Free</span>
                                  </div>
                                  
                                  <div class="card">
                                    <h2 class="card-title">Latest News</h2>
                                    <p class="card-text">Stay updated with community announcements</p>
                                    <span class="badge badge-warning">New</span>
                                  </div>
                                  
                                  <div class="card">
                                    <h2 class="card-title">Resources</h2>
                                    <p class="card-text">Access guides, tutorials, and documentation</p>
                                    <button class="button button-primary">Browse</button>
                                  </div>
                                </div>
                              </main>
                            </body>
                          </html>
                        `}
                        className="w-full h-96 border border-gray-300 rounded-lg"
                        title="Theme preview"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
          <div>
            <h5 className="font-medium text-blue-900 mb-1">Theme System Features</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>Real-time preview with responsive device testing</li>
              <li>Accessibility validation for WCAG 2.1 AA compliance</li>
              <li>Import/export themes for backup and sharing</li>
              <li>CSS variables for easy integration</li>
              <li>Professional presets designed by UI experts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};