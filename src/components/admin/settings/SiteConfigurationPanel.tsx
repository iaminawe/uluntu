import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Image,
  Link,
  FileText,
  Info
} from 'lucide-react';
import type { ApplicationSetting, UpdateSettingRequest } from '@/types/settings';
import { useAdminSettings, useSetting } from '@/hooks/useSettings';

interface SiteConfigurationPanelProps {
  settings: ApplicationSetting[];
  onRefresh: () => void;
}

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'color' | 'file';
  placeholder?: string;
  description?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

const siteSettingFields: SettingField[] = [
  {
    key: 'title',
    label: 'Site Title',
    type: 'text',
    placeholder: 'Community Platform',
    description: 'Main site title displayed in header and browser tab',
    required: true,
    validation: { maxLength: 100 }
  },
  {
    key: 'description',
    label: 'Site Description',
    type: 'textarea',
    placeholder: 'A vibrant community platform for connecting professionals',
    description: 'Site description for SEO and meta tags',
    validation: { maxLength: 300 }
  },
  {
    key: 'logo_url',
    label: 'Logo URL',
    type: 'url',
    placeholder: '/images/logo.png',
    description: 'URL to site logo image (recommended: 200x60px)'
  },
  {
    key: 'favicon_url',
    label: 'Favicon URL',
    type: 'url',
    placeholder: '/favicon.ico',
    description: 'URL to site favicon (recommended: 32x32px ICO format)'
  },
  {
    key: 'primary_color',
    label: 'Primary Color',
    type: 'color',
    placeholder: '#3B82F6',
    description: 'Primary brand color used throughout the site'
  },
  {
    key: 'secondary_color',
    label: 'Secondary Color',
    type: 'color',
    placeholder: '#64748B',
    description: 'Secondary color for accents and highlights'
  }
];

const headerSettingFields: SettingField[] = [
  {
    key: 'custom_hero_image',
    label: 'Hero Background Image',
    type: 'url',
    placeholder: 'https://example.com/hero.jpg',
    description: 'Custom background image for hero section (recommended: 1920x600px)'
  },
  {
    key: 'hero_title',
    label: 'Hero Title',
    type: 'text',
    placeholder: 'Welcome to Our Community',
    description: 'Main heading displayed in the hero section',
    validation: { maxLength: 100 }
  },
  {
    key: 'hero_subtitle',
    label: 'Hero Subtitle',
    type: 'textarea',
    placeholder: 'Connect, collaborate, and grow together',
    description: 'Subtitle text below the main hero title',
    validation: { maxLength: 200 }
  }
];

export const SiteConfigurationPanel: React.FC<SiteConfigurationPanelProps> = ({ 
  settings, 
  onRefresh 
}) => {
  const { updateSetting } = useAdminSettings();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // Initialize form data from settings
  useEffect(() => {
    const siteSettings = settings.filter(s => s.category === 'site');
    const headerSettings = settings.filter(s => s.category === 'header');
    
    const initialData: Record<string, any> = {};
    [...siteSettings, ...headerSettings].forEach(setting => {
      const key = `${setting.category}.${setting.setting_key}`;
      initialData[key] = setting.setting_value;
    });
    
    setFormData(initialData);
    setChangedFields(new Set());
  }, [settings]);

  const handleFieldChange = (category: string, key: string, value: any) => {
    const fieldKey = `${category}.${key}`;
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    setChangedFields(prev => new Set([...prev, fieldKey]));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: UpdateSettingRequest[] = [];
      
      for (const fieldKey of changedFields) {
        const [category, settingKey] = fieldKey.split('.');
        const value = formData[fieldKey];
        
        // Determine data type
        let dataType = 'string';
        if (typeof value === 'number') dataType = 'number';
        else if (typeof value === 'boolean') dataType = 'boolean';
        else if (typeof value === 'object') dataType = 'object';
        
        updates.push({
          category: category as any,
          setting_key: settingKey,
          setting_value: value,
          data_type: dataType as any,
          is_public: true // Site settings are generally public
        });
      }
      
      await Promise.all(updates.map(update => updateSetting(update)));
      
      setChangedFields(new Set());
      onRefresh();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const siteSettings = settings.filter(s => s.category === 'site');
    const headerSettings = settings.filter(s => s.category === 'header');
    
    const resetData: Record<string, any> = {};
    [...siteSettings, ...headerSettings].forEach(setting => {
      const key = `${setting.category}.${setting.setting_key}`;
      resetData[key] = setting.setting_value;
    });
    
    setFormData(resetData);
    setChangedFields(new Set());
  };

  const renderField = (category: string, field: SettingField) => {
    const fieldKey = `${category}.${field.key}`;
    const value = formData[fieldKey] || '';
    const hasChanged = changedFields.has(fieldKey);
    
    return (
      <div key={fieldKey} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
            maxLength={field.validation?.maxLength}
          />
        ) : field.type === 'color' ? (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value}
              onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
              }`}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        ) : (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
            maxLength={field.validation?.maxLength}
            required={field.required}
          />
        )}
        
        {field.description && (
          <p className="text-xs text-gray-500 flex items-start">
            <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
            {field.description}
          </p>
        )}
        
        {field.validation?.maxLength && (
          <div className="text-xs text-gray-400 text-right">
            {value.length}/{field.validation.maxLength}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Site Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage basic site settings and branding
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
              previewMode 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          {changedFields.size > 0 && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </button>
              
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-xs rounded-full">
                  {changedFields.size}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Live Preview</h4>
          <div className="space-y-4">
            {/* Logo Preview */}
            {formData['site.logo_url'] && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Logo Preview:</p>
                <img 
                  src={formData['site.logo_url']} 
                  alt="Logo" 
                  className="h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Color Preview */}
            <div className="flex space-x-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Primary Color:</p>
                <div 
                  className="w-16 h-8 rounded border"
                  style={{ backgroundColor: formData['site.primary_color'] || '#3B82F6' }}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Secondary Color:</p>
                <div 
                  className="w-16 h-8 rounded border"
                  style={{ backgroundColor: formData['site.secondary_color'] || '#64748B' }}
                />
              </div>
            </div>
            
            {/* Hero Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white relative"
                style={formData['header.custom_hero_image'] ? {
                  backgroundImage: `url(${formData['header.custom_hero_image']})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                <div className="text-center">
                  <h2 className="text-xl font-bold">
                    {formData['header.hero_title'] || 'Welcome to Our Community'}
                  </h2>
                  <p className="text-sm opacity-90 mt-1">
                    {formData['header.hero_subtitle'] || 'Connect, collaborate, and grow together'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">Basic Site Information</h4>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {siteSettingFields.map(field => renderField('site', field))}
        </div>
      </div>

      {/* Header Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Image className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Header & Hero Section</h4>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {headerSettingFields.map(field => renderField('header', field))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Configuration Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Logo images should be high-resolution and have a transparent background for best results</li>
              <li>Hero images work best at 1920x600px resolution with good contrast for text overlay</li>
              <li>Choose colors that provide good contrast for accessibility</li>
              <li>Changes to public settings are visible immediately to all users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};