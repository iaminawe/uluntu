import React, { useState, useEffect } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Shield, 
  Key, 
  Lock, 
  AlertTriangle,
  Eye,
  EyeOff,
  Save, 
  RotateCcw, 
  Info,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImprovedSecuritySectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'password' | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  sensitive?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

const authenticationFields: SettingField[] = [
  {
    key: 'password_min_length',
    label: 'Minimum Password Length',
    type: 'number',
    placeholder: '8',
    description: 'Minimum number of characters required for passwords',
    validation: { min: 4, max: 50 }
  },
  {
    key: 'password_require_uppercase',
    label: 'Require Uppercase Letters',
    type: 'boolean',
    description: 'Passwords must contain at least one uppercase letter'
  },
  {
    key: 'password_require_numbers',
    label: 'Require Numbers',
    type: 'boolean',
    description: 'Passwords must contain at least one number'
  },
  {
    key: 'password_require_symbols',
    label: 'Require Special Characters',
    type: 'boolean',
    description: 'Passwords must contain at least one special character'
  },
  {
    key: 'max_login_attempts',
    label: 'Maximum Login Attempts',
    type: 'number',
    placeholder: '5',
    description: 'Number of failed login attempts before account lockout',
    validation: { min: 3, max: 20 }
  },
  {
    key: 'lockout_duration_minutes',
    label: 'Lockout Duration (Minutes)',
    type: 'number',
    placeholder: '30',
    description: 'How long accounts remain locked after failed attempts',
    validation: { min: 5, max: 1440 }
  }
];

const sessionFields: SettingField[] = [
  {
    key: 'session_security_level',
    label: 'Session Security Level',
    type: 'select',
    description: 'Security level for user sessions',
    options: [
      { value: 'basic', label: 'Basic - Standard session management' },
      { value: 'enhanced', label: 'Enhanced - Additional security checks' },
      { value: 'strict', label: 'Strict - Maximum security (may impact UX)' }
    ]
  },
  {
    key: 'require_https',
    label: 'Force HTTPS',
    type: 'boolean',
    description: 'Redirect all HTTP traffic to HTTPS automatically'
  },
  {
    key: 'secure_cookies_only',
    label: 'Secure Cookies Only',
    type: 'boolean',
    description: 'Only allow cookies over secure HTTPS connections'
  },
  {
    key: 'same_site_cookie_policy',
    label: 'SameSite Cookie Policy',
    type: 'select',
    description: 'Cross-site request protection level',
    options: [
      { value: 'lax', label: 'Lax - Balanced security and functionality' },
      { value: 'strict', label: 'Strict - Maximum protection' },
      { value: 'none', label: 'None - Allow all cross-site requests' }
    ]
  }
];

const accessControlFields: SettingField[] = [
  {
    key: 'ip_whitelist_enabled',
    label: 'Enable IP Whitelist',
    type: 'boolean',
    description: 'Restrict admin access to specific IP addresses'
  },
  {
    key: 'admin_ip_whitelist',
    label: 'Admin IP Whitelist',
    type: 'text',
    placeholder: '192.168.1.0/24, 10.0.0.1',
    description: 'Comma-separated list of allowed IP addresses/ranges for admin access',
    sensitive: true
  },
  {
    key: 'rate_limit_enabled',
    label: 'Enable Rate Limiting',
    type: 'boolean',
    description: 'Limit API requests per user to prevent abuse'
  },
  {
    key: 'api_rate_limit_per_minute',
    label: 'API Rate Limit (per minute)',
    type: 'number',
    placeholder: '60',
    description: 'Maximum API requests per user per minute',
    validation: { min: 10, max: 1000 }
  }
];

const encryptionFields: SettingField[] = [
  {
    key: 'data_encryption_enabled',
    label: 'Enable Data Encryption',
    type: 'boolean',
    description: 'Encrypt sensitive data at rest in the database'
  },
  {
    key: 'encryption_algorithm',
    label: 'Encryption Algorithm',
    type: 'select',
    description: 'Algorithm used for data encryption',
    options: [
      { value: 'aes-256-gcm', label: 'AES-256-GCM (Recommended)' },
      { value: 'aes-256-cbc', label: 'AES-256-CBC' },
      { value: 'chacha20-poly1305', label: 'ChaCha20-Poly1305' }
    ]
  }
];

const ImprovedSecuritySection: React.FC<ImprovedSecuritySectionProps> = ({
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
  const [showSensitive, setShowSensitive] = useState(false);

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
      toast.success(`Saved ${updates.length} security settings successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save security settings');
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
          {field.sensitive && (
            <Badge variant="destructive" size="sm" className="ml-2">
              Sensitive
            </Badge>
          )}
        </label>
        
        {field.type === 'boolean' ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className="text-sm font-medium">
                  {value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(category, field.key, checked)}
              className={hasChanged ? 'ring-2 ring-red-300' : ''}
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
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-500/20 transition-colors ${
              hasChanged ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600'
            }`}
          />
        ) : field.type === 'password' || field.sensitive ? (
          <div className="relative">
            <input
              type={showSensitive ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                hasChanged ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowSensitive(!showSensitive)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showSensitive ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
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

  // Calculate security score
  const calculateSecurityScore = () => {
    let score = 0;
    let maxScore = 0;

    // Password policy (30 points)
    maxScore += 30;
    if (formData['security.password_min_length'] >= 8) score += 10;
    if (formData['security.password_require_uppercase']) score += 5;
    if (formData['security.password_require_numbers']) score += 5;
    if (formData['security.password_require_symbols']) score += 10;

    // Session security (25 points)
    maxScore += 25;
    if (formData['security.require_https']) score += 10;
    if (formData['security.secure_cookies_only']) score += 5;
    if (formData['security.session_security_level'] === 'strict') score += 10;
    else if (formData['security.session_security_level'] === 'enhanced') score += 5;

    // Access control (25 points)
    maxScore += 25;
    if (formData['security.rate_limit_enabled']) score += 10;
    if (formData['security.ip_whitelist_enabled']) score += 10;
    if (formData['security.max_login_attempts'] <= 5) score += 5;

    // Encryption (20 points)
    maxScore += 20;
    if (formData['security.data_encryption_enabled']) score += 20;

    return Math.round((score / maxScore) * 100);
  };

  const securityScore = calculateSecurityScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter security features
  const securityFeatures = features.filter(f => 
    f.feature_key.includes('security') || 
    f.feature_key.includes('auth') || 
    f.feature_key.includes('mfa') ||
    f.feature_key.includes('encryption')
  );

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Security & Access Control</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure authentication, encryption, and access control settings
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
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-xs rounded-full">
                  {changedFields.size}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Security Score & Preview */}
      {previewMode && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-red-800">Security Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}%
              </div>
              <p className="text-sm text-gray-600">Security Score</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    securityScore >= 80 ? 'bg-green-500' :
                    securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
            </div>

            {/* Security Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Password Policy</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    {formData['security.password_min_length'] >= 8 ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>Min length: {formData['security.password_min_length'] || 'Not set'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData['security.password_require_uppercase'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>Uppercase required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData['security.password_require_numbers'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>Numbers required</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Session Security</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    {formData['security.require_https'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>HTTPS enforced</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData['security.secure_cookies_only'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>Secure cookies</span>
                  </div>
                  <p>Level: {formData['security.session_security_level'] || 'Basic'}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Access Control</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    {formData['security.rate_limit_enabled'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>Rate limiting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData['security.ip_whitelist_enabled'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>IP whitelist</span>
                  </div>
                  <p>Login attempts: {formData['security.max_login_attempts'] || 'Unlimited'}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Encryption</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    {formData['security.data_encryption_enabled'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>Data encryption</span>
                  </div>
                  <p>Algorithm: {formData['security.encryption_algorithm'] || 'None'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authentication Settings */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <span>Authentication & Passwords</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {authenticationFields.map(field => renderField('security', field))}
          </div>
        </CardContent>
      </Card>

      {/* Session Security */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-green-600" />
            <span>Session Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sessionFields.map(field => renderField('security', field))}
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span>Access Control & Rate Limiting</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {accessControlFields.map(field => renderField('security', field))}
          </div>
        </CardContent>
      </Card>

      {/* Encryption Settings */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-purple-600" />
            <span>Data Encryption</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {encryptionFields.map(field => renderField('security', field))}
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      {securityFeatures.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Security Features</span>
              <Badge variant="secondary">
                {securityFeatures.filter(f => f.enabled).length}/{securityFeatures.length} enabled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {securityFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-red-50">
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
                      toast.success('Security feature toggle functionality coming soon');
                    }}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Warning */}
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Notice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
            <li><strong>Test in staging first:</strong> Security changes can lock out users or break functionality</li>
            <li><strong>Backup before changes:</strong> Always backup your database before modifying security settings</li>
            <li><strong>Monitor after deployment:</strong> Watch for increased support tickets or login failures</li>
            <li><strong>Document changes:</strong> Keep records of what was changed and when for audit purposes</li>
            <li><strong>IP whitelist warning:</strong> Adding IP restrictions can lock you out if configured incorrectly</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Security Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}%
              </div>
              <div className="text-sm text-gray-600">Security Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {authenticationFields.length}
              </div>
              <div className="text-sm text-gray-600">Auth Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {securityFeatures.filter(f => f.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Active Features</div>
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

export default ImprovedSecuritySection;