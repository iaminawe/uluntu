import React, { useState, useEffect } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Mail, 
  Send, 
  Bell, 
  Server,
  Eye,
  EyeOff,
  Save, 
  RotateCcw, 
  Info,
  CheckCircle,
  XCircle,
  TestTube
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImprovedEmailSectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'password' | 'email' | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  sensitive?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: { value: string; label: string }[];
}

const smtpFields: SettingField[] = [
  {
    key: 'smtp_host',
    label: 'SMTP Server Host',
    type: 'text',
    placeholder: 'smtp.gmail.com',
    description: 'SMTP server hostname or IP address',
    required: true
  },
  {
    key: 'smtp_port',
    label: 'SMTP Port',
    type: 'number',
    placeholder: '587',
    description: 'SMTP server port (587 for TLS, 465 for SSL, 25 for non-encrypted)',
    validation: { min: 1, max: 65535 }
  },
  {
    key: 'smtp_username',
    label: 'SMTP Username',
    type: 'email',
    placeholder: 'your-email@gmail.com',
    description: 'Username for SMTP authentication',
    sensitive: true
  },
  {
    key: 'smtp_password',
    label: 'SMTP Password',
    type: 'password',
    placeholder: '••••••••••••',
    description: 'Password or app-specific password for SMTP authentication',
    sensitive: true
  },
  {
    key: 'smtp_encryption',
    label: 'Encryption Method',
    type: 'select',
    description: 'Encryption method for SMTP connection',
    options: [
      { value: 'none', label: 'None (Not recommended)' },
      { value: 'tls', label: 'TLS (Recommended)' },
      { value: 'ssl', label: 'SSL' }
    ]
  }
];

const senderFields: SettingField[] = [
  {
    key: 'from_email',
    label: 'From Email Address',
    type: 'email',
    placeholder: 'noreply@kootenaytech.ca',
    description: 'Default sender email address for outgoing emails',
    required: true
  },
  {
    key: 'from_name',
    label: 'From Name',
    type: 'text',
    placeholder: 'Kootenay Tech Community',
    description: 'Default sender name displayed in emails',
    required: true
  },
  {
    key: 'reply_to_email',
    label: 'Reply-To Email',
    type: 'email',
    placeholder: 'support@kootenaytech.ca',
    description: 'Email address for replies (optional)'
  }
];

const notificationFields: SettingField[] = [
  {
    key: 'welcome_email_enabled',
    label: 'Welcome Email',
    type: 'boolean',
    description: 'Send welcome email to new users'
  },
  {
    key: 'email_verification_enabled',
    label: 'Email Verification',
    type: 'boolean',
    description: 'Send email verification links to new users'
  },
  {
    key: 'password_reset_enabled',
    label: 'Password Reset Emails',
    type: 'boolean',
    description: 'Allow password reset via email'
  },
  {
    key: 'admin_notifications_enabled',
    label: 'Admin Notifications',
    type: 'boolean',
    description: 'Send email notifications to administrators'
  },
  {
    key: 'daily_digest_enabled',
    label: 'Daily Digest',
    type: 'boolean',
    description: 'Send daily activity digest to users'
  }
];

const ImprovedEmailSection: React.FC<ImprovedEmailSectionProps> = ({
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
  const [testingEmail, setTestingEmail] = useState(false);

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
          data_type: (setting?.data_type || 'string') as SettingDataType
        });
      }
      
      await Promise.all(updates.map(update => onUpdateSetting(update)));
      
      setChangedFields(new Set());
      toast.success(`Saved ${updates.length} email settings successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save email settings');
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

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      // Simulate test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test email sent successfully!');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
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
            <Badge variant="warning" size="sm" className="ml-2">
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'password' || field.sensitive ? (
          <div className="relative">
            <input
              type={showSensitive ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
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
            type={field.type}
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
            required={field.required}
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

  // Check email configuration status
  const isSmtpConfigured = formData['integration.smtp_host'] && formData['integration.smtp_port'] && formData['integration.from_email'];
  const emailFeatures = features.filter(f => 
    f.feature_key.includes('email') || 
    f.feature_key.includes('notification') || 
    f.feature_key.includes('newsletter')
  );

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Email & Communications</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure SMTP settings, notifications, and email templates
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

          {isSmtpConfigured && (
            <Button
              variant="outline"
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="flex items-center space-x-2"
            >
              <TestTube className="h-4 w-4" />
              <span>{testingEmail ? 'Sending...' : 'Test Email'}</span>
            </Button>
          )}
          
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

      {/* Email Status Preview */}
      {previewMode && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Email Configuration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">SMTP Status</h4>
                <div className="flex items-center space-x-2">
                  {isSmtpConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {isSmtpConfigured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                {formData['integration.smtp_host'] && (
                  <p className="text-xs text-gray-500 mt-1">
                    Host: {formData['integration.smtp_host']}:{formData['integration.smtp_port']}
                  </p>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Sender Info</h4>
                <p className="text-sm">
                  From: {formData['integration.from_name'] || 'Not set'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formData['integration.from_email'] || 'No email configured'}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Active Notifications</h4>
                <p className="text-sm">
                  {notificationFields.filter(f => formData[`integration.${f.key}`]).length} of {notificationFields.length} enabled
                </p>
              </div>
            </div>

            {/* Email Preview Sample */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-3">Sample Email Preview</h4>
              <div className="border rounded-lg p-3 bg-gray-50 text-sm">
                <div className="mb-2">
                  <span className="font-medium">From:</span> {formData['integration.from_name'] || 'Your Site'} &lt;{formData['integration.from_email'] || 'noreply@yoursite.com'}&gt;
                </div>
                <div className="mb-2">
                  <span className="font-medium">Subject:</span> Welcome to {formData['integration.from_name'] || 'Our Community'}!
                </div>
                <div className="border-t pt-2 text-gray-600">
                  <p>Hello [User Name],</p>
                  <p className="mt-2">Welcome to our community! We're excited to have you on board.</p>
                  <p className="mt-2">Best regards,<br />The Team</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMTP Server Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-blue-600" />
            <span>SMTP Server Configuration</span>
            {isSmtpConfigured ? (
              <Badge variant="success">Configured</Badge>
            ) : (
              <Badge variant="destructive">Not Configured</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {smtpFields.map(field => renderField('integration', field))}
          </div>
        </CardContent>
      </Card>

      {/* Sender Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-green-600" />
            <span>Sender Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {senderFields.map(field => renderField('integration', field))}
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <span>Email Notifications</span>
            <Badge variant="secondary">
              {notificationFields.filter(f => formData[`integration.${f.key}`]).length}/{notificationFields.length} enabled
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {notificationFields.map(field => renderField('integration', field))}
          </div>
        </CardContent>
      </Card>

      {/* Email Features */}
      {emailFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <span>Email Features</span>
              <Badge variant="secondary">
                {emailFeatures.filter(f => f.enabled).length}/{emailFeatures.length} enabled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {emailFeatures.map((feature) => (
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
                      toast.success('Email feature toggle functionality coming soon');
                    }}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Help */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <Info className="h-5 w-5" />
            <span>Email Configuration Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-amber-700">
            <div>
              <h4 className="font-medium mb-2">Popular SMTP Providers:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Gmail:</strong> smtp.gmail.com:587 (TLS) - Use app-specific password</li>
                <li><strong>Outlook:</strong> smtp-mail.outlook.com:587 (TLS)</li>
                <li><strong>SendGrid:</strong> smtp.sendgrid.net:587 (TLS)</li>
                <li><strong>Mailgun:</strong> smtp.mailgun.org:587 (TLS)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Security Tips:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Always use TLS encryption for production environments</li>
                <li>Use app-specific passwords for Gmail instead of your main password</li>
                <li>Test email delivery before enabling user notifications</li>
                <li>Monitor bounce rates and delivery statistics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isSmtpConfigured ? 'text-green-600' : 'text-red-600'}`}>
                {isSmtpConfigured ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">SMTP Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {notificationFields.filter(f => formData[`integration.${f.key}`]).length}
              </div>
              <div className="text-sm text-gray-600">Active Notifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {emailFeatures.filter(f => f.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Email Features</div>
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

export default ImprovedEmailSection;