import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Eye, 
  Monitor,
  Smartphone,
  Tablet,
  Save,
  RefreshCw,
  Brush,
  Type,
  Layout,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import type { ApplicationSetting, UpdateSettingRequest } from '@/types/settings';
import { useAdminSettings } from '@/hooks/useSettings';

interface AppearancePanelProps {
  settings: ApplicationSetting[];
  onRefresh: () => void;
}

interface ThemePreset {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  description: string;
}

const themePresets: ThemePreset[] = [
  {
    name: 'Professional Blue',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#0EA5E9',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B'
    },
    description: 'Clean and professional look with blue accents'
  },
  {
    name: 'Modern Purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#6B7280',
      accent: '#A855F7',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827'
    },
    description: 'Modern and vibrant with purple tones'
  },
  {
    name: 'Nature Green',
    colors: {
      primary: '#10B981',
      secondary: '#6B7280',
      accent: '#059669',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#1F2937'
    },
    description: 'Fresh and natural with green theme'
  },
  {
    name: 'Warm Orange',
    colors: {
      primary: '#F59E0B',
      secondary: '#6B7280',
      accent: '#D97706',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: '#1F2937'
    },
    description: 'Warm and energetic with orange highlights'
  }
];

export const AppearancePanel: React.FC<AppearancePanelProps> = ({ 
  settings, 
  onRefresh 
}) => {
  const { updateSetting } = useAdminSettings();
  const [activeTab, setActiveTab] = useState<'colors' | 'layout' | 'typography' | 'preview'>('colors');
  const [currentTheme, setCurrentTheme] = useState<any>({});
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize theme from settings
  useEffect(() => {
    const appearanceSettings = settings.filter(s => s.category === 'appearance');
    const theme: any = {};
    
    appearanceSettings.forEach(setting => {
      theme[setting.setting_key] = setting.setting_value;
    });
    
    // Set defaults if not found
    if (!theme.primary_color) theme.primary_color = '#3B82F6';
    if (!theme.secondary_color) theme.secondary_color = '#64748B';
    if (!theme.accent_color) theme.accent_color = '#0EA5E9';
    if (!theme.background_color) theme.background_color = '#F8FAFC';
    if (!theme.surface_color) theme.surface_color = '#FFFFFF';
    if (!theme.text_color) theme.text_color = '#1E293B';
    if (!theme.font_family) theme.font_family = 'Inter';
    if (!theme.font_size_base) theme.font_size_base = '16';
    if (!theme.border_radius) theme.border_radius = '8';
    if (!theme.shadow_style) theme.shadow_style = 'medium';
    
    setCurrentTheme(theme);
  }, [settings]);

  const handleThemeChange = (key: string, value: any) => {
    setCurrentTheme((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const applyPreset = (preset: ThemePreset) => {
    const newTheme = {
      ...currentTheme,
      primary_color: preset.colors.primary,
      secondary_color: preset.colors.secondary,
      accent_color: preset.colors.accent,
      background_color: preset.colors.background,
      surface_color: preset.colors.surface,
      text_color: preset.colors.text,
    };
    setCurrentTheme(newTheme);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: UpdateSettingRequest[] = Object.entries(currentTheme).map(([key, value]) => ({
        category: 'appearance',
        setting_key: key,
        setting_value: value,
        data_type: typeof value === 'number' ? 'number' : 'string',
        is_public: true
      }));
      
      await Promise.all(updates.map(update => updateSetting(update)));
      
      setHasChanges(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const appearanceSettings = settings.filter(s => s.category === 'appearance');
    const resetTheme: any = {};
    
    appearanceSettings.forEach(setting => {
      resetTheme[setting.setting_key] = setting.setting_value;
    });
    
    setCurrentTheme(resetTheme);
    setHasChanges(false);
  };

  const generateCSS = () => {
    return `
      :root {
        --color-primary: ${currentTheme.primary_color};
        --color-secondary: ${currentTheme.secondary_color};
        --color-accent: ${currentTheme.accent_color};
        --color-background: ${currentTheme.background_color};
        --color-surface: ${currentTheme.surface_color};
        --color-text: ${currentTheme.text_color};
        --font-family: ${currentTheme.font_family}, sans-serif;
        --font-size-base: ${currentTheme.font_size_base}px;
        --border-radius: ${currentTheme.border_radius}px;
      }
    `;
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Appearance Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Customize the visual appearance of your platform
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* Theme Presets */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">Theme Presets</h4>
                <p className="text-sm text-gray-500 mt-1">Quick start with predefined color schemes</p>
              </div>
              
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex space-x-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                      </div>
                      <span className="font-medium text-gray-900">{preset.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">Custom Colors</h4>
                <p className="text-sm text-gray-500 mt-1">Fine-tune individual color values</p>
              </div>
              
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { key: 'primary_color', label: 'Primary Color', description: 'Main brand color' },
                  { key: 'secondary_color', label: 'Secondary Color', description: 'Supporting color' },
                  { key: 'accent_color', label: 'Accent Color', description: 'Highlight color' },
                  { key: 'background_color', label: 'Background Color', description: 'Page background' },
                  { key: 'surface_color', label: 'Surface Color', description: 'Card backgrounds' },
                  { key: 'text_color', label: 'Text Color', description: 'Primary text' },
                ].map((colorField) => (
                  <div key={colorField.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {colorField.label}
                    </label>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="color"
                        value={currentTheme[colorField.key] || '#000000'}
                        onChange={(e) => handleThemeChange(colorField.key, e.target.value)}
                        className="h-10 w-12 sm:w-16 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentTheme[colorField.key] || ''}
                        onChange={(e) => handleThemeChange(colorField.key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="#000000"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                    <p className="text-xs text-gray-500">{colorField.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Layout Settings</h4>
              <p className="text-sm text-gray-500 mt-1">Control spacing, borders, and layout properties</p>
            </div>
            
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Border Radius (px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={currentTheme.border_radius || 8}
                  onChange={(e) => handleThemeChange('border_radius', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0px (Sharp)</span>
                  <span className="font-medium">{currentTheme.border_radius || 8}px</span>
                  <span>20px (Rounded)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Shadow Style
                </label>
                <select
                  value={currentTheme.shadow_style || 'medium'}
                  onChange={(e) => handleThemeChange('shadow_style', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">No Shadow</option>
                  <option value="small">Small Shadow</option>
                  <option value="medium">Medium Shadow</option>
                  <option value="large">Large Shadow</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Typography Settings</h4>
              <p className="text-sm text-gray-500 mt-1">Configure fonts and text sizing</p>
            </div>
            
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Font Family
                </label>
                <select
                  value={currentTheme.font_family || 'Inter'}
                  onChange={(e) => handleThemeChange('font_family', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Base Font Size (px)
                </label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  step="1"
                  value={currentTheme.font_size_base || 16}
                  onChange={(e) => handleThemeChange('font_size_base', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>12px (Small)</span>
                  <span className="font-medium">{currentTheme.font_size_base || 16}px</span>
                  <span>20px (Large)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Device Selector */}
            <div className="flex justify-center space-x-2 sm:space-x-4 overflow-x-auto pb-2">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'tablet', icon: Tablet, label: 'Tablet' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setPreviewDevice(device.id as any)}
                    className={`flex items-center px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      previewDevice === device.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="text-sm sm:text-base">{device.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Preview Frame */}
            <div className="flex justify-center px-4 sm:px-0">
              <div 
                className={`border border-gray-300 rounded-lg overflow-hidden transition-all duration-300 ${
                  previewDevice === 'mobile' ? 'w-full max-w-sm h-96' :
                  previewDevice === 'tablet' ? 'w-full max-w-md h-72' :
                  'w-full max-w-4xl h-96'
                }`}
                style={{ backgroundColor: currentTheme.background_color }}
              >
                <style>{generateCSS()}</style>
                
                {/* Mock Interface */}
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <header 
                    className="p-4 shadow-sm"
                    style={{ backgroundColor: currentTheme.surface_color }}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.text_color }}
                      >
                        Community Platform
                      </div>
                      <div 
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ 
                          backgroundColor: currentTheme.primary_color,
                          borderRadius: `${currentTheme.border_radius}px`
                        }}
                      >
                        Sign In
                      </div>
                    </div>
                  </header>
                  
                  {/* Content */}
                  <main className="flex-1 p-4 space-y-4">
                    <div 
                      className="p-4 rounded-lg shadow-sm"
                      style={{ 
                        backgroundColor: currentTheme.surface_color,
                        borderRadius: `${currentTheme.border_radius}px`
                      }}
                    >
                      <h2 
                        className="text-lg font-semibold mb-2"
                        style={{ color: currentTheme.text_color }}
                      >
                        Welcome to Our Community
                      </h2>
                      <p 
                        className="text-sm mb-3"
                        style={{ color: currentTheme.secondary_color }}
                      >
                        Connect, collaborate, and grow together with professionals in your field.
                      </p>
                      <button 
                        className="px-4 py-2 rounded text-sm font-medium text-white"
                        style={{ 
                          backgroundColor: currentTheme.accent_color,
                          borderRadius: `${currentTheme.border_radius}px`
                        }}
                      >
                        Get Started
                      </button>
                    </div>
                    
                    <div className={`grid gap-4 ${
                      previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                    }`}>
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: currentTheme.surface_color,
                          borderRadius: `${currentTheme.border_radius}px`
                        }}
                      >
                        <h3 
                          className="font-medium mb-1"
                          style={{ color: currentTheme.text_color }}
                        >
                          Recent Events
                        </h3>
                        <p 
                          className="text-xs"
                          style={{ color: currentTheme.secondary_color }}
                        >
                          Join upcoming community events
                        </p>
                      </div>
                      
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: currentTheme.surface_color,
                          borderRadius: `${currentTheme.border_radius}px`
                        }}
                      >
                        <h3 
                          className="font-medium mb-1"
                          style={{ color: currentTheme.text_color }}
                        >
                          Member Directory
                        </h3>
                        <p 
                          className="text-xs"
                          style={{ color: currentTheme.secondary_color }}
                        >
                          Connect with other members
                        </p>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Export */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Appearance Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Changes are applied in real-time and saved to your theme configuration</li>
              <li>Use the preview tab to see how your changes look across different devices</li>
              <li>Consider accessibility when choosing color combinations</li>
              <li>Custom fonts may require additional setup for optimal loading</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile sticky footer with save/reset buttons */}
      {hasChanges && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex space-x-3 z-50">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};