import React, { useState, useEffect } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Settings as SettingsIcon,
  Save, 
  RotateCcw, 
  Info,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImprovedUserManagementSectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

const registrationFields: SettingField[] = [
  {
    key: 'registration_enabled',
    label: 'Allow User Registration',
    type: 'boolean',
    description: 'Enable public user registration on the platform'
  },
  {
    key: 'registration_approval_required',
    label: 'Require Admin Approval',
    type: 'boolean',
    description: 'New registrations must be approved by administrators'
  },
  {
    key: 'email_verification_required',
    label: 'Require Email Verification',
    type: 'boolean',
    description: 'Users must verify their email address before accessing the platform'
  },
  {
    key: 'registration_invitation_only',
    label: 'Invitation Only Registration',
    type: 'boolean',
    description: 'Only users with invitation codes can register'
  }
];

const profileFields: SettingField[] = [
  {
    key: 'profile_editing_enabled',
    label: 'Allow Profile Editing',
    type: 'boolean',
    description: 'Users can edit their own profile information'
  },
  {
    key: 'profile_photo_required',
    label: 'Require Profile Photo',
    type: 'boolean',
    description: 'Users must upload a profile photo'
  },
  {
    key: 'profile_visibility_default',
    label: 'Default Profile Visibility',
    type: 'select',
    description: 'Default visibility setting for new user profiles',
    options: [
      { value: 'public', label: 'Public - Visible to everyone' },
      { value: 'members', label: 'Members Only - Visible to logged-in users' },
      { value: 'private', label: 'Private - Only visible to user' }
    ]
  }
];

const limitFields: SettingField[] = [
  {
    key: 'max_daily_posts',
    label: 'Daily Post Limit',
    type: 'number',
    placeholder: '10',
    description: 'Maximum number of posts a user can create per day (0 for unlimited)',
    validation: { min: 0, max: 100, step: 1 }
  },
  {
    key: 'max_file_upload_size',
    label: 'File Upload Limit (MB)',
    type: 'number',
    placeholder: '10',
    description: 'Maximum file size for user uploads in megabytes',
    validation: { min: 1, max: 100, step: 1 }
  },
  {
    key: 'session_timeout_minutes',
    label: 'Session Timeout (Minutes)',
    type: 'number',
    placeholder: '480',
    description: 'Automatic logout after inactivity period',
    validation: { min: 15, max: 1440, step: 15 }
  }
];

const ImprovedUserManagementSection: React.FC<ImprovedUserManagementSectionProps> = ({
  settings,
  features,
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
      toast.success(`Saved ${updates.length} user settings successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save user settings');
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
    const value = formData[fieldKey];
    const hasChanged = changedFields.has(fieldKey);
    
    return (
      <div key={fieldKey} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'boolean' ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(category, field.key, checked)}
              className={hasChanged ? 'ring-2 ring-blue-300' : ''}
            />
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
        ) : field.type === 'number' ? (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.step}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors ${
              hasChanged ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600'
            }`}
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors ${
              hasChanged ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600'
            }`}
          />
        )}
        
        {field.description && (
          <p className="text-xs text-gray-500 flex items-start">
            <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
            {field.description}
          </p>
        )}
      </div>
    );
  };

  // Filter user-related features
  const userFeatures = features.filter(f => 
    f.feature_key.includes('user') || 
    f.feature_key.includes('registration') || 
    f.feature_key.includes('profile') ||
    f.feature_key.includes('social')
  );

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure user registration, profiles, and community settings
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

      {/* Settings Preview */}
      {previewMode && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-800">User Management Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Registration Status</h4>
                <div className="flex items-center space-x-2">
                  {formData['community.registration_enabled'] ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    Registration {formData['community.registration_enabled'] ? 'Open' : 'Closed'}
                  </span>
                </div>
                {formData['community.registration_approval_required'] && (
                  <p className="text-xs text-amber-600 mt-1">Requires admin approval</p>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Profile Settings</h4>
                <p className="text-sm">
                  Visibility: {formData['community.profile_visibility_default'] || 'Public'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Photo {formData['community.profile_photo_required'] ? 'Required' : 'Optional'}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Usage Limits</h4>
                <p className="text-sm">
                  Daily posts: {formData['limits.max_daily_posts'] || 'Unlimited'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  File limit: {formData['limits.max_file_upload_size'] || '10'}MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            <span>Registration & Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {registrationFields.map(field => renderField('community', field))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Profile Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {profileFields.map(field => renderField('community', field))}
          </div>
        </CardContent>
      </Card>

      {/* Limits & Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span>Limits & Restrictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {limitFields.map(field => renderField('limits', field))}
          </div>
        </CardContent>
      </Card>

      {/* User Features */}
      {userFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-purple-600" />
              <span>User Features</span>
              <Badge variant="secondary">
                {userFeatures.filter(f => f.enabled).length}/{userFeatures.length} enabled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {userFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {feature.feature_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      {feature.enabled && (
                        <Badge variant="success" size="sm">Active</Badge>
                      )}
                    </div>
                    {feature.description && (
                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={feature.enabled || false}
                    onCheckedChange={(checked) => {
                      toast.success('Feature toggle functionality coming soon');
                    }}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <Info className="h-5 w-5" />
            <span>Security & Privacy Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-amber-700">
            <li>Email verification helps prevent spam and ensures valid contact information</li>
            <li>Admin approval provides additional security but may slow user onboarding</li>
            <li>Profile visibility settings should balance community engagement with privacy</li>
            <li>Rate limiting helps prevent abuse and ensures fair resource usage</li>
            <li>Session timeouts enhance security for shared or public computers</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>User Management Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {registrationFields.length}
              </div>
              <div className="text-sm text-gray-600">Registration Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profileFields.length}
              </div>
              <div className="text-sm text-gray-600">Profile Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {limitFields.length}
              </div>
              <div className="text-sm text-gray-600">Limit Settings</div>
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

export default ImprovedUserManagementSection;
export { ImprovedUserManagementSection };