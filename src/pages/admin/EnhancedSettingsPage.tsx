import React, { useState, useCallback, useEffect } from 'react';
import { AdminOnly } from '@/components/auth/PermissionGuard';
import { useUnifiedSettings } from '@/features/admin/hooks/useUnifiedSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ErrorCode } from '@/utils/errorSanitization';
import { ApplicationSetting, SettingCategory, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { 
  Settings, 
  Globe, 
  Shield, 
  Mail, 
  TrendingUp, 
  MessageSquare, 
  Save, 
  RotateCcw,
  Search,
  Filter,
  Check,
  Info,
  ChevronDown,
  ChevronRight,
  Navigation,
  Server,
  Palette,
  Upload,
  Moon,
  Sun,
  Monitor,
  Image as ImageIcon,
  X,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Color Picker Component
const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}> = ({ value, onChange, label, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(value);

  const presetColors = [
    '#F97316', '#FB923C', '#FED7AA', // Orange
    '#3B82F6', '#60A5FA', '#DBEAFE', // Blue
    '#10B981', '#34D399', '#D1FAE5', // Green
    '#8B5CF6', '#A78BFA', '#EDE9FE', // Purple
    '#EC4899', '#F472B6', '#FCE7F3', // Pink
    '#EF4444', '#F87171', '#FEE2E2', // Red
    '#6B7280', '#9CA3AF', '#F3F4F6', // Gray
    '#14B8A6', '#5EEAD4', '#CCFBF1', // Teal
  ];

  const handleColorChange = (color: string) => {
    setLocalColor(color);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
          >
            <div 
              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: localColor }}
            />
            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{localColor}</span>
            <Palette className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>

          {isOpen && !disabled && (
            <div className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <input
                  type="color"
                  value={localColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-10 cursor-pointer rounded"
                />
                <input
                  type="text"
                  value={localColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="#000000"
                />
                <div className="grid grid-cols-8 gap-1">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUpload: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  preview?: boolean;
}> = ({ value, onChange, label, accept = "image/*", maxSize = 5, disabled, preview = true }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    try {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onChange(result);
        toast.success(`${label} uploaded successfully`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onChange('');
    toast.success(`${label} removed`);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled || isUploading}
          className="sr-only"
          id={`upload-${label}`}
        />
        
        {previewUrl && preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt={label}
                className="max-h-32 max-w-full rounded-lg shadow-md"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <label
              htmlFor={`upload-${label}`}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Change {label}
            </label>
          </div>
        ) : (
          <label htmlFor={`upload-${label}`} className="cursor-pointer">
            <div className="space-y-2">
              {isUploading ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-blue-500 hover:text-blue-600">
                      Click to upload
                    </span>
                    {' or drag and drop'}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {accept} (Max {maxSize}MB)
                  </p>
                </>
              )}
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

// Dark Mode Toggle Component
const DarkModeToggle: React.FC = () => {
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    // Check localStorage or system preference
    const savedMode = localStorage.getItem('theme-mode') || 'system';
    setDarkMode(savedMode as 'light' | 'dark' | 'system');
    applyTheme(savedMode as 'light' | 'dark' | 'system');
  }, []);

  const applyTheme = (mode: 'light' | 'dark' | 'system') => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', mode === 'dark');
    }
  };

  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    setDarkMode(mode);
    localStorage.setItem('theme-mode', mode);
    applyTheme(mode);
    toast.success(`Theme set to ${mode}`);
  };

  return (
    <div className="flex items-center space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => handleModeChange('light')}
        className={`p-2 rounded-md transition-colors ${
          darkMode === 'light' 
            ? 'bg-white dark:bg-gray-700 text-yellow-500 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        title="Light mode"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleModeChange('system')}
        className={`p-2 rounded-md transition-colors ${
          darkMode === 'system' 
            ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        title="System preference"
      >
        <Monitor className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleModeChange('dark')}
        className={`p-2 rounded-md transition-colors ${
          darkMode === 'dark' 
            ? 'bg-white dark:bg-gray-700 text-purple-500 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        title="Dark mode"
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  );
};

const EnhancedSettingsPage: React.FC = () => {
  const {
    settings,
    features,
    isLoading,
    error,
    permissions,
    updateSetting,
    refetch
  } = useUnifiedSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('appearance');
  const [showOnlyModified, setShowOnlyModified] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['appearance', 'branding']));
  const [updatingSettings, setUpdatingSettings] = useState<Set<string>>(new Set());
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  // Theme color settings
  const [themeColors, setThemeColors] = useState({
    primary: '#F97316',
    secondary: '#FED7AA',
    accent: '#FB923C',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    border: '#E5E7EB'
  });

  // Branding settings
  const [brandingSettings, setBrandingSettings] = useState({
    logo: '',
    darkLogo: '',
    favicon: '',
    ogImage: ''
  });

  // Setting management functions
  const handleSettingChange = useCallback((settingId: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  }, []);

  const handleSaveSetting = useCallback(async (setting: ApplicationSetting) => {
    const newValue = localSettings[setting.id] ?? setting.setting_value;
    
    setUpdatingSettings(prev => new Set(prev).add(setting.id));
    
    try {
      await updateSetting({
        setting_key: setting.setting_key,
        setting_value: newValue,
        category: setting.category as SettingCategory,
        data_type: setting.data_type as SettingDataType
      });
      
      setLocalSettings(prev => {
        const updated = { ...prev };
        delete updated[setting.id];
        return updated;
      });
      
      toast.success('Setting saved successfully');
    } catch (error) {
      toast.error('Failed to save setting');
      console.error('Error saving setting:', error);
    } finally {
      setUpdatingSettings(prev => {
        const newSet = new Set(prev);
        newSet.delete(setting.id);
        return newSet;
      });
    }
  }, [updateSetting, localSettings]);

  const handleResetSetting = useCallback((settingId: string) => {
    setLocalSettings(prev => {
      const updated = { ...prev };
      delete updated[settingId];
      return updated;
    });
  }, []);

  const handleSaveAllColors = useCallback(async () => {
    try {
      // Save all color settings
      const colorPromises = Object.entries(themeColors).map(([key, value]) => {
        return updateSetting({
          setting_key: `theme_color_${key}`,
          setting_value: value,
          category: 'site' as SettingCategory,
          data_type: 'string' as SettingDataType
        });
      });
      
      await Promise.all(colorPromises);
      toast.success('Theme colors saved successfully');
    } catch (error) {
      toast.error('Failed to save theme colors');
      console.error('Error saving colors:', error);
    }
  }, [themeColors, updateSetting]);

  const handleSaveAllBranding = useCallback(async () => {
    try {
      // Save all branding settings
      const brandingPromises = Object.entries(brandingSettings).map(([key, value]) => {
        if (value) {
          return updateSetting({
            setting_key: `branding_${key}`,
            setting_value: value,
            category: 'site' as SettingCategory,
            data_type: 'string' as SettingDataType
          });
        }
        return null;
      }).filter(Boolean);
      
      await Promise.all(brandingPromises);
      toast.success('Branding settings saved successfully');
    } catch (error) {
      toast.error('Failed to save branding settings');
      console.error('Error saving branding:', error);
    }
  }, [brandingSettings, updateSetting]);

  const getSettingValue = useCallback((setting: ApplicationSetting) => {
    return localSettings[setting.id] ?? setting.setting_value;
  }, [localSettings]);

  const hasChanges = useCallback((settingId: string) => {
    return settingId in localSettings;
  }, [localSettings]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Enhanced setting sections
  const settingSections = [
    {
      id: 'appearance',
      title: 'Appearance & Theme',
      description: 'Customize the look and feel of your platform',
      icon: Palette,
      color: 'purple',
      categories: ['appearance', 'theme'],
      priority: 1,
      customContent: true
    },
    {
      id: 'branding',
      title: 'Branding & Assets',
      description: 'Upload logos, favicons, and other brand assets',
      icon: ImageIcon,
      color: 'blue',
      categories: ['branding'],
      priority: 2,
      customContent: true
    },
    {
      id: 'site',
      title: 'Site Configuration',
      description: 'Basic site information and metadata',
      icon: Globe,
      color: 'green',
      categories: ['site'],
      priority: 3
    },
    {
      id: 'navigation',
      title: 'Navigation & Layout',
      description: 'Menu structure and page layout settings',
      icon: Navigation,
      color: 'indigo',
      categories: ['navigation', 'header'],
      priority: 4
    },
    {
      id: 'security',
      title: 'Security & Access',
      description: 'Authentication and security policies',
      icon: Shield,
      color: 'red',
      categories: ['security'],
      priority: 5
    },
    {
      id: 'email',
      title: 'Email & Communications',
      description: 'SMTP settings and email templates',
      icon: Mail,
      color: 'yellow',
      categories: ['integration'],
      priority: 6
    },
    {
      id: 'performance',
      title: 'Performance & Analytics',
      description: 'Caching and performance optimization',
      icon: TrendingUp,
      color: 'orange',
      categories: ['performance'],
      priority: 7
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert
          error={{ userMessage: error, errorCode: ErrorCode.GENERIC_UNKNOWN, debugId: Date.now().toString(), timestamp: new Date().toISOString() }}
          onRetry={refetch}
          canRetry={true}
        />
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This area is restricted to administrators only.
            </p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Dark Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Settings Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configure your platform appearance, branding, and core settings
                </p>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {settingSections.slice(0, 5).map(section => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedCategory(section.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === section.id
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowOnlyModified(!showOnlyModified)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showOnlyModified
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Modified Only</span>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance Section */}
            {(selectedCategory === 'appearance' || selectedCategory === 'all') && (
              <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                  onClick={() => toggleSection('appearance')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 dark:text-gray-100">
                          Appearance & Theme
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Customize colors and visual appearance
                        </p>
                      </div>
                    </div>
                    {expandedSections.has('appearance') ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>

                {expandedSections.has('appearance') && (
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ColorPicker
                        label="Primary Color"
                        value={themeColors.primary}
                        onChange={(color) => setThemeColors({ ...themeColors, primary: color })}
                      />
                      <ColorPicker
                        label="Secondary Color"
                        value={themeColors.secondary}
                        onChange={(color) => setThemeColors({ ...themeColors, secondary: color })}
                      />
                      <ColorPicker
                        label="Accent Color"
                        value={themeColors.accent}
                        onChange={(color) => setThemeColors({ ...themeColors, accent: color })}
                      />
                      <ColorPicker
                        label="Background Color"
                        value={themeColors.background}
                        onChange={(color) => setThemeColors({ ...themeColors, background: color })}
                      />
                      <ColorPicker
                        label="Surface Color"
                        value={themeColors.surface}
                        onChange={(color) => setThemeColors({ ...themeColors, surface: color })}
                      />
                      <ColorPicker
                        label="Text Color"
                        value={themeColors.text}
                        onChange={(color) => setThemeColors({ ...themeColors, text: color })}
                      />
                      <ColorPicker
                        label="Border Color"
                        value={themeColors.border}
                        onChange={(color) => setThemeColors({ ...themeColors, border: color })}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setThemeColors({
                            primary: '#F97316',
                            secondary: '#FED7AA',
                            accent: '#FB923C',
                            background: '#FFFFFF',
                            surface: '#F9FAFB',
                            text: '#111827',
                            border: '#E5E7EB'
                          });
                          toast.success('Reset to default colors');
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Colors
                      </Button>
                      <Button onClick={handleSaveAllColors}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Theme Colors
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Branding Section */}
            {(selectedCategory === 'branding' || selectedCategory === 'all') && (
              <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
                  onClick={() => toggleSection('branding')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 dark:text-gray-100">
                          Branding & Assets
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Upload logos and brand assets
                        </p>
                      </div>
                    </div>
                    {expandedSections.has('branding') ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>

                {expandedSections.has('branding') && (
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageUpload
                        label="Logo"
                        value={brandingSettings.logo}
                        onChange={(url) => setBrandingSettings({ ...brandingSettings, logo: url })}
                        accept="image/png,image/jpeg,image/svg+xml"
                        maxSize={2}
                      />
                      <ImageUpload
                        label="Dark Mode Logo"
                        value={brandingSettings.darkLogo}
                        onChange={(url) => setBrandingSettings({ ...brandingSettings, darkLogo: url })}
                        accept="image/png,image/jpeg,image/svg+xml"
                        maxSize={2}
                      />
                      <ImageUpload
                        label="Favicon"
                        value={brandingSettings.favicon}
                        onChange={(url) => setBrandingSettings({ ...brandingSettings, favicon: url })}
                        accept="image/png,image/x-icon,image/svg+xml"
                        maxSize={1}
                      />
                      <ImageUpload
                        label="OG Image"
                        value={brandingSettings.ogImage}
                        onChange={(url) => setBrandingSettings({ ...brandingSettings, ogImage: url })}
                        accept="image/png,image/jpeg"
                        maxSize={5}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBrandingSettings({
                            logo: '',
                            darkLogo: '',
                            favicon: '',
                            ogImage: ''
                          });
                          toast.success('Cleared all branding assets');
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear Assets
                      </Button>
                      <Button onClick={handleSaveAllBranding}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Branding
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Other Settings Sections */}
            {settingSections
              .filter(section => !section.customContent && (selectedCategory === section.id || selectedCategory === 'all'))
              .map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSections.has(section.id);
                const sectionSettings = settings.filter(setting => 
                  section.categories.includes(setting.category) &&
                  (searchTerm === '' || 
                   setting.setting_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   setting.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                  (!showOnlyModified || hasChanges(setting.id))
                );

                return (
                  <Card key={section.id} className="overflow-hidden border-gray-200 dark:border-gray-700">
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 bg-${section.color}-100 dark:bg-${section.color}-900 rounded-lg`}>
                            <Icon className={`h-5 w-5 text-${section.color}-600 dark:text-${section.color}-400`} />
                          </div>
                          <div>
                            <CardTitle className="text-gray-900 dark:text-gray-100">
                              {section.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {sectionSettings.length} settings
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="p-6">
                        {sectionSettings.length > 0 ? (
                          <div className="space-y-4">
                            {sectionSettings.map((setting) => {
                              const currentValue = getSettingValue(setting);
                              const isUpdating = updatingSettings.has(setting.id);
                              const hasChanged = hasChanges(setting.id);

                              return (
                                <div
                                  key={setting.id}
                                  className={`p-4 rounded-lg border transition-all ${
                                    hasChanged 
                                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 dark:border-gray-700'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                        {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </h4>
                                      {setting.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                          {setting.description}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {typeof setting.setting_value === 'boolean' ? (
                                        <Switch
                                          checked={currentValue || false}
                                          onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                          disabled={isUpdating}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={String(currentValue)}
                                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                          disabled={isUpdating}
                                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-w-[200px]"
                                        />
                                      )}
                                      
                                      {hasChanged && (
                                        <div className="flex space-x-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleSaveSetting(setting)}
                                            disabled={isUpdating}
                                          >
                                            {isUpdating ? (
                                              <LoadingSpinner size="sm" />
                                            ) : (
                                              <Save className="h-3 w-3" />
                                            )}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleResetSetting(setting.id)}
                                            disabled={isUpdating}
                                          >
                                            <RotateCcw className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Info className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                              No settings found in this category
                            </p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Preview Card */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <Eye className="h-5 w-5 mr-2" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="rounded-lg p-4 space-y-3"
                  style={{ 
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  <h3 style={{ color: themeColors.text }} className="font-semibold">
                    Sample Content
                  </h3>
                  <p style={{ color: themeColors.text, opacity: 0.8 }} className="text-sm">
                    This preview shows how your color scheme will look.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1.5 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      Primary
                    </button>
                    <button 
                      className="px-3 py-1.5 rounded text-sm font-medium"
                      style={{ 
                        backgroundColor: themeColors.secondary,
                        color: themeColors.text
                      }}
                    >
                      Secondary
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">
                  Settings Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Settings</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {settings.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Modified</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {Object.keys(localSettings).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {settingSections.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Tips
                    </p>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Use the color picker to customize your theme</li>
                      <li>• Upload high-quality images for best results</li>
                      <li>• Dark mode adapts to your system preference</li>
                      <li>• Changes are saved automatically</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
};

export default EnhancedSettingsPage;