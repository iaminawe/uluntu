// Settings System Types
export type SettingDataType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export type SettingCategory = 
  | 'site' 
  | 'header' 
  | 'navigation' 
  | 'community' 
  | 'location' 
  | 'contact' 
  | 'limits' 
  | 'appearance' 
  | 'integration' 
  | 'security';

export interface ApplicationSetting {
  id: string;
  category: string;
  setting_key: string;
  setting_value: any;
  data_type: string;
  is_public: boolean | null;
  is_system: boolean | null;
  validation_rules: any | null;
  description?: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface FeatureToggle {
  id: string;
  feature_key: string;
  enabled: boolean | null;
  config: any | null;
  rollout_percentage: number | null;
  enabled_for_users: string[] | null;
  enabled_for_roles: string[] | null;
  description?: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface SettingsHistory {
  id: string;
  setting_id?: string | null;
  category: string;
  setting_key: string;
  old_value?: any | null;
  new_value?: any | null;
  change_type: string | null;
  changed_by?: string | null;
  changed_at: string | null;
  ip_address?: any | null;
  user_agent?: string | null;
}

// Settings form interfaces
export interface SettingFormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color' | 'url' | 'email' | 'file';
  value: any;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
  description?: string;
  section?: string;
  order?: number;
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  fields: SettingFormField[];
  order?: number;
  collapsed?: boolean;
}

export interface SettingsCategory {
  id: SettingCategory;
  title: string;
  description?: string;
  icon?: string;
  sections: SettingsSection[];
  order?: number;
}

// Feature toggle types - must match feature_key values in database
export type FeatureKey =
  // Core Features
  | 'members_directory'
  | 'companies_listing'
  | 'events_system'
  | 'news_blog'
  | 'groups_communities'
  | 'resources_library'
  | 'marketplace'
  | 'opportunities_board'
  | 'photo_galleries'
  | 'pages_system'
  | 'topics_system'
  
  // Social Features
  | 'user_messaging'
  | 'social_feeds'
  | 'user_following'
  | 'content_likes'
  | 'content_comments'
  | 'content_sharing'
  
  // Advanced Features
  | 'advanced_search'
  | 'content_tagging'
  | 'notification_system'
  | 'calendar_integration'
  | 'payment_processing'
  | 'analytics_dashboard'
  
  // Admin Features
  | 'bulk_operations'
  | 'audit_logging'
  | 'content_moderation'
  | 'user_management'
  | 'newsletter_system'
  
  // Integration Features
  | 'api_access'
  | 'webhook_support'
  | 'sso_integration'
  | 'ldap_integration'
  
  // Mobile Features
  | 'mobile_app'
  | 'push_notifications'
  | 'offline_mode'
  
  // Experimental Features
  | 'ai_content_suggestions'
  | 'automated_moderation'
  
  // UI Features
  | 'dynamic_footer_menus'
  | 'newsletter_signup'
  | 'smart_matching'
  | 'voice_features'
  | 'video_features';

export interface FeatureConfig {
  [key: string]: any;
}

// Settings API response types
export interface SettingsResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface PublicSettings {
  [category: string]: {
    [key: string]: {
      value: any;
      type: SettingDataType;
    };
  };
}

// Settings update request types
export interface UpdateSettingRequest {
  category: SettingCategory;
  setting_key: string;
  setting_value: any;
  data_type: SettingDataType;
  is_public?: boolean;
  description?: string;
}

export interface UpdateFeatureToggleRequest {
  feature_key: string;
  enabled?: boolean;
  config?: Record<string, any>;
  rollout_percentage?: number;
  enabled_for_users?: string[];
  enabled_for_roles?: string[];
  description?: string;
}

// Settings form validation
export interface SettingValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean | string;
}

export interface SettingValidationResult {
  isValid: boolean;
  errors: string[];
}

// Settings import/export types
export interface SettingsExport {
  version: string;
  exported_at: string;
  settings: ApplicationSetting[];
  feature_toggles: FeatureToggle[];
  checksum: string;
}

export interface SettingsImport {
  version: string;
  exported_at: string;
  settings: ApplicationSetting[];
  feature_toggles: FeatureToggle[];
  checksum: string;
}

// Settings context types
export interface SettingsContextValue {
  settings: PublicSettings;
  features: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  isFeatureEnabled: (feature: FeatureKey | string) => boolean;
  getSetting: <T = any>(category: string, key: string, defaultValue?: T) => T;
}

// Admin settings management types
export interface AdminSettingsContextValue extends SettingsContextValue {
  allSettings: ApplicationSetting[];
  allFeatures: FeatureToggle[];
  settingsHistory: SettingsHistory[];
  updateSetting: (request: UpdateSettingRequest) => Promise<SettingsResponse>;
  updateFeatureToggle: (request: UpdateFeatureToggleRequest) => Promise<SettingsResponse>;
  deleteSetting: (id: string) => Promise<SettingsResponse>;
  deleteFeatureToggle: (id: string) => Promise<SettingsResponse>;
  exportSettings: () => Promise<SettingsExport>;
  importSettings: (importData: SettingsImport) => Promise<SettingsResponse>;
  getSettingsHistory: (category?: string, key?: string) => Promise<SettingsHistory[]>;
}

// Settings form component props
export interface SettingsFormProps {
  category: SettingCategory;
  settings: ApplicationSetting[];
  onUpdate: (request: UpdateSettingRequest) => Promise<void>;
  loading?: boolean;
  readonly?: boolean;
}

export interface FeatureToggleProps {
  features: FeatureToggle[];
  onUpdate: (request: UpdateFeatureToggleRequest) => Promise<void>;
  loading?: boolean;
  readonly?: boolean;
}

// Settings navigation types
export interface SettingsNavItem {
  id: string;
  title: string;
  icon?: string;
  component: React.ComponentType<any>;
  order?: number;
  visible?: boolean;
  permissions?: string[];
}

export interface SettingsLayout {
  sidebar: {
    collapsed: boolean;
    items: SettingsNavItem[];
  };
  content: {
    title: string;
    breadcrumbs: Array<{ label: string; href?: string }>;
    actions: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>;
  };
}

// Utility types
export type SettingsGroupedByCategory = Record<SettingCategory, ApplicationSetting[]>;
export type FeaturesGroupedByCategory = Record<string, FeatureToggle[]>;

// Hook return types
export interface UseSettingsReturn {
  settings: PublicSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseFeatureToggleReturn {
  isEnabled: boolean;
  config: Record<string, any>;
  loading: boolean;
  error: string | null;
}

export interface UseAdminSettingsReturn {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  history: SettingsHistory[];
  loading: boolean;
  error: string | null;
  updateSetting: (request: UpdateSettingRequest) => Promise<void>;
  updateFeature: (request: UpdateFeatureToggleRequest) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
  deleteFeature: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}