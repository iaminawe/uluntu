import React, { useState, useEffect } from 'react';
import { ApplicationSetting, UpdateSettingRequest, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { 
  Globe, 
  Eye, 
  EyeOff, 
  Navigation, 
  Palette, 
  Save, 
  RotateCcw, 
  Info, 
  Image,
  FileText,
  Type
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImprovedGeneralSettingsSectionProps {
  settings: ApplicationSetting[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'color' | 'image' | 'boolean' | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

const siteSettingFields: SettingField[] = [
  {
    key: 'site_title',
    label: 'Site Title',
    type: 'text',
    placeholder: 'Kootenay Tech Community',
    description: 'Main site title displayed in header and browser tab',
    required: true,
    validation: { maxLength: 100 }
  },
  {
    key: 'site_description',
    label: 'Site Description',
    type: 'textarea',
    placeholder: 'A vibrant tech community in the Kootenays',
    description: 'Site description for SEO and meta tags',
    validation: { maxLength: 300 }
  },
  {
    key: 'site_logo',
    label: 'Site Logo',
    type: 'image',
    description: 'Main site logo (recommended: 200x60px PNG with transparent background)'
  },
  {
    key: 'site_favicon',
    label: 'Favicon',
    type: 'image',
    description: 'Site favicon (recommended: 32x32px ICO format)'
  }
];

const appearanceFields: SettingField[] = [
  {
    key: 'primary_color',
    label: 'Primary Brand Color',
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
  },
  {
    key: 'accent_color',
    label: 'Accent Color',
    type: 'color',
    placeholder: '#10B981',
    description: 'Accent color for buttons and interactive elements'
  },
  {
    key: 'dark_mode_enabled',
    label: 'Enable Dark Mode',
    type: 'boolean',
    description: 'Allow users to switch between light and dark themes'
  }
];

const typographyFields: SettingField[] = [
  {
    key: 'heading_font_family',
    label: 'Heading Font Family',
    type: 'select',
    description: 'Font family for headings and titles',
    options: [
      { value: 'Inter', label: 'Inter (Modern Sans-serif)' },
      { value: 'Poppins', label: 'Poppins (Friendly Sans-serif)' },
      { value: 'Montserrat', label: 'Montserrat (Geometric Sans-serif)' },
      { value: 'Roboto', label: 'Roboto (Clean Sans-serif)' },
      { value: 'Open Sans', label: 'Open Sans (Humanist Sans-serif)' },
      { value: 'Lato', label: 'Lato (Professional Sans-serif)' },
      { value: 'Source Sans Pro', label: 'Source Sans Pro (Adobe Sans-serif)' },
      { value: 'Nunito', label: 'Nunito (Rounded Sans-serif)' },
      { value: 'Playfair Display', label: 'Playfair Display (Elegant Serif)' },
      { value: 'Merriweather', label: 'Merriweather (Readable Serif)' },
      { value: 'Lora', label: 'Lora (Calligraphic Serif)' },
      { value: 'PT Serif', label: 'PT Serif (Universal Serif)' },
      { value: 'Crimson Text', label: 'Crimson Text (Book Serif)' },
      { value: 'Georgia', label: 'Georgia (Classic Serif)' },
      { value: 'system-ui', label: 'System UI (Native)' }
    ]
  },
  {
    key: 'body_font_family',
    label: 'Body Font Family',
    type: 'select',
    description: 'Font family for body text and paragraphs',
    options: [
      { value: 'Inter', label: 'Inter (Modern Sans-serif)' },
      { value: 'Poppins', label: 'Poppins (Friendly Sans-serif)' },
      { value: 'Montserrat', label: 'Montserrat (Geometric Sans-serif)' },
      { value: 'Roboto', label: 'Roboto (Clean Sans-serif)' },
      { value: 'Open Sans', label: 'Open Sans (Humanist Sans-serif)' },
      { value: 'Lato', label: 'Lato (Professional Sans-serif)' },
      { value: 'Source Sans Pro', label: 'Source Sans Pro (Adobe Sans-serif)' },
      { value: 'Nunito', label: 'Nunito (Rounded Sans-serif)' },
      { value: 'Merriweather', label: 'Merriweather (Readable Serif)' },
      { value: 'Lora', label: 'Lora (Calligraphic Serif)' },
      { value: 'PT Serif', label: 'PT Serif (Universal Serif)' },
      { value: 'Crimson Text', label: 'Crimson Text (Book Serif)' },
      { value: 'Georgia', label: 'Georgia (Classic Serif)' },
      { value: 'system-ui', label: 'System UI (Native)' }
    ]
  },
  {
    key: 'font_size_scale',
    label: 'Font Size Scale',
    type: 'select',
    description: 'Overall font sizing scale for the website',
    options: [
      { value: 'small', label: 'Small (Compact)' },
      { value: 'medium', label: 'Medium (Standard)' },
      { value: 'large', label: 'Large (Accessible)' }
    ]
  },
  {
    key: 'line_height_scale',
    label: 'Line Height Scale',
    type: 'select',
    description: 'Text line spacing for better readability',
    options: [
      { value: 'tight', label: 'Tight (1.25)' },
      { value: 'normal', label: 'Normal (1.5)' },
      { value: 'relaxed', label: 'Relaxed (1.625)' },
      { value: 'loose', label: 'Loose (2.0)' }
    ]
  }
];

const headerFields: SettingField[] = [
  {
    key: 'hero_background_image',
    label: 'Hero Background Image',
    type: 'image',
    description: 'Background image for hero section (recommended: 1920x600px)'
  },
  {
    key: 'hero_title',
    label: 'Hero Title',
    type: 'text',
    placeholder: 'Welcome to Kootenay Tech',
    description: 'Main heading displayed in the hero section',
    validation: { maxLength: 100 }
  },
  {
    key: 'hero_subtitle',
    label: 'Hero Subtitle',
    type: 'textarea',
    placeholder: 'Connect, collaborate, and innovate together',
    description: 'Subtitle text below the main hero title',
    validation: { maxLength: 200 }
  }
];

const navigationFields: SettingField[] = [
  {
    key: 'show_member_count',
    label: 'Show Member Count',
    type: 'boolean',
    description: 'Display total member count in navigation'
  },
  {
    key: 'enable_search',
    label: 'Enable Global Search',
    type: 'boolean',
    description: 'Show search functionality in header'
  },
  {
    key: 'footer_text',
    label: 'Footer Text',
    type: 'textarea',
    placeholder: '© 2024 Kootenay Tech Community. All rights reserved.',
    description: 'Custom footer text displayed site-wide',
    validation: { maxLength: 200 }
  }
];

const ImprovedGeneralSettingsSection: React.FC<ImprovedGeneralSettingsSectionProps> = ({
  settings,
  onUpdateSetting,
  onRefresh,
  isLoading
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    const initialData: Record<string, any> = {};
    settings.forEach(setting => {
      const key = `${setting.category}.${setting.setting_key}`;
      initialData[key] = setting.setting_value;
    });
    setFormData(initialData);
    setChangedFields(new Set());
  }, [settings]);

  const handleFieldChange = (category: string, settingKey: string, value: any) => {
    const fieldKey = `${category}.${settingKey}`;
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    setChangedFields(prev => new Set([...prev, fieldKey]));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates: UpdateSettingRequest[] = [];
      
      for (const fieldKey of changedFields) {
        const [category, settingKey] = fieldKey.split('.');
        const value = formData[fieldKey];
        
        const setting = settings.find(s => s.setting_key === settingKey && s.category === category);
        updates.push({
          setting_key: settingKey,
          setting_value: value,
          category: category as any,
          data_type: (setting?.data_type as SettingDataType) || ('string' as SettingDataType)
        });
      }
      
      await Promise.all(updates.map(update => onUpdateSetting(update)));
      
      setChangedFields(new Set());
      toast.success(`Saved ${updates.length} settings successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const resetData: Record<string, any> = {};
    settings.forEach(setting => {
      const key = `${setting.category}.${setting.setting_key}`;
      resetData[key] = setting.setting_value;
    });
    setFormData(resetData);
    setChangedFields(new Set());
    toast.success('Changes reset');
  };

  const renderField = (category: string, field: SettingField) => {
    const fieldKey = `${category}.${field.key}`;
    const value = formData[fieldKey] || '';
    const hasChanged = changedFields.has(fieldKey);
    
    return (
      <div key={fieldKey} className="space-y-3">
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
            maxLength={field.validation?.maxLength}
          />
        ) : field.type === 'color' ? (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value || '#3B82F6'}
              onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
              }`}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        ) : field.type === 'image' ? (
          <div className={`${hasChanged ? 'ring-2 ring-blue-200 rounded-lg' : ''}`}>
            <ImageUploader
              value={value}
              onChange={(url) => handleFieldChange(category, field.key, url)}
              placeholder={`Upload ${field.label}`}
              maxSize={5}
              onError={(error) => toast.error(error)}
            />
          </div>
        ) : field.type === 'boolean' ? (
          <div className="flex items-center space-x-3">
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(category, field.key, checked)}
            />
            <span className="text-sm text-gray-600">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ) : field.type === 'select' ? (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors ${
              hasChanged ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
        
        {field.validation?.maxLength && field.type !== 'boolean' && (
          <div className="text-xs text-gray-400 text-right">
            {String(value).length}/{field.validation.maxLength}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">General Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure your site's basic information, branding, and appearance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>
          
          {changedFields.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
              
              <Button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-xs rounded-full">
                  {changedFields.size}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Live Preview */}
      {previewMode && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Site Branding Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Site Branding</h4>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
                {formData['site.site_logo'] && (
                  <img 
                    src={formData['site.site_logo']} 
                    alt="Logo Preview" 
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h3 className="font-semibold">
                    {formData['site.site_title'] || 'Your Site Title'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formData['site.site_description'] || 'Your site description'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Color Scheme Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Color Scheme</h4>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div 
                    className="w-16 h-12 rounded-lg border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData['appearance.primary_color'] || '#3B82F6' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-12 rounded-lg border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData['appearance.secondary_color'] || '#64748B' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Secondary</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-12 rounded-lg border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData['appearance.accent_color'] || '#10B981' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Accent</p>
                </div>
              </div>
            </div>
            
            {/* Typography Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Typography</h4>
              <div className="bg-white p-4 rounded-lg border space-y-3">
                <h1 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: formData['typography.heading_font_family'] || 'Inter',
                    lineHeight: formData['typography.line_height_scale'] === 'tight' ? '1.25' :
                               formData['typography.line_height_scale'] === 'relaxed' ? '1.625' :
                               formData['typography.line_height_scale'] === 'loose' ? '2.0' : '1.5'
                  }}
                >
                  Heading Sample Text
                </h1>
                <p 
                  className="text-base text-gray-600"
                  style={{ 
                    fontFamily: formData['typography.body_font_family'] || 'Inter',
                    fontSize: formData['typography.font_size_scale'] === 'small' ? '14px' :
                              formData['typography.font_size_scale'] === 'large' ? '18px' : '16px',
                    lineHeight: formData['typography.line_height_scale'] === 'tight' ? '1.25' :
                               formData['typography.line_height_scale'] === 'relaxed' ? '1.625' :
                               formData['typography.line_height_scale'] === 'loose' ? '2.0' : '1.5'
                  }}
                >
                  This is how your body text will appear with the selected typography settings. The quick brown fox jumps over the lazy dog.
                </p>
                <div className="text-xs text-gray-500 flex space-x-4">
                  <span>Heading: {formData['typography.heading_font_family'] || 'Inter'}</span>
                  <span>Body: {formData['typography.body_font_family'] || 'Inter'}</span>
                  <span>Size: {formData['typography.font_size_scale'] || 'Medium'}</span>
                  <span>Line Height: {formData['typography.line_height_scale'] || 'Normal'}</span>
                </div>
              </div>
            </div>
            
            {/* Hero Section Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Hero Section</h4>
              <div className="relative rounded-lg overflow-hidden">
                <div 
                  className="h-40 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white relative"
                  style={formData['header.hero_background_image'] ? {
                    backgroundImage: `url(${formData['header.hero_background_image']})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  <div className="text-center relative z-10">
                    <h2 className="text-2xl font-bold mb-2">
                      {formData['header.hero_title'] || 'Welcome to Our Community'}
                    </h2>
                    <p className="text-lg opacity-90">
                      {formData['header.hero_subtitle'] || 'Connect, collaborate, and grow together'}
                    </p>
                  </div>
                  {formData['header.hero_background_image'] && (
                    <div className="absolute inset-0 bg-black bg-opacity-30" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>Site Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {siteSettingFields.map(field => renderField('site', field))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-purple-600" />
            <span>Appearance & Branding</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appearanceFields.map(field => renderField('appearance', field))}
          </div>
        </CardContent>
      </Card>

      {/* Typography Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="h-5 w-5 text-indigo-600" />
            <span>Typography & Fonts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {typographyFields.map(field => renderField('typography', field))}
          </div>
        </CardContent>
      </Card>

      {/* Header Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5 text-green-600" />
            <span>Header & Hero Section</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {headerFields.map(field => renderField('header', field))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-indigo-600" />
            <span>Navigation & Footer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {navigationFields.map(field => renderField('navigation', field))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <Info className="h-5 w-5" />
            <span>Configuration Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-amber-700">
            <li>Logo images should be high-resolution with transparent backgrounds for best results</li>
            <li>Hero images work best at 1920x600px resolution with good contrast for text overlay</li>
            <li>Choose colors that provide good contrast for accessibility compliance</li>
            <li>Changes are saved immediately and visible to all users</li>
            <li>Use the preview mode to see how changes will look before saving</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {siteSettingFields.length}
              </div>
              <div className="text-sm text-gray-600">Site Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {appearanceFields.length}
              </div>
              <div className="text-sm text-gray-600">Appearance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {typographyFields.length}
              </div>
              <div className="text-sm text-gray-600">Typography</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {headerFields.length}
              </div>
              <div className="text-sm text-gray-600">Header Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {changedFields.size}
              </div>
              <div className="text-sm text-gray-600">Unsaved Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedGeneralSettingsSection;