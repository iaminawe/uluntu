import React, { useState, useEffect } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest, SettingDataType } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  MessageSquare, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Globe,
  Eye,
  EyeOff,
  Save, 
  RotateCcw, 
  Info,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImprovedContactSectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'boolean' | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    maxLength?: number;
  };
  options?: { value: string; label: string }[];
}

const contactInfoFields: SettingField[] = [
  {
    key: 'contact_email',
    label: 'Primary Contact Email',
    type: 'email',
    placeholder: 'contact@kootenaytech.ca',
    description: 'Main email address for general inquiries',
    required: true
  },
  {
    key: 'support_email',
    label: 'Support Email',
    type: 'email',
    placeholder: 'support@kootenaytech.ca',
    description: 'Email address for technical support requests'
  },
  {
    key: 'business_email',
    label: 'Business Email',
    type: 'email',
    placeholder: 'business@kootenaytech.ca',
    description: 'Email address for business inquiries and partnerships'
  },
  {
    key: 'contact_form_enabled',
    label: 'Enable Contact Form',
    type: 'boolean',
    description: 'Allow users to submit inquiries through website contact form'
  }
];

const phoneFields: SettingField[] = [
  {
    key: 'primary_phone',
    label: 'Primary Phone Number',
    type: 'tel',
    placeholder: '+1 (250) 555-0123',
    description: 'Main phone number for the organization'
  },
  {
    key: 'support_phone',
    label: 'Support Phone',
    type: 'tel',
    placeholder: '+1 (250) 555-0124',
    description: 'Phone number for technical support (optional)'
  },
  {
    key: 'phone_hours',
    label: 'Phone Support Hours',
    type: 'text',
    placeholder: 'Mon-Fri 9AM-5PM PST',
    description: 'Available hours for phone support'
  }
];

const locationFields: SettingField[] = [
  {
    key: 'organization_name',
    label: 'Organization Name',
    type: 'text',
    placeholder: 'Kootenay Tech Community',
    description: 'Official name of the organization',
    required: true
  },
  {
    key: 'street_address',
    label: 'Street Address',
    type: 'textarea',
    placeholder: '123 Tech Street\nSuite 456',
    description: 'Physical street address (optional)',
    validation: { maxLength: 200 }
  },
  {
    key: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'Nelson',
    description: 'City where organization is located'
  },
  {
    key: 'province_state',
    label: 'Province/State',
    type: 'text',
    placeholder: 'British Columbia',
    description: 'Province or state'
  },
  {
    key: 'postal_code',
    label: 'Postal/Zip Code',
    type: 'text',
    placeholder: 'V1L 1A1',
    description: 'Postal or zip code'
  },
  {
    key: 'country',
    label: 'Country',
    type: 'text',
    placeholder: 'Canada',
    description: 'Country where organization is located'
  }
];

const socialFields: SettingField[] = [
  {
    key: 'website_url',
    label: 'Website URL',
    type: 'url',
    placeholder: 'https://kootenaytech.ca',
    description: 'Main website URL'
  },
  {
    key: 'facebook_url',
    label: 'Facebook URL',
    type: 'url',
    placeholder: 'https://facebook.com/kootenaytech',
    description: 'Facebook page URL (optional)'
  },
  {
    key: 'twitter_url',
    label: 'Twitter/X URL',
    type: 'url',
    placeholder: 'https://twitter.com/kootenaytech',
    description: 'Twitter/X profile URL (optional)'
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/company/kootenaytech',
    description: 'LinkedIn company page URL (optional)'
  },
  {
    key: 'github_url',
    label: 'GitHub URL',
    type: 'url',
    placeholder: 'https://github.com/kootenaytech',
    description: 'GitHub organization URL (optional)'
  }
];

const ImprovedContactSection: React.FC<ImprovedContactSectionProps> = ({
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
          data_type: setting?.data_type as SettingDataType || 'string' as SettingDataType
        });
      }
      
      await Promise.all(updates.map(update => onUpdateSetting(update)));
      
      setChangedFields(new Set());
      toast.success(`Saved ${updates.length} contact settings successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save contact settings');
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
        ) : field.type === 'textarea' ? (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            maxLength={field.validation?.maxLength}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
              hasChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
          />
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
        ) : (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.validation?.maxLength}
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

        {field.validation?.maxLength && field.type === 'textarea' && (
          <div className="text-xs text-gray-400 text-right">
            {String(value || '').length}/{field.validation.maxLength}
          </div>
        )}
      </div>
    );
  };

  // Check contact completeness
  const hasBasicInfo = formData['contact.contact_email'] && formData['location.organization_name'];
  const hasLocation = formData['location.city'] && formData['location.country'];
  const hasSocials = formData['contact.website_url'] || formData['contact.facebook_url'] || formData['contact.twitter_url'];

  const contactFeatures = features.filter(f => 
    f.feature_key.includes('contact') || 
    f.feature_key.includes('form') || 
    f.feature_key.includes('support') ||
    f.feature_key.includes('location')
  );

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Contact & Location</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage contact information, location details, and communication preferences
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

      {/* Contact Information Preview */}
      {previewMode && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Contact Information Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Card Preview */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {formData['location.organization_name'] || 'Your Organization Name'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Methods */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Methods
                  </h5>
                  <div className="space-y-2 text-sm">
                    {formData['contact.contact_email'] && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        <a href={`mailto:${formData['contact.contact_email']}`} className="text-blue-600 hover:underline">
                          {formData['contact.contact_email']}
                        </a>
                      </div>
                    )}
                    {formData['contact.primary_phone'] && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        <a href={`tel:${formData['contact.primary_phone']}`} className="text-blue-600 hover:underline">
                          {formData['contact.primary_phone']}
                        </a>
                      </div>
                    )}
                    {formData['contact.phone_hours'] && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-600">{formData['contact.phone_hours']}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    {formData['location.street_address'] && (
                      <div>{formData['location.street_address'].split('\n').map((line: string, i: number) => (
                        <div key={i}>{line}</div>
                      ))}</div>
                    )}
                    <div>
                      {[
                        formData['location.city'],
                        formData['location.province_state'],
                        formData['location.postal_code']
                      ].filter(Boolean).join(', ')}
                    </div>
                    {formData['location.country'] && (
                      <div>{formData['location.country']}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {hasSocials && (
                <div className="mt-6 pt-4 border-t">
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Online Presence
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    {formData['contact.website_url'] && (
                      <a 
                        href={formData['contact.website_url']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Website
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    {formData['contact.facebook_url'] && (
                      <a 
                        href={formData['contact.facebook_url']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        Facebook
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    {formData['contact.twitter_url'] && (
                      <a 
                        href={formData['contact.twitter_url']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        Twitter/X
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    {formData['contact.linkedin_url'] && (
                      <a 
                        href={formData['contact.linkedin_url']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        LinkedIn
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    {formData['contact.github_url'] && (
                      <a 
                        href={formData['contact.github_url']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        GitHub
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Completeness Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-2">
                  {hasBasicInfo ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Basic Information</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Organization name and contact email</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-2">
                  {hasLocation ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">Location Details</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">City and country information</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-2">
                  {hasSocials ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">Online Presence</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Website and social media links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Contact Information</span>
            {hasBasicInfo ? (
              <Badge variant="success">Complete</Badge>
            ) : (
              <Badge variant="destructive">Incomplete</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contactInfoFields.map(field => renderField('contact', field))}
          </div>
        </CardContent>
      </Card>

      {/* Phone & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-green-600" />
            <span>Phone & Support Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phoneFields.map(field => renderField('contact', field))}
          </div>
        </CardContent>
      </Card>

      {/* Location & Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <span>Location & Address</span>
            {hasLocation ? (
              <Badge variant="success">Complete</Badge>
            ) : (
              <Badge variant="secondary">Optional</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {locationFields.map(field => renderField('location', field))}
          </div>
        </CardContent>
      </Card>

      {/* Social Media & Web Presence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <span>Online Presence</span>
            {hasSocials ? (
              <Badge variant="success">{Object.values(formData).filter(v => v && String(v).startsWith('http')).length} links</Badge>
            ) : (
              <Badge variant="secondary">Optional</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {socialFields.map(field => renderField('contact', field))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Features */}
      {contactFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <span>Contact Features</span>
              <Badge variant="secondary">
                {contactFeatures.filter(f => f.enabled).length}/{contactFeatures.length} enabled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {contactFeatures.map((feature) => (
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
                      toast.success('Contact feature toggle functionality coming soon');
                    }}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <Info className="h-5 w-5" />
            <span>Contact Information Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-amber-700">
            <li><strong>Keep it current:</strong> Regularly update contact information to ensure users can reach you</li>
            <li><strong>Multiple channels:</strong> Provide various ways for users to contact you (email, phone, social)</li>
            <li><strong>Response times:</strong> Set clear expectations for response times and support hours</li>
            <li><strong>Professional presence:</strong> Use consistent branding across all contact channels</li>
            <li><strong>Privacy considerations:</strong> Only share information you're comfortable making public</li>
            <li><strong>Accessibility:</strong> Ensure contact methods are accessible to users with disabilities</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${hasBasicInfo ? 'text-green-600' : 'text-red-600'}`}>
                {hasBasicInfo ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Basic Info</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {phoneFields.filter(f => formData[`contact.${f.key}`]).length}
              </div>
              <div className="text-sm text-gray-600">Phone Details</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {locationFields.filter(f => formData[`location.${f.key}`]).length}
              </div>
              <div className="text-sm text-gray-600">Location Fields</div>
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

export default ImprovedContactSection;