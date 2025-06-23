import { useMemo } from 'react';
import { usePermissions } from './usePermissions';

/**
 * Hook for conditionally showing/hiding UI elements based on user permissions and roles
 */
export const useConditionalUI = () => {
  const {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    isAuthenticated,
    isGroupMember,
    isLoading
  } = usePermissions();

  // Create memoized UI visibility checkers
  const ui = useMemo(() => ({
    // Admin UI elements
    showAdminPanel: isAdmin(),
    showUserManagement: hasPermission({ resource: 'users', action: 'read' }),
    showRoleManagement: hasPermission({ resource: 'users', action: 'update' }),
    showSystemSettings: isSuperAdmin(),
    showModerationTools: hasPermission({ resource: 'moderation', action: 'read' }),
    showAuditLogs: hasAnyRole(['admin', 'superadmin']),

    // Content management
    canCreateContent: (contentType: string) => 
      hasPermission({ resource: contentType, action: 'create' }),
    canEditContent: (contentType: string) => 
      hasPermission({ resource: contentType, action: 'update' }),
    canDeleteContent: (contentType: string) => 
      hasPermission({ resource: contentType, action: 'delete' }),
    canManageContent: (contentType: string) => 
      hasPermission({ resource: contentType, action: '*' }),

    // Member-specific UI
    showMemberDirectory: isAuthenticated(),
    showGroupFeatures: isGroupMember(),
    showCreateGroup: hasPermission({ resource: 'groups', action: 'create' }),
    showJoinGroup: isAuthenticated(),

    // Event management
    showCreateEvent: hasPermission({ resource: 'events', action: 'create' }),
    showEventManagement: hasPermission({ resource: 'events', action: 'update' }),
    canRSVPEvents: isAuthenticated(),

    // News and resources
    showCreateNews: hasPermission({ resource: 'news', action: 'create' }),
    showCreateResource: hasPermission({ resource: 'resources', action: 'create' }),
    showNewsManagement: hasPermission({ resource: 'news', action: 'update' }),
    showResourceManagement: hasPermission({ resource: 'resources', action: 'update' }),

    // Marketplace
    showCreateListing: hasPermission({ resource: 'marketplace', action: 'create' }),
    showMarketplaceManagement: hasPermission({ resource: 'marketplace', action: 'update' }),
    canContactSellers: isAuthenticated(),

    // Opportunities
    showCreateOpportunity: hasPermission({ resource: 'opportunities', action: 'create' }),
    showOpportunityManagement: hasPermission({ resource: 'opportunities', action: 'update' }),
    canApplyToOpportunities: isAuthenticated(),

    // Company features
    showCreateCompany: hasPermission({ resource: 'companies', action: 'create' }),
    showCompanyManagement: hasPermission({ resource: 'companies', action: 'update' }),
    canClaimCompany: isGroupMember(),

    // Navigation elements
    showAdminNavigation: isAdmin(),
    showMemberNavigation: isAuthenticated(),
    showGuestNavigation: !isAuthenticated(),

    // Profile features
    canEditProfile: isAuthenticated(),
    canViewPrivateProfiles: isAdmin() || isGroupMember(),
    canManageUserProfiles: hasPermission({ resource: 'members', action: 'update' }),

    // Special features
    showBetaFeatures: hasAnyRole(['admin', 'superadmin', 'beta_tester']),
    showDeveloperTools: isSuperAdmin(),
    showAnalytics: hasAnyRole(['admin', 'superadmin']),

    // Bulk operations
    showBulkActions: isAdmin(),
    canBulkEdit: hasAnyPermission([
      { resource: 'members', action: 'update' },
      { resource: 'companies', action: 'update' },
      { resource: 'groups', action: 'update' }
    ]),

    // Import/Export
    canExportData: hasPermission({ resource: 'data', action: 'read' }),
    canImportData: hasPermission({ resource: 'data', action: 'create' }),

    // API access
    showAPIKeys: isSuperAdmin(),
    canAccessAPI: hasAnyRole(['admin', 'superadmin', 'api_user']),

    // Loading state
    isLoading
  }), [
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    isAuthenticated,
    isGroupMember,
    isLoading
  ]);

  // Helper functions for dynamic checks
  const canAccess = {
    adminArea: () => isAdmin(),
    moderationArea: () => hasPermission({ resource: 'moderation', action: 'read' }),
    userManagement: () => hasPermission({ resource: 'users', action: 'read' }),
    contentType: (type: string, action: string) => hasPermission({ resource: type, action }),
    
    // Multi-permission checks
    contentManagement: () => hasAnyPermission([
      { resource: 'news', action: 'update' },
      { resource: 'events', action: 'update' },
      { resource: 'resources', action: 'update' },
      { resource: 'marketplace', action: 'update' },
      { resource: 'opportunities', action: 'update' }
    ]),

    // Role-based access
    memberFeatures: () => isAuthenticated(),
    premiumFeatures: () => hasAnyRole(['premium', 'admin', 'superadmin']),
    groupFeatures: () => isGroupMember(),
    adminFeatures: () => isAdmin(),
    superAdminFeatures: () => isSuperAdmin()
  };

  // UI configuration helpers
  const getVisibleNavItems = () => {
    const items = [];
    
    if (ui.showMemberNavigation) {
      items.push('members', 'groups', 'events');
    }
    
    if (ui.showCreateContent('news')) {
      items.push('create-news');
    }
    
    if (ui.showCreateContent('resources')) {
      items.push('create-resources');
    }
    
    if (ui.showCreateContent('marketplace')) {
      items.push('create-listing');
    }
    
    if (ui.showAdminNavigation) {
      items.push('admin');
    }
    
    return items;
  };

  const getAvailableActions = (contentType: string) => {
    const actions = [];
    
    if (ui.canCreateContent(contentType)) {
      actions.push('create');
    }
    
    if (ui.canEditContent(contentType)) {
      actions.push('edit');
    }
    
    if (ui.canDeleteContent(contentType)) {
      actions.push('delete');
    }
    
    if (ui.canManageContent(contentType)) {
      actions.push('manage');
    }
    
    return actions;
  };

  return {
    ui,
    canAccess,
    getVisibleNavItems,
    getAvailableActions,
    isLoading
  };
};

/**
 * Hook for checking if user can perform specific actions on content
 */
export const useContentPermissions = (contentType: string) => {
  const { canAccess } = useConditionalUI();
  
  return {
    canCreate: canAccess.contentType(contentType, 'create'),
    canRead: canAccess.contentType(contentType, 'read'),
    canUpdate: canAccess.contentType(contentType, 'update'),
    canDelete: canAccess.contentType(contentType, 'delete'),
    canManage: canAccess.contentType(contentType, '*')
  };
};

/**
 * Hook for menu and navigation configuration
 */
export const useNavigationPermissions = () => {
  const { ui, canAccess } = useConditionalUI();
  
  const navigationConfig = useMemo(() => ({
    mainMenu: {
      home: true, // Always visible
      members: ui.showMemberDirectory,
      companies: ui.showMemberDirectory,
      groups: ui.showMemberDirectory,
      events: ui.showMemberDirectory,
      news: ui.showMemberDirectory,
      resources: ui.showMemberDirectory,
      marketplace: ui.showMemberDirectory,
      opportunities: ui.showMemberDirectory
    },
    
    adminMenu: {
      dashboard: ui.showAdminPanel,
      users: ui.showUserManagement,
      roles: ui.showRoleManagement,
      moderation: ui.showModerationTools,
      settings: ui.showSystemSettings,
      audit: ui.showAuditLogs,
      analytics: ui.showAnalytics
    },
    
    createMenu: {
      group: ui.showCreateGroup,
      event: ui.showCreateEvent,
      news: ui.showCreateNews,
      resource: ui.showCreateResource,
      listing: ui.showCreateListing,
      opportunity: ui.showCreateOpportunity,
      company: ui.showCreateCompany
    },
    
    userMenu: {
      profile: ui.canEditProfile,
      settings: ui.canEditProfile,
      admin: ui.showAdminPanel,
      developer: ui.showDeveloperTools
    }
  }), [ui, canAccess]);
  
  return navigationConfig;
};