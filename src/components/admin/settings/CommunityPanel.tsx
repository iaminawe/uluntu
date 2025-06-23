import React, { useState, useEffect } from 'react';
import { 
  // Users, - unused
  Shield, 
  UserPlus, 
  // UserCheck, - unused 
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  Crown,
  Key,
  Lock,
  Unlock
} from 'lucide-react';
import type { ApplicationSetting, UpdateSettingRequest } from '@/types/settings';
import { useAdminSettings } from '@/hooks/useSettings';

interface CommunityPanelProps {
  settings: ApplicationSetting[];
  onRefresh: () => void;
}

interface CommunitySettings {
  registration_open: boolean;
  require_approval: boolean;
  default_member_role: string;
  max_members: number | null;
  auto_approve_domains: string[];
  email_verification_required: boolean;
  profile_completion_required: boolean;
  welcome_message: string;
  member_invitation_enabled: boolean;
  public_member_directory: boolean;
  allow_member_registration: boolean;
  moderation_enabled: boolean;
  content_approval_required: boolean;
}

const defaultRoles = [
  { value: 'member', label: 'Member', description: 'Basic member access' },
  { value: 'contributor', label: 'Contributor', description: 'Can create and share content' },
  { value: 'moderator', label: 'Moderator', description: 'Can moderate content and users' },
  { value: 'admin', label: 'Admin', description: 'Administrative privileges' }
];

export const CommunityPanel: React.FC<CommunityPanelProps> = ({ 
  settings, 
  onRefresh 
}) => {
  const { updateSetting } = useAdminSettings();
  const [communitySettings, setCommunitySettings] = useState<CommunitySettings>({
    registration_open: true,
    require_approval: false,
    default_member_role: 'member',
    max_members: null,
    auto_approve_domains: [],
    email_verification_required: true,
    profile_completion_required: false,
    welcome_message: '',
    member_invitation_enabled: true,
    public_member_directory: true,
    allow_member_registration: true,
    moderation_enabled: true,
    content_approval_required: false,
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'registration' | 'roles' | 'moderation' | 'limits'>('registration');

  // Initialize settings from props
  useEffect(() => {
    const communityData = settings.filter(s => s.category === 'community');
    const newSettings: any = { ...communitySettings };
    
    communityData.forEach(setting => {
      let value = setting.setting_value;
      
      // Parse JSON values
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      
      newSettings[setting.setting_key] = value;
    });
    
    setCommunitySettings(newSettings);
  }, [settings]);

  const handleSettingChange = (key: keyof CommunitySettings, value: any) => {
    setCommunitySettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: UpdateSettingRequest[] = Object.entries(communitySettings).map(([key, value]) => ({
        category: 'community',
        setting_key: key,
        setting_value: value,
        data_type: typeof value === 'boolean' ? 'boolean' : 
                  typeof value === 'number' ? 'number' : 
                  Array.isArray(value) ? 'array' : 'string',
        is_public: false // Community settings are typically not public
      }));
      
      await Promise.all(updates.map(update => updateSetting(update)));
      
      setHasChanges(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to save community settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const communityData = settings.filter(s => s.category === 'community');
    const resetSettings: any = {};
    
    communityData.forEach(setting => {
      resetSettings[setting.setting_key] = setting.setting_value;
    });
    
    setCommunitySettings({ ...communitySettings, ...resetSettings });
    setHasChanges(false);
  };

  const tabs = [
    { id: 'registration', label: 'Registration', icon: UserPlus },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'moderation', label: 'Moderation', icon: Settings },
    { id: 'limits', label: 'Limits & Quotas', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Community Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage member registration, roles, and community policies
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Registration Tab */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Member Registration</h4>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Registration Status */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {communitySettings.registration_open ? (
                      <Unlock className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <Lock className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h5 className="font-medium text-gray-900">Registration Status</h5>
                      <p className="text-sm text-gray-500 mt-1">
                        {communitySettings.registration_open 
                          ? 'New members can register for accounts'
                          : 'Registration is currently closed'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('registration_open', !communitySettings.registration_open)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      communitySettings.registration_open
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {communitySettings.registration_open ? 'Close Registration' : 'Open Registration'}
                  </button>
                </div>

                {/* Registration Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Require Admin Approval</label>
                      <p className="text-sm text-gray-500">New members must be approved by an administrator</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('require_approval', !communitySettings.require_approval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        communitySettings.require_approval ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          communitySettings.require_approval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Email Verification Required</label>
                      <p className="text-sm text-gray-500">Users must verify their email address</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('email_verification_required', !communitySettings.email_verification_required)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        communitySettings.email_verification_required ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          communitySettings.email_verification_required ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Profile Completion Required</label>
                      <p className="text-sm text-gray-500">Members must complete their profile before accessing features</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('profile_completion_required', !communitySettings.profile_completion_required)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        communitySettings.profile_completion_required ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          communitySettings.profile_completion_required ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Auto-approve Domains */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Auto-approve Email Domains
                  </label>
                  <textarea
                    value={(communitySettings.auto_approve_domains || []).join('\n')}
                    onChange={(e) => handleSettingChange('auto_approve_domains', e.target.value.split('\n').filter(d => d.trim()))}
                    placeholder="example.com&#10;company.org"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Users with email addresses from these domains will be automatically approved. Enter one domain per line.
                  </p>
                </div>

                {/* Welcome Message */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Welcome Message
                  </label>
                  <textarea
                    value={communitySettings.welcome_message || ''}
                    onChange={(e) => handleSettingChange('welcome_message', e.target.value)}
                    placeholder="Welcome to our community! We're excited to have you join us..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    This message will be shown to new members after they complete registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Roles & Permissions</h4>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Default Member Role
                </label>
                <select
                  value={communitySettings.default_member_role}
                  onChange={(e) => handleSettingChange('default_member_role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {defaultRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  The role automatically assigned to new members upon registration.
                </p>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Permission Settings</h5>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Member Invitations</label>
                    <p className="text-sm text-gray-500">Allow members to invite others to join</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('member_invitation_enabled', !communitySettings.member_invitation_enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      communitySettings.member_invitation_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        communitySettings.member_invitation_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Public Member Directory</label>
                    <p className="text-sm text-gray-500">Allow public access to member directory</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('public_member_directory', !communitySettings.public_member_directory)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      communitySettings.public_member_directory ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        communitySettings.public_member_directory ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Content Moderation</h4>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Content Moderation</label>
                  <p className="text-sm text-gray-500">Enable automated and manual content moderation</p>
                </div>
                <button
                  onClick={() => handleSettingChange('moderation_enabled', !communitySettings.moderation_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    communitySettings.moderation_enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      communitySettings.moderation_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Content Approval Required</label>
                  <p className="text-sm text-gray-500">All content must be approved before being published</p>
                </div>
                <button
                  onClick={() => handleSettingChange('content_approval_required', !communitySettings.content_approval_required)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    communitySettings.content_approval_required ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      communitySettings.content_approval_required ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Limits Tab */}
        {activeTab === 'limits' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-medium text-gray-900">Limits & Quotas</h4>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Members
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    value={communitySettings.max_members || ''}
                    onChange={(e) => handleSettingChange('max_members', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Unlimited"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSettingChange('max_members', null)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Unlimited
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Maximum number of members allowed to register. Leave empty for unlimited.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning for Sensitive Changes */}
      {(hasChanges && (
        !communitySettings.registration_open || 
        communitySettings.require_approval ||
        communitySettings.content_approval_required
      )) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Configuration Changes</p>
              <p>
                You have made changes that may significantly impact your community's functionality. 
                Please review carefully before saving.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Community Management Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Start with stricter settings and relax them as your community grows</li>
              <li>Consider enabling approval for new members to maintain quality</li>
              <li>Use auto-approve domains for trusted organizations</li>
              <li>Regular moderation helps maintain a healthy community environment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};