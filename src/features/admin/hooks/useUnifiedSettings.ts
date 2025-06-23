import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAdminSettings } from '@/hooks/useSettings';
import { usePermissions } from '@/hooks/usePermissions';
import type { SettingCategory } from '@/types/settings';

// Redux UI slice actions (we'll create this next)
import {
  setActiveSection,
  setSearchTerm,
  setSidebarCollapsed,
  setMobileMenuOpen,
  clearFilters,
  selectAdminSettingsUI
} from '../store/adminSettingsUISlice';

export type UnifiedSettingsSection = 
  | 'general'
  | 'users' 
  | 'features'
  | 'security'
  | 'email'
  | 'performance'
  | 'contact'
  | 'audit';

export interface UnifiedSettingsPermissions {
  canViewGeneral: boolean;
  canViewUsers: boolean;
  canViewFeatures: boolean;
  canViewSecurity: boolean;
  canViewEmail: boolean;
  canViewPerformance: boolean;
  canViewContact: boolean;
  canViewAudit: boolean;
}

/**
 * Hybrid hook for unified settings management
 * Combines React Query (server state) + Redux (UI state)
 */
export function useUnifiedSettings() {
  const dispatch = useAppDispatch();
  const { isAdmin, isSuperAdmin, hasAnyRole } = usePermissions();
  const uiState = useAppSelector(selectAdminSettingsUI);
  
  // React Query for server state
  const {
    settings,
    features,
    history,
    loading,
    error,
    updateSetting,
    updateFeature,
    deleteSetting,
    deleteFeature,
    refetch
  } = useAdminSettings();

  // Check permissions using the modern permission system
  const permissions: UnifiedSettingsPermissions = {
    canViewGeneral: isAdmin(),
    canViewUsers: isAdmin(),
    canViewFeatures: isSuperAdmin(),
    canViewSecurity: isSuperAdmin(),
    canViewEmail: isAdmin(),
    canViewPerformance: isSuperAdmin(),
    canViewContact: isAdmin(),
    canViewAudit: isSuperAdmin()
  };

  // Filter settings by category for current section
  const getCurrentSectionSettings = () => {
    const categoryMap: Record<UnifiedSettingsSection, SettingCategory[]> = {
      general: ['site', 'header', 'navigation', 'appearance'],
      users: ['community', 'limits'],
      features: [], // Feature toggles only
      security: ['security'],
      email: ['integration'], // Email-related integrations
      performance: [], // Performance metrics only
      contact: ['contact', 'location'],
      audit: [] // History only
    };

    const categories = categoryMap[uiState.activeSection] || [];
    return settings.filter(setting => categories.includes(setting.category));
  };

  // Filter features for current section
  const getCurrentSectionFeatures = () => {
    if (uiState.activeSection !== 'features') return [];
    return features;
  };

  // Redux UI actions
  const actions = {
    setActiveSection: (section: UnifiedSettingsSection) => {
      dispatch(setActiveSection(section));
    },
    setSearchTerm: (term: string) => {
      dispatch(setSearchTerm(term));
    },
    setSidebarCollapsed: (collapsed: boolean) => {
      dispatch(setSidebarCollapsed(collapsed));
    },
    setMobileMenuOpen: (open: boolean) => {
      dispatch(setMobileMenuOpen(open));
    },
    clearFilters: () => {
      dispatch(clearFilters());
    }
  };

  return {
    // Server state from React Query
    settings: getCurrentSectionSettings(),
    features: getCurrentSectionFeatures(),
    allSettings: settings,
    allFeatures: features,
    history,
    isLoading: loading,
    error,
    
    // UI state from Redux
    activeSection: uiState.activeSection,
    searchTerm: uiState.searchTerm,
    sidebarCollapsed: uiState.sidebarCollapsed,
    mobileMenuOpen: uiState.mobileMenuOpen,
    
    // Permissions
    permissions,
    
    // Actions
    ...actions,
    updateSetting,
    updateFeature,
    deleteSetting,
    deleteFeature,
    refetch
  };
}
