import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Globe,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import type { ApplicationSetting, UpdateSettingRequest } from '@/types/settings';
import { useAdminSettings } from '@/hooks/useSettings';

interface LocationPanelProps {
  settings: ApplicationSetting[];
  onRefresh: () => void;
}

interface LocationSettings {
  default_city: string;
  default_region: string;
  default_country: string;
  coverage_areas: string[];
  timezone: string;
  currency: string;
  language: string;
  address: string;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  service_radius: number | null;
  multiple_locations: boolean;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' }
];

export const LocationPanel: React.FC<LocationPanelProps> = ({ 
  settings, 
  onRefresh 
}) => {
  const { updateSetting } = useAdminSettings();
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    default_city: '',
    default_region: '',
    default_country: '',
    coverage_areas: [],
    timezone: 'UTC',
    currency: 'USD',
    language: 'en',
    address: '',
    coordinates: { latitude: null, longitude: null },
    service_radius: null,
    multiple_locations: false,
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newCoverageArea, setNewCoverageArea] = useState('');

  // Initialize settings from props
  useEffect(() => {
    const locationData = settings.filter(s => s.category === 'location');
    const contactData = settings.filter(s => s.category === 'contact');
    const newSettings: any = { ...locationSettings };
    
    [...locationData, ...contactData].forEach(setting => {
      let value = setting.setting_value;
      
      // Parse JSON values
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      
      // Handle specific keys
      if (setting.setting_key === 'coverage_areas' && Array.isArray(value)) {
        newSettings.coverage_areas = value;
      } else if (setting.setting_key === 'address') {
        newSettings.address = value;
      } else {
        newSettings[setting.setting_key] = value;
      }
    });
    
    setLocationSettings(newSettings);
  }, [settings]);

  const handleSettingChange = (key: keyof LocationSettings, value: any) => {
    setLocationSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleAddCoverageArea = () => {
    if (newCoverageArea.trim() && !locationSettings.coverage_areas.includes(newCoverageArea.trim())) {
      const updatedAreas = [...locationSettings.coverage_areas, newCoverageArea.trim()];
      handleSettingChange('coverage_areas', updatedAreas);
      setNewCoverageArea('');
    }
  };

  const handleRemoveCoverageArea = (index: number) => {
    const updatedAreas = locationSettings.coverage_areas.filter((_, i) => i !== index);
    handleSettingChange('coverage_areas', updatedAreas);
  };

  const handleCoordinateChange = (type: 'latitude' | 'longitude', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    handleSettingChange('coordinates', {
      ...locationSettings.coordinates,
      [type]: numValue
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: UpdateSettingRequest[] = [];
      
      // Location settings
      const locationUpdates = [
        'default_city', 'default_region', 'default_country', 'coverage_areas',
        'timezone', 'currency', 'language', 'service_radius', 'multiple_locations'
      ];
      
      locationUpdates.forEach(key => {
        if (locationSettings[key as keyof LocationSettings] !== undefined) {
          const value = locationSettings[key as keyof LocationSettings];
          updates.push({
            category: 'location',
            setting_key: key,
            setting_value: value,
            data_type: typeof value === 'boolean' ? 'boolean' : 
                      typeof value === 'number' ? 'number' : 
                      Array.isArray(value) ? 'array' : 'string',
            is_public: true
          });
        }
      });
      
      // Contact settings (address, coordinates)
      if (locationSettings.address !== undefined) {
        updates.push({
          category: 'contact',
          setting_key: 'address',
          setting_value: locationSettings.address,
          data_type: 'string',
          is_public: true
        });
      }
      
      if (locationSettings.coordinates.latitude !== null || locationSettings.coordinates.longitude !== null) {
        updates.push({
          category: 'contact',
          setting_key: 'coordinates',
          setting_value: locationSettings.coordinates,
          data_type: 'object',
          is_public: false // Coordinates might be sensitive
        });
      }
      
      await Promise.all(updates.map(update => updateSetting(update)));
      
      setHasChanges(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to save location settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const locationData = settings.filter(s => s.category === 'location' || s.category === 'contact');
    const resetSettings: any = { ...locationSettings };
    
    locationData.forEach(setting => {
      resetSettings[setting.setting_key] = setting.setting_value;
    });
    
    setLocationSettings(resetSettings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Location & Coverage</h3>
          <p className="text-sm text-gray-500 mt-1">
            Set your organization's location and service coverage areas
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-3">
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
            </button>
          </div>
        )}
      </div>

      {/* Primary Location */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">Primary Location</h4>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              value={locationSettings.default_city}
              onChange={(e) => handleSettingChange('default_city', e.target.value)}
              placeholder="Your City"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              State/Region
            </label>
            <input
              type="text"
              value={locationSettings.default_region}
              onChange={(e) => handleSettingChange('default_region', e.target.value)}
              placeholder="Your State/Region"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              value={locationSettings.default_country}
              onChange={(e) => handleSettingChange('default_country', e.target.value)}
              placeholder="Your Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Full Address
            </label>
            <textarea
              value={locationSettings.address}
              onChange={(e) => handleSettingChange('address', e.target.value)}
              placeholder="123 Main Street, City, State, Country"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={locationSettings.coordinates.latitude || ''}
              onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
              placeholder="40.7128"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={locationSettings.coordinates.longitude || ''}
              onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
              placeholder="-74.0060"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Service Radius (km)
            </label>
            <input
              type="number"
              min="0"
              value={locationSettings.service_radius || ''}
              onChange={(e) => handleSettingChange('service_radius', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">Leave empty for unlimited coverage</p>
          </div>
        </div>
      </div>

      {/* Coverage Areas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Coverage Areas</h4>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newCoverageArea}
              onChange={(e) => setNewCoverageArea(e.target.value)}
              placeholder="Add coverage area (e.g., Local, Regional, National)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCoverageArea()}
            />
            <button
              onClick={handleAddCoverageArea}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {locationSettings.coverage_areas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">{area}</span>
                <button
                  onClick={() => handleRemoveCoverageArea(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {locationSettings.coverage_areas.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No coverage areas defined. Add areas where your organization operates.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Regional Settings</h4>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              value={locationSettings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              value={locationSettings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Primary Language
            </label>
            <select
              value={locationSettings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Multi-location Support */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Multi-location Support</h4>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Enable Multiple Locations</label>
              <p className="text-sm text-gray-500">Allow your organization to have multiple physical locations</p>
            </div>
            <button
              onClick={() => handleSettingChange('multiple_locations', !locationSettings.multiple_locations)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                locationSettings.multiple_locations ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  locationSettings.multiple_locations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {locationSettings.multiple_locations && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Multiple locations feature will allow members to associate with specific locations 
                and filter content by location. Additional location management tools will be available 
                in the administration panel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Location Configuration Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Accurate coordinates help with map displays and location-based features</li>
              <li>Coverage areas help members understand your organization's scope</li>
              <li>Service radius is used for proximity-based matching and recommendations</li>
              <li>Regional settings affect date/time formats and currency displays</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};