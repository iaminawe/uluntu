/**
 * Security and Authorization for Dashboard APIs
 * Implements role-based access control and content ownership verification
 */

import { supabase, handleSupabaseError } from '@/shared/api';
import { withAuth } from '@/shared/api/middleware';
import { DashboardPermissions, ContentPermissions } from '../types';

// Role definitions
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export interface UserContext {
  user_id: string;
  member_id: string;
  role: UserRole;
  permissions: string[];
  is_verified: boolean;
}

export interface ContentOwnership {
  content_id: string;
  content_type: string;
  owner_id: string;
  created_at: string;
  is_owner: boolean;
}

class DashboardSecurity {
  /**
   * Get current user context with role and permissions
   */
  async getUserContext(): Promise<UserContext> {
    return withAuth(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get member profile with role information
        const { data: member, error } = await supabase
          .from('members')
          .select(`
            id, role, status, verified,
            member_roles(
              role:roles(name, permissions)
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (error || !member) {
          throw new Error('Member profile not found');
        }

        // Extract role and permissions
        const role = member.role || 'user';
        const permissions = this.getRolePermissions(role);
        
        // Add additional permissions from member_roles if available
        if (member.member_roles && Array.isArray(member.member_roles)) {
          member.member_roles.forEach((memberRole: any) => {
            if (memberRole.role?.permissions) {
              permissions.push(...memberRole.role.permissions);
            }
          });
        }

        return {
          user_id: user.id,
          member_id: member.id,
          role: role as UserRole,
          permissions: [...new Set(permissions)], // Remove duplicates
          is_verified: member.verified || false
        };
      } catch (error) {
        console.error('Error getting user context:', error);
        throw error;
      }
    });
  }

  /**
   * Check if user has required permissions
   */
  async hasPermissions(requiredPermissions: string[]): Promise<boolean> {
    try {
      const userContext = await this.getUserContext();
      
      return requiredPermissions.every(permission => 
        userContext.permissions.includes(permission) ||
        userContext.permissions.includes('*') || // Super admin wildcard
        this.hasImplicitPermission(userContext.role, permission)
      );
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Verify content ownership
   */
  async verifyContentOwnership(contentId: string, contentType: string): Promise<ContentOwnership> {
    return withAuth(async () => {
      try {
        const userContext = await this.getUserContext();
        
        // Map content types to their respective tables and owner fields
        const contentConfig = this.getContentConfig(contentType);
        if (!contentConfig) {
          throw new Error(`Unsupported content type: ${contentType}`);
        }

        const { data, error } = await supabase
          .from(contentConfig.table)
          .select(`id, ${contentConfig.ownerField}, created_at`)
          .eq('id', contentId)
          .single();

        if (error || !data) {
          throw new Error(`Content not found: ${contentId}`);
        }

        const isOwner = data[contentConfig.ownerField] === userContext.member_id;

        return {
          content_id: contentId,
          content_type: contentType,
          owner_id: data[contentConfig.ownerField],
          created_at: data.created_at,
          is_owner: isOwner
        };
      } catch (error) {
        console.error('Error verifying content ownership:', error);
        throw error;
      }
    });
  }

  /**
   * Get content permissions for user
   */
  async getContentPermissions(contentId: string, contentType: string): Promise<ContentPermissions> {
    try {
      const [userContext, ownership] = await Promise.all([
        this.getUserContext(),
        this.verifyContentOwnership(contentId, contentType)
      ]);

      const isOwner = ownership.is_owner;
      const isAdmin = userContext.role === 'admin' || userContext.role === 'super_admin';
      const isModerator = userContext.role === 'moderator' || isAdmin;

      return {
        can_edit: isOwner || isAdmin || userContext.permissions.includes('content:edit:all'),
        can_delete: isOwner || isAdmin || userContext.permissions.includes('content:delete:all'),
        can_publish: isOwner || isModerator || userContext.permissions.includes('content:publish'),
        can_feature: isAdmin || userContext.permissions.includes('content:feature'),
        can_view_analytics: isOwner || isAdmin || userContext.permissions.includes('analytics:view:all')
      };
    } catch (error) {
      console.error('Error getting content permissions:', error);
      return {
        can_edit: false,
        can_delete: false,
        can_publish: false,
        can_feature: false,
        can_view_analytics: false
      };
    }
  }

  /**
   * Get dashboard permissions for user
   */
  async getDashboardPermissions(): Promise<DashboardPermissions> {
    try {
      const userContext = await this.getUserContext();
      
      const isAdmin = userContext.role === 'admin' || userContext.role === 'super_admin';
      const isModerator = userContext.role === 'moderator' || isAdmin;

      return {
        can_view_analytics: userContext.permissions.includes('analytics:view') || isAdmin,
        can_bulk_edit: userContext.permissions.includes('content:bulk_edit') || isModerator,
        can_export_data: userContext.permissions.includes('data:export') || isAdmin,
        can_view_recommendations: userContext.is_verified || isModerator
      };
    } catch (error) {
      console.error('Error getting dashboard permissions:', error);
      return {
        can_view_analytics: false,
        can_bulk_edit: false,
        can_export_data: false,
        can_view_recommendations: false
      };
    }
  }

  /**
   * Rate limiting for API calls
   */
  async checkRateLimit(operation: string, limit: number = 100, windowMs: number = 3600000): Promise<boolean> {
    try {
      const userContext = await this.getUserContext();
      const key = `rate_limit:${userContext.member_id}:${operation}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get recent operations from a rate limiting store (Redis, or database)
      // For now, we'll use a simple in-memory approach with database storage
      const { data: rateLimitData } = await supabase
        .from('rate_limits')
        .select('count, last_reset')
        .eq('user_id', userContext.member_id)
        .eq('operation', operation)
        .single();

      let currentCount = 0;
      let shouldReset = true;

      if (rateLimitData) {
        const lastReset = new Date(rateLimitData.last_reset).getTime();
        if (now - lastReset < windowMs) {
          shouldReset = false;
          currentCount = rateLimitData.count;
        }
      }

      // Check if limit exceeded
      if (currentCount >= limit && !shouldReset) {
        return false;
      }

      // Update rate limit counter
      const newCount = shouldReset ? 1 : currentCount + 1;
      const resetTime = shouldReset ? new Date().toISOString() : rateLimitData?.last_reset;

      await supabase
        .from('rate_limits')
        .upsert({
          user_id: userContext.member_id,
          operation,
          count: newCount,
          last_reset: resetTime
        });

      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Allow operation on error (fail open)
      return true;
    }
  }

  /**
   * Log security events
   */
  async logSecurityEvent(event: {
    type: 'permission_denied' | 'unauthorized_access' | 'rate_limit_exceeded' | 'suspicious_activity';
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const userContext = await this.getUserContext();
      
      await supabase
        .from('security_logs')
        .insert({
          user_id: userContext.member_id,
          event_type: event.type,
          description: event.description,
          metadata: event.metadata,
          ip_address: null, // Would need to get from request context
          user_agent: null, // Would need to get from request context
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Sanitize input data to prevent injection attacks
   */
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Basic XSS prevention
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Validate content quota limits
   */
  async checkContentQuota(contentType: string): Promise<boolean> {
    try {
      const userContext = await this.getUserContext();
      const quotaConfig = this.getQuotaConfig(userContext.role, contentType);
      
      if (quotaConfig.unlimited) {
        return true;
      }

      const contentConfig = this.getContentConfig(contentType);
      if (!contentConfig) {
        return false;
      }

      // Count user's existing content
      const { count, error } = await supabase
        .from(contentConfig.table)
        .select('id', { count: 'exact', head: true })
        .eq(contentConfig.ownerField, userContext.member_id);

      if (error) {
        console.error('Error checking content quota:', error);
        return false;
      }

      return (count || 0) < quotaConfig.limit;
    } catch (error) {
      console.error('Error checking content quota:', error);
      return false;
    }
  }

  // Private helper methods

  private getRolePermissions(role: UserRole): string[] {
    const rolePermissions: Record<UserRole, string[]> = {
      user: [
        'content:create:own',
        'content:edit:own',
        'content:delete:own',
        'content:view:own',
        'profile:edit:own',
        'messages:send',
        'messages:receive'
      ],
      moderator: [
        'content:create:own',
        'content:edit:own',
        'content:delete:own',
        'content:view:own',
        'content:edit:all',
        'content:publish',
        'content:moderate',
        'profile:edit:own',
        'messages:send',
        'messages:receive',
        'analytics:view'
      ],
      admin: [
        '*', // Admin has all permissions
        'content:create:all',
        'content:edit:all',
        'content:delete:all',
        'content:view:all',
        'content:publish',
        'content:feature',
        'content:moderate',
        'content:bulk_edit',
        'profile:edit:all',
        'messages:send',
        'messages:receive',
        'analytics:view:all',
        'data:export',
        'users:manage'
      ],
      super_admin: [
        '*' // Super admin has unlimited permissions
      ]
    };

    return rolePermissions[role] || rolePermissions.user;
  }

  private hasImplicitPermission(role: UserRole, permission: string): boolean {
    // Some permissions are implicitly granted based on role
    const implicitPermissions: Record<UserRole, string[]> = {
      user: [],
      moderator: ['content:view:published'],
      admin: ['content:view:all', 'analytics:view'],
      super_admin: ['*']
    };

    return implicitPermissions[role]?.includes(permission) || false;
  }

  private getContentConfig(contentType: string): { table: string; ownerField: string } | null {
    const configs: Record<string, { table: string; ownerField: string }> = {
      photo: { table: 'photos', ownerField: 'uploaded_by' },
      event: { table: 'events', ownerField: 'organizer_id' },
      marketplace_listing: { table: 'marketplace_listings', ownerField: 'seller_id' },
      opportunity: { table: 'opportunities', ownerField: 'employer_id' },
      group_post: { table: 'group_posts', ownerField: 'author_id' },
      news_article: { table: 'news', ownerField: 'author_id' }
    };

    return configs[contentType] || null;
  }

  private getQuotaConfig(role: UserRole, contentType: string): { limit: number; unlimited: boolean } {
    const quotaConfigs: Record<UserRole, Record<string, { limit: number; unlimited: boolean }>> = {
      user: {
        photo: { limit: 100, unlimited: false },
        event: { limit: 10, unlimited: false },
        marketplace_listing: { limit: 20, unlimited: false },
        opportunity: { limit: 5, unlimited: false },
        group_post: { limit: 50, unlimited: false },
        news_article: { limit: 5, unlimited: false }
      },
      moderator: {
        photo: { limit: 500, unlimited: false },
        event: { limit: 50, unlimited: false },
        marketplace_listing: { limit: 100, unlimited: false },
        opportunity: { limit: 25, unlimited: false },
        group_post: { limit: 200, unlimited: false },
        news_article: { limit: 50, unlimited: false }
      },
      admin: {
        photo: { limit: 0, unlimited: true },
        event: { limit: 0, unlimited: true },
        marketplace_listing: { limit: 0, unlimited: true },
        opportunity: { limit: 0, unlimited: true },
        group_post: { limit: 0, unlimited: true },
        news_article: { limit: 0, unlimited: true }
      },
      super_admin: {
        photo: { limit: 0, unlimited: true },
        event: { limit: 0, unlimited: true },
        marketplace_listing: { limit: 0, unlimited: true },
        opportunity: { limit: 0, unlimited: true },
        group_post: { limit: 0, unlimited: true },
        news_article: { limit: 0, unlimited: true }
      }
    };

    return quotaConfigs[role]?.[contentType] || { limit: 10, unlimited: false };
  }
}

/**
 * Middleware functions for common security checks
 */

export const requirePermissions = (permissions: string[]) => {
  return async <T extends (...args: any[]) => any>(fn: T): Promise<ReturnType<T>> => {
    const security = new DashboardSecurity();
    const hasPermissions = await security.hasPermissions(permissions);
    
    if (!hasPermissions) {
      await security.logSecurityEvent({
        type: 'permission_denied',
        description: `Access denied for permissions: ${permissions.join(', ')}`
      });
      throw new Error('Insufficient permissions');
    }
    
    return fn();
  };
};

export const requireContentOwnership = (contentId: string, contentType: string) => {
  return async <T extends (...args: any[]) => any>(fn: T): Promise<ReturnType<T>> => {
    const security = new DashboardSecurity();
    const ownership = await security.verifyContentOwnership(contentId, contentType);
    
    if (!ownership.is_owner) {
      const userContext = await security.getUserContext();
      const isAdmin = userContext.role === 'admin' || userContext.role === 'super_admin';
      
      if (!isAdmin) {
        await security.logSecurityEvent({
          type: 'unauthorized_access',
          description: `Unauthorized access attempt to content: ${contentId}`,
          metadata: { content_type: contentType, owner_id: ownership.owner_id }
        });
        throw new Error('Content access denied');
      }
    }
    
    return fn();
  };
};

export const withRateLimit = (operation: string, limit: number = 100, windowMs: number = 3600000) => {
  return async <T extends (...args: any[]) => any>(fn: T): Promise<ReturnType<T>> => {
    const security = new DashboardSecurity();
    const allowed = await security.checkRateLimit(operation, limit, windowMs);
    
    if (!allowed) {
      await security.logSecurityEvent({
        type: 'rate_limit_exceeded',
        description: `Rate limit exceeded for operation: ${operation}`,
        metadata: { limit, windowMs }
      });
      throw new Error('Rate limit exceeded');
    }
    
    return fn();
  };
};

export const withQuotaCheck = (contentType: string) => {
  return async <T extends (...args: any[]) => any>(fn: T): Promise<ReturnType<T>> => {
    const security = new DashboardSecurity();
    const allowed = await security.checkContentQuota(contentType);
    
    if (!allowed) {
      await security.logSecurityEvent({
        type: 'permission_denied',
        description: `Content quota exceeded for type: ${contentType}`
      });
      throw new Error('Content quota exceeded');
    }
    
    return fn();
  };
};

export const dashboardSecurity = new DashboardSecurity();