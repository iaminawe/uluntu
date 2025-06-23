import React, { useState, useMemo, useCallback } from 'react';
import { 
  Shield, 
  Lock, 
  Key,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAdminSettings } from '@/hooks/useSettings';
import { toast } from 'react-hot-toast';

interface SecurityPanelProps {
  settings: any[];
  onRefresh: () => void;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  password_requirements: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };
  session_timeout: number;
  max_login_attempts: number;
  lockout_duration: number;
  require_email_verification: boolean;
  api_rate_limiting: {
    enabled: boolean;
    requests_per_minute: number;
  };
  content_security_policy: boolean;
  https_only: boolean;
  secure_cookies: boolean;
  ip_whitelist: string[];
  suspicious_activity_monitoring: boolean;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({ 
  settings, 
  onRefresh 
}) => {
  const { settings: allSettings, updateSetting, loading: settingsLoading } = useAdminSettings();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Map database settings to security configuration
  const securitySettings = useMemo((): SecuritySettings => {
    const getSettingValue = (category: string, key: string, defaultValue: any) => {
      const setting = allSettings.find(s => s.category === category && s.setting_key === key);
      return setting ? setting.setting_value : defaultValue;
    };

    return {
      two_factor_enabled: getSettingValue('security', 'two_factor_enabled', false),
      password_requirements: {
        min_length: getSettingValue('security', 'password_min_length', 8),
        require_uppercase: getSettingValue('security', 'require_uppercase', true),
        require_lowercase: getSettingValue('security', 'require_lowercase', true),
        require_numbers: getSettingValue('security', 'require_numbers', true),
        require_symbols: getSettingValue('security', 'require_symbols', false),
      },
      session_timeout: getSettingValue('security', 'session_timeout', 24),
      max_login_attempts: getSettingValue('security', 'max_login_attempts', 5),
      lockout_duration: getSettingValue('security', 'lockout_duration', 30),
      require_email_verification: getSettingValue('security', 'require_email_verification', true),
      api_rate_limiting: {
        enabled: getSettingValue('security', 'api_rate_limiting_enabled', true),
        requests_per_minute: getSettingValue('security', 'api_rate_limit', 60),
      },
      content_security_policy: getSettingValue('security', 'content_security_policy', true),
      https_only: getSettingValue('security', 'https_only', true),
      secure_cookies: getSettingValue('security', 'secure_cookies', true),
      ip_whitelist: getSettingValue('security', 'ip_whitelist', []),
      suspicious_activity_monitoring: getSettingValue('security', 'suspicious_activity_monitoring', true),
    };
  }, [allSettings]);

  const [localSettings, setLocalSettings] = useState<SecuritySettings>(securitySettings);

  // Update local settings when database settings change
  React.useEffect(() => {
    setLocalSettings(securitySettings);
    setHasChanges(false);
  }, [securitySettings]);

  const handleSettingChange = useCallback((path: string, value: any) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Save each security setting to the database
      const updates = [
        { category: 'security', setting_key: 'two_factor_enabled', setting_value: localSettings.two_factor_enabled, data_type: 'boolean' },
        { category: 'security', setting_key: 'password_min_length', setting_value: localSettings.password_requirements.min_length, data_type: 'number' },
        { category: 'security', setting_key: 'require_uppercase', setting_value: localSettings.password_requirements.require_uppercase, data_type: 'boolean' },
        { category: 'security', setting_key: 'require_lowercase', setting_value: localSettings.password_requirements.require_lowercase, data_type: 'boolean' },
        { category: 'security', setting_key: 'require_numbers', setting_value: localSettings.password_requirements.require_numbers, data_type: 'boolean' },
        { category: 'security', setting_key: 'require_symbols', setting_value: localSettings.password_requirements.require_symbols, data_type: 'boolean' },
        { category: 'security', setting_key: 'session_timeout', setting_value: localSettings.session_timeout, data_type: 'number' },
        { category: 'security', setting_key: 'max_login_attempts', setting_value: localSettings.max_login_attempts, data_type: 'number' },
        { category: 'security', setting_key: 'lockout_duration', setting_value: localSettings.lockout_duration, data_type: 'number' },
        { category: 'security', setting_key: 'require_email_verification', setting_value: localSettings.require_email_verification, data_type: 'boolean' },
        { category: 'security', setting_key: 'api_rate_limiting_enabled', setting_value: localSettings.api_rate_limiting.enabled, data_type: 'boolean' },
        { category: 'security', setting_key: 'api_rate_limit', setting_value: localSettings.api_rate_limiting.requests_per_minute, data_type: 'number' },
        { category: 'security', setting_key: 'content_security_policy', setting_value: localSettings.content_security_policy, data_type: 'boolean' },
        { category: 'security', setting_key: 'https_only', setting_value: localSettings.https_only, data_type: 'boolean' },
        { category: 'security', setting_key: 'secure_cookies', setting_value: localSettings.secure_cookies, data_type: 'boolean' },
        { category: 'security', setting_key: 'ip_whitelist', setting_value: localSettings.ip_whitelist, data_type: 'array' },
        { category: 'security', setting_key: 'suspicious_activity_monitoring', setting_value: localSettings.suspicious_activity_monitoring, data_type: 'boolean' },
      ];

      for (const update of updates) {
        await updateSetting(update);
      }

      setHasChanges(false);
      toast.success('Security settings saved successfully');
      onRefresh();
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  }, [localSettings, updateSetting, onRefresh]);

  const handleReset = useCallback(() => {
    setLocalSettings(securitySettings);
    setHasChanges(false);
  }, [securitySettings]);

  const [showIpInput, setShowIpInput] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');

  const handleAddIpAddress = () => {
    if (newIpAddress.trim() && !localSettings.ip_whitelist.includes(newIpAddress.trim())) {
      const updatedList = [...localSettings.ip_whitelist, newIpAddress.trim()];
      handleSettingChange('ip_whitelist', updatedList);
      setNewIpAddress('');
      setShowIpInput(false);
    }
  };

  const handleRemoveIpAddress = (index: number) => {
    const updatedList = localSettings.ip_whitelist.filter((_, i) => i !== index);
    handleSettingChange('ip_whitelist', updatedList);
  };

  const getPasswordStrength = () => {
    const { password_requirements } = localSettings;
    let score = 0;
    
    if (password_requirements.min_length >= 8) score += 1;
    if (password_requirements.min_length >= 12) score += 1;
    if (password_requirements.require_uppercase) score += 1;
    if (password_requirements.require_lowercase) score += 1;
    if (password_requirements.require_numbers) score += 1;
    if (password_requirements.require_symbols) score += 1;
    
    if (score <= 2) return { level: 'Weak', color: 'red' };
    if (score <= 4) return { level: 'Medium', color: 'yellow' };
    return { level: 'Strong', color: 'green' };
  };

  const securityScore = () => {
    let score = 0;
    const maxScore = 10;
    
    if (localSettings.two_factor_enabled) score += 2;
    if (localSettings.require_email_verification) score += 1;
    if (localSettings.password_requirements.min_length >= 8) score += 1;
    if (localSettings.session_timeout <= 1440) score += 1;
    if (localSettings.api_rate_limiting.enabled) score += 1;
    if (localSettings.content_security_policy) score += 1;
    if (localSettings.https_only) score += 1;
    if (localSettings.secure_cookies) score += 1;
    if (localSettings.suspicious_activity_monitoring) score += 1;
    
    return { score, maxScore, percentage: (score / maxScore) * 100 };
  };

  const passwordStrength = getPasswordStrength();
  const security = securityScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure security policies and access controls
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <button
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </button>
            
            <button
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Security Score */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">Security Score</h4>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {security.score}/{security.maxScore}
              </div>
              <div className="text-sm text-gray-500">Security Score</div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                security.percentage >= 80 ? 'text-green-600' :
                security.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(security.percentage)}%
              </div>
              <div className="text-sm text-gray-500">Security Level</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                security.percentage >= 80 ? 'bg-green-500' :
                security.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${security.percentage}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600 mt-3">
            {security.percentage >= 80 ? 'Excellent security configuration!' :
             security.percentage >= 60 ? 'Good security, consider enabling more features.' :
             'Security needs improvement. Enable more protection features.'}
          </p>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Key className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Authentication</h4>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Two-Factor Authentication</label>
              <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
            </div>
            <button
              onClick={() => handleSettingChange('two_factor_enabled', !localSettings.two_factor_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.two_factor_enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.two_factor_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Email Verification</label>
              <p className="text-sm text-gray-500">Require email verification for new accounts</p>
            </div>
            <button
              onClick={() => handleSettingChange('require_email_verification', !localSettings.require_email_verification)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.require_email_verification ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.require_email_verification ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">Password Requirements</h4>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              passwordStrength.color === 'green' ? 'bg-green-100 text-green-800' :
              passwordStrength.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {passwordStrength.level}
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Minimum Password Length
            </label>
            <input
              type="range"
              min="6"
              max="20"
              step="1"
              value={localSettings.password_requirements.min_length}
              onChange={(e) => handleSettingChange('password_requirements.min_length', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>6 characters</span>
              <span>{localSettings.password_requirements.min_length} characters</span>
              <span>20 characters</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Uppercase</label>
              <button
                onClick={() => handleSettingChange('password_requirements.require_uppercase', !localSettings.password_requirements.require_uppercase)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localSettings.password_requirements.require_uppercase ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    localSettings.password_requirements.require_uppercase ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Lowercase</label>
              <button
                onClick={() => handleSettingChange('password_requirements.require_lowercase', !localSettings.password_requirements.require_lowercase)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localSettings.password_requirements.require_lowercase ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    localSettings.password_requirements.require_lowercase ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Numbers</label>
              <button
                onClick={() => handleSettingChange('password_requirements.require_numbers', !localSettings.password_requirements.require_numbers)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localSettings.password_requirements.require_numbers ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    localSettings.password_requirements.require_numbers ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Symbols</label>
              <button
                onClick={() => handleSettingChange('password_requirements.require_symbols', !localSettings.password_requirements.require_symbols)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localSettings.password_requirements.require_symbols ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    localSettings.password_requirements.require_symbols ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session & Access Control */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <h4 className="font-medium text-gray-900">Session & Access Control</h4>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="10080"
              value={localSettings.session_timeout}
              onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">Time before users are automatically logged out</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={localSettings.max_login_attempts}
              onChange={(e) => handleSettingChange('max_login_attempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">Failed attempts before account lockout</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={localSettings.lockout_duration}
              onChange={(e) => handleSettingChange('lockout_duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">How long accounts remain locked</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              API Rate Limit (per minute)
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={localSettings.api_rate_limiting.requests_per_minute}
              onChange={(e) => handleSettingChange('api_rate_limiting.requests_per_minute', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!localSettings.api_rate_limiting.enabled}
            />
            <p className="text-xs text-gray-500">Maximum API requests per minute</p>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Advanced Security Features</h4>
        </div>
        
        <div className="p-6 space-y-6">
          {[
            {
              key: 'api_rate_limiting.enabled',
              label: 'API Rate Limiting',
              description: 'Limit API requests to prevent abuse',
              value: localSettings.api_rate_limiting.enabled
            },
            {
              key: 'content_security_policy',
              label: 'Content Security Policy',
              description: 'Prevent XSS and code injection attacks',
              value: localSettings.content_security_policy
            },
            {
              key: 'https_only',
              label: 'HTTPS Only',
              description: 'Force all connections to use HTTPS',
              value: localSettings.https_only
            },
            {
              key: 'secure_cookies',
              label: 'Secure Cookies',
              description: 'Use secure cookie attributes',
              value: localSettings.secure_cookies
            },
            {
              key: 'suspicious_activity_monitoring',
              label: 'Activity Monitoring',
              description: 'Monitor and alert on suspicious activities',
              value: localSettings.suspicious_activity_monitoring
            }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">{setting.label}</label>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <button
                onClick={() => handleSettingChange(setting.key, !setting.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  setting.value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    setting.value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">IP Address Whitelist</h4>
            <button
              onClick={() => setShowIpInput(!showIpInput)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add IP
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {showIpInput && (
            <div className="flex space-x-3">
              <input
                type="text"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                placeholder="192.168.1.100 or 192.168.1.0/24"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddIpAddress}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowIpInput(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="space-y-2">
            {localSettings.ip_whitelist.map((ip, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-mono text-sm">{ip}</span>
                <button
                  onClick={() => handleRemoveIpAddress(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {localSettings.ip_whitelist.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No IP addresses whitelisted. All IPs are allowed by default.
              </p>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            Add IP addresses or ranges that should have special access privileges. 
            Use CIDR notation for ranges (e.g., 192.168.1.0/24).
          </p>
        </div>
      </div>

      {/* Security Warnings */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Security Recommendations:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>Enable two-factor authentication for all admin accounts</li>
              <li>Use strong password requirements (12+ characters with mixed case, numbers, symbols)</li>
              <li>Set reasonable session timeouts to balance security and usability</li>
              <li>Monitor security logs regularly for suspicious activities</li>
              <li>Keep IP whitelist updated and remove unused entries</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Changes
              </button>
              <button
                onClick={handleSave}
                disabled={saving || settingsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};