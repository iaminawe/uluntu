// Feature Flag Security Integration for Menu System
// Ensures menu items respect feature flags and user permissions

import { MenuItem } from '@/types/menu';
import { MenuPermissionContext } from '../security/MenuPermissions';
import { logger } from '@/utils/logger';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_roles?: string[];
  target_users?: string[];
  conditions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MenuFeatureFlagRule {
  menuItemId: string;
  featureFlagId: string;
  required: boolean; // If true, feature must be enabled to show menu item
  cascade: boolean; // Apply to child menu items
}

/**
 * Feature flag security manager for menu items
 */
export class MenuFeatureFlagSecurity {
  
  /**
   * Check if user has access to feature flag
   */
  static async checkFeatureFlagAccess(
    featureFlagId: string,
    context: MenuPermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // This would integrate with your feature flag system
      // For now, implementing basic checks
      
      // Check for admin bypass
      if (context.userRoles.includes('superadmin')) {
        return { allowed: true };
      }

      // Simulate feature flag lookup
      const featureFlag = await this.getFeatureFlag(featureFlagId);
      
      if (!featureFlag) {
        return { allowed: false, reason: 'Feature flag not found' };
      }

      if (!featureFlag.enabled) {
        return { allowed: false, reason: 'Feature is disabled' };
      }

      // Check role-based access
      if (featureFlag.target_roles && featureFlag.target_roles.length > 0) {
        const hasRequiredRole = featureFlag.target_roles.some(role => 
          context.userRoles.includes(role)
        );
        
        if (!hasRequiredRole) {
          return { 
            allowed: false, 
            reason: `Requires one of: ${featureFlag.target_roles.join(', ')}` 
          };
        }
      }

      // Check user-specific access
      if (featureFlag.target_users && featureFlag.target_users.length > 0) {
        if (!featureFlag.target_users.includes(context.userId)) {
          return { allowed: false, reason: 'Not in target user list' };
        }
      }

      // Check rollout percentage
      if (featureFlag.rollout_percentage < 100) {
        const userHash = this.hashUserId(context.userId);
        const userPercentile = userHash % 100;
        
        if (userPercentile >= featureFlag.rollout_percentage) {
          return { 
            allowed: false, 
            reason: `Feature rollout at ${featureFlag.rollout_percentage}%` 
          };
        }
      }

      // Check additional conditions
      if (featureFlag.conditions) {
        const conditionsMet = await this.evaluateFeatureConditions(
          featureFlag.conditions,
          context
        );
        
        if (!conditionsMet.allowed) {
          return { 
            allowed: false, 
            reason: `Conditions not met: ${conditionsMet.reason}` 
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking feature flag access', 'FEATURE_FLAG_SECURITY', error);
      return { allowed: false, reason: 'Feature flag check failed' };
    }
  }

  /**
   * Filter menu items based on feature flags
   */
  static async filterMenuItemsByFeatureFlags(
    items: MenuItem[],
    context: MenuPermissionContext
  ): Promise<MenuItem[]> {
    const filteredItems: MenuItem[] = [];

    for (const item of items) {
      const featureFlagChecks = await this.getMenuItemFeatureFlags(item.id);
      let includeItem = true;
      let excludeReason = '';

      // Check all required feature flags
      for (const flagRule of featureFlagChecks) {
        if (flagRule.required) {
          const flagAccess = await this.checkFeatureFlagAccess(
            flagRule.featureFlagId,
            context
          );
          
          if (!flagAccess.allowed) {
            includeItem = false;
            excludeReason = flagAccess.reason || 'Feature flag denied';
            break;
          }
        }
      }

      // Check CSS class feature flags (legacy support)
      if (includeItem && item.css_classes) {
        const cssFeatureFlagCheck = await this.checkCssFeatureFlags(
          item.css_classes,
          context
        );
        
        if (!cssFeatureFlagCheck.allowed) {
          includeItem = false;
          excludeReason = cssFeatureFlagCheck.reason || 'CSS feature flag denied';
        }
      }

      if (includeItem) {
        filteredItems.push(item);
      } else {
        logger.debug(`Menu item filtered by feature flag: ${item.title}`, 'FEATURE_FLAG_SECURITY', {
          itemId: item.id,
          reason: excludeReason
        });
      }
    }

    return filteredItems;
  }

  /**
   * Get feature flag rules for a menu item
   */
  private static async getMenuItemFeatureFlags(menuItemId: string): Promise<MenuFeatureFlagRule[]> {
    // This would query your database for menu feature flag rules
    // For now, returning empty array as placeholder
    return [];
  }

  /**
   * Get feature flag by ID
   */
  private static async getFeatureFlag(featureFlagId: string): Promise<FeatureFlag | null> {
    // This would integrate with your feature flag system (LaunchDarkly, Flipper, etc.)
    // For now, implementing basic hard-coded flags
    
    const defaultFlags: Record<string, FeatureFlag> = {
      'beta_menu_features': {
        id: 'beta_menu_features',
        name: 'Beta Menu Features',
        description: 'Access to beta menu management features',
        enabled: true,
        rollout_percentage: 50,
        target_roles: ['admin', 'superadmin', 'beta_tester'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'admin_menu_bulk_ops': {
        id: 'admin_menu_bulk_ops',
        name: 'Admin Menu Bulk Operations',
        description: 'Bulk operations for menu management',
        enabled: true,
        rollout_percentage: 100,
        target_roles: ['admin', 'superadmin'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'menu_audit_logs': {
        id: 'menu_audit_logs',
        name: 'Menu Audit Logs',
        description: 'View audit logs for menu changes',
        enabled: true,
        rollout_percentage: 100,
        target_roles: ['admin', 'superadmin', 'auditor'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    return defaultFlags[featureFlagId] || null;
  }

  /**
   * Check CSS-based feature flags (legacy support)
   */
  private static async checkCssFeatureFlags(
    cssClasses: string,
    context: MenuPermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    const flagPatterns = [
      { pattern: /feature-(\w+)/, prefix: 'feature_' },
      { pattern: /ff-(\w+)/, prefix: 'ff_' },
      { pattern: /flag-(\w+)/, prefix: 'flag_' }
    ];

    for (const { pattern, prefix } of flagPatterns) {
      const match = cssClasses.match(pattern);
      if (match) {
        const flagId = `${prefix}${match[1]}`;
        const flagAccess = await this.checkFeatureFlagAccess(flagId, context);
        
        if (!flagAccess.allowed) {
          return flagAccess;
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Evaluate additional feature flag conditions
   */
  private static async evaluateFeatureConditions(
    conditions: Record<string, any>,
    context: MenuPermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Time-based conditions
      if (conditions.start_date || conditions.end_date) {
        const now = new Date();
        
        if (conditions.start_date && new Date(conditions.start_date) > now) {
          return { allowed: false, reason: 'Feature not yet available' };
        }
        
        if (conditions.end_date && new Date(conditions.end_date) < now) {
          return { allowed: false, reason: 'Feature has expired' };
        }
      }

      // Geographic conditions
      if (conditions.allowed_countries || conditions.blocked_countries) {
        // This would integrate with geolocation service
        // For now, allowing all
      }

      // Custom conditions
      if (conditions.custom_rules) {
        for (const rule of conditions.custom_rules) {
          const ruleResult = await this.evaluateCustomRule(rule, context);
          if (!ruleResult.allowed) {
            return ruleResult;
          }
        }
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error evaluating feature conditions', 'FEATURE_FLAG_SECURITY', error);
      return { allowed: false, reason: 'Condition evaluation failed' };
    }
  }

  /**
   * Evaluate custom feature flag rule
   */
  private static async evaluateCustomRule(
    rule: Record<string, any>,
    context: MenuPermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Implement custom rule evaluation logic
    // This could include complex business logic
    return { allowed: true };
  }

  /**
   * Simple hash function for user ID to determine rollout percentage
   */
  private static hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Log feature flag decision for debugging
   */
  static async logFeatureFlagDecision(
    featureFlagId: string,
    decision: 'allowed' | 'denied',
    context: MenuPermissionContext,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    logger.info(`Feature flag decision: ${decision}`, 'FEATURE_FLAG_SECURITY', {
      featureFlagId,
      userId: context.userId,
      userRoles: context.userRoles,
      reason,
      ...metadata
    });
  }

  /**
   * Create feature flag rule for menu item
   */
  static async createMenuFeatureFlagRule(
    rule: Omit<MenuFeatureFlagRule, 'id'>
  ): Promise<MenuFeatureFlagRule> {
    // This would save to database
    // For now, returning the rule with generated ID
    return {
      ...rule,
    } as MenuFeatureFlagRule;
  }

  /**
   * Get all feature flags that affect menu items
   */
  static async getMenuFeatureFlags(): Promise<FeatureFlag[]> {
    const flags = [
      await this.getFeatureFlag('beta_menu_features'),
      await this.getFeatureFlag('admin_menu_bulk_ops'),
      await this.getFeatureFlag('menu_audit_logs'),
    ];

    return flags.filter((flag): flag is FeatureFlag => flag !== null);
  }
}

// Export for external use
export default MenuFeatureFlagSecurity;