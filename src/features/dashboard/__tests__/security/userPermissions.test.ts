/**
 * User Permissions and Security Tests
 * Tests for dashboard access control and data security
 */

import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { userPermissionsService } from '../../services/userPermissionsService';
import { dashboardSecurityService } from '../../services/dashboardSecurityService';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn()
    },
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockUsers = {
  member: {
    id: 'user-member',
    email: 'member@example.com',
    role: 'member',
    permissions: ['read_own_content', 'write_own_content', 'delete_own_content'],
    groups: ['general']
  },
  moderator: {
    id: 'user-moderator',
    email: 'moderator@example.com',
    role: 'moderator',
    permissions: [
      'read_own_content', 'write_own_content', 'delete_own_content',
      'moderate_content', 'read_user_analytics'
    ],
    groups: ['general', 'moderators']
  },
  admin: {
    id: 'user-admin',
    email: 'admin@example.com',
    role: 'admin',
    permissions: [
      'read_own_content', 'write_own_content', 'delete_own_content',
      'moderate_content', 'read_user_analytics', 'manage_users',
      'access_admin_panel', 'read_all_content'
    ],
    groups: ['general', 'moderators', 'admins']
  }
};

const mockContent = {
  ownContent: {
    id: 'content-1',
    title: 'User Own Post',
    user_id: 'user-member',
    status: 'published'
  },
  otherContent: {
    id: 'content-2',
    title: 'Another User Post',
    user_id: 'other-user',
    status: 'published'
  },
  privateContent: {
    id: 'content-3',
    title: 'Private Post',
    user_id: 'other-user',
    status: 'private'
  }
};

describe('User Permissions and Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Role-Based Access Control', () => {
    test('allows members to access their own dashboard', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUsers.member },
        error: null
      });

      const hasAccess = await userPermissionsService.canAccessDashboard(
        mockUsers.member.id
      );

      expect(hasAccess).toBe(true);
    });

    test('denies dashboard access to unauthenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      });

      const hasAccess = await userPermissionsService.canAccessDashboard(
        'anonymous'
      );

      expect(hasAccess).toBe(false);
    });

    test('checks specific permission for dashboard features', async () => {
      const canRead = await userPermissionsService.hasPermission(
        mockUsers.member,
        'read_own_content'
      );

      const canModerate = await userPermissionsService.hasPermission(
        mockUsers.member,
        'moderate_content'
      );

      expect(canRead).toBe(true);
      expect(canModerate).toBe(false);
    });

    test('validates admin access to admin features', async () => {
      const canAccessAdmin = await userPermissionsService.hasPermission(
        mockUsers.admin,
        'access_admin_panel'
      );

      const canManageUsers = await userPermissionsService.hasPermission(
        mockUsers.admin,
        'manage_users'
      );

      expect(canAccessAdmin).toBe(true);
      expect(canManageUsers).toBe(true);
    });

    test('restricts moderator permissions appropriately', async () => {
      const canModerate = await userPermissionsService.hasPermission(
        mockUsers.moderator,
        'moderate_content'
      );

      const canManageUsers = await userPermissionsService.hasPermission(
        mockUsers.moderator,
        'manage_users'
      );

      expect(canModerate).toBe(true);
      expect(canManageUsers).toBe(false);
    });
  });

  describe('Content Access Control', () => {
    test('allows users to read their own content', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [mockContent.ownContent],
          error: null
        })
      } as any));

      const content = await userPermissionsService.getUserContent(
        mockUsers.member.id,
        { ownOnly: true }
      );

      expect(content).toHaveLength(1);
      expect(content[0].user_id).toBe(mockUsers.member.id);
    });

    test('prevents users from accessing others private content', async () => {
      const canAccess = await userPermissionsService.canAccessContent(
        mockUsers.member,
        mockContent.privateContent
      );

      expect(canAccess).toBe(false);
    });

    test('allows moderators to access content for moderation', async () => {
      const canAccess = await userPermissionsService.canAccessContent(
        mockUsers.moderator,
        mockContent.otherContent
      );

      expect(canAccess).toBe(true);
    });

    test('allows admins to access all content', async () => {
      const canAccessPublic = await userPermissionsService.canAccessContent(
        mockUsers.admin,
        mockContent.otherContent
      );

      const canAccessPrivate = await userPermissionsService.canAccessContent(
        mockUsers.admin,
        mockContent.privateContent
      );

      expect(canAccessPublic).toBe(true);
      expect(canAccessPrivate).toBe(true);
    });

    test('filters content based on user permissions', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [mockContent.ownContent, mockContent.otherContent],
          error: null
        })
      } as any));

      const filteredContent = await userPermissionsService.getFilteredContent(
        mockUsers.member
      );

      // Should only include own content and public content
      expect(filteredContent).toHaveLength(2);
      expect(filteredContent).not.toContain(mockContent.privateContent);
    });
  });

  describe('Analytics Access Control', () => {
    test('allows users to view their own analytics', async () => {
      const canView = await userPermissionsService.canViewAnalytics(
        mockUsers.member,
        mockUsers.member.id
      );

      expect(canView).toBe(true);
    });

    test('prevents users from viewing others analytics', async () => {
      const canView = await userPermissionsService.canViewAnalytics(
        mockUsers.member,
        'other-user-id'
      );

      expect(canView).toBe(false);
    });

    test('allows moderators to view aggregated analytics', async () => {
      const canView = await userPermissionsService.canViewAggregatedAnalytics(
        mockUsers.moderator
      );

      expect(canView).toBe(true);
    });

    test('restricts analytics data based on user role', async () => {
      const memberAnalytics = await userPermissionsService.getAnalyticsData(
        mockUsers.member,
        mockUsers.member.id
      );

      const moderatorAnalytics = await userPermissionsService.getAnalyticsData(
        mockUsers.moderator,
        mockUsers.member.id
      );

      // Member should get full personal analytics
      expect(memberAnalytics).toHaveProperty('detailedMetrics');
      
      // Moderator should get limited analytics for other users
      expect(moderatorAnalytics).not.toHaveProperty('detailedMetrics');
      expect(moderatorAnalytics).toHaveProperty('summary');
    });
  });

  describe('Data Security and Validation', () => {
    test('sanitizes user input to prevent XSS', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello';
      const sanitized = dashboardSecurityService.sanitizeInput(maliciousInput);

      expect(sanitized).toBe('Hello');
      expect(sanitized).not.toContain('<script>');
    });

    test('validates SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const isValid = dashboardSecurityService.validateInput(sqlInjection, 'text');

      expect(isValid).toBe(false);
    });

    test('enforces rate limiting on dashboard API calls', async () => {
      const userId = mockUsers.member.id;
      
      // Simulate multiple rapid requests
      const requests = Array(20).fill(null).map(() => 
        userPermissionsService.checkRateLimit(userId, 'dashboard_api')
      );

      const results = await Promise.all(requests);
      
      // Should start blocking after rate limit is exceeded
      const allowedRequests = results.filter(r => r.allowed).length;
      expect(allowedRequests).toBeLessThan(20);
    });

    test('logs security events for monitoring', async () => {
      const logSpy = jest.spyOn(dashboardSecurityService, 'logSecurityEvent');

      await userPermissionsService.canAccessContent(
        mockUsers.member,
        mockContent.privateContent // Unauthorized access attempt
      );

      expect(logSpy).toHaveBeenCalledWith({
        type: 'unauthorized_access_attempt',
        userId: mockUsers.member.id,
        resource: mockContent.privateContent.id,
        timestamp: expect.any(String)
      });
    });

    test('validates JWT tokens for API requests', async () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validpayload.signature';
      const invalidToken = 'invalid.token.here';

      const validResult = await dashboardSecurityService.validateJWT(validToken);
      const invalidResult = await dashboardSecurityService.validateJWT(invalidToken);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
    });

    test('encrypts sensitive data before storage', () => {
      const sensitiveData = 'user-email@example.com';
      const encrypted = dashboardSecurityService.encryptSensitiveData(sensitiveData);
      const decrypted = dashboardSecurityService.decryptSensitiveData(encrypted);

      expect(encrypted).not.toBe(sensitiveData);
      expect(decrypted).toBe(sensitiveData);
    });
  });

  describe('Session Management', () => {
    test('validates active user sessions', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockUsers.member,
            access_token: 'valid-token',
            expires_at: Date.now() + 3600000 // 1 hour from now
          }
        },
        error: null
      });

      const isValid = await userPermissionsService.validateSession(
        mockUsers.member.id
      );

      expect(isValid).toBe(true);
    });

    test('handles expired sessions', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockUsers.member,
            access_token: 'expired-token',
            expires_at: Date.now() - 3600000 // 1 hour ago
          }
        },
        error: null
      });

      const isValid = await userPermissionsService.validateSession(
        mockUsers.member.id
      );

      expect(isValid).toBe(false);
    });

    test('implements session timeout warnings', async () => {
      const warningCallback = jest.fn();
      
      await userPermissionsService.monitorSessionTimeout(
        mockUsers.member.id,
        {
          warningTime: 5 * 60 * 1000, // 5 minutes
          onWarning: warningCallback
        }
      );

      // Simulate time passing
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      expect(warningCallback).toHaveBeenCalledWith({
        userId: mockUsers.member.id,
        timeRemaining: expect.any(Number)
      });
    });

    test('logs out users on session expiry', async () => {
      const logoutCallback = jest.fn();
      
      await userPermissionsService.monitorSessionTimeout(
        mockUsers.member.id,
        {
          sessionDuration: 30 * 60 * 1000, // 30 minutes
          onExpiry: logoutCallback
        }
      );

      // Simulate session expiry
      jest.advanceTimersByTime(30 * 60 * 1000);
      
      expect(logoutCallback).toHaveBeenCalledWith({
        userId: mockUsers.member.id,
        reason: 'session_expired'
      });
    });
  });

  describe('Group-Based Permissions', () => {
    test('inherits permissions from group membership', async () => {
      const groupPermissions = await userPermissionsService.getGroupPermissions(
        mockUsers.moderator.groups
      );

      expect(groupPermissions).toContain('moderate_content');
      expect(groupPermissions).toContain('read_user_analytics');
    });

    test('applies most restrictive permission when conflicts exist', async () => {
      const conflictingUser = {
        ...mockUsers.member,
        groups: ['general', 'restricted']
      };

      const finalPermissions = await userPermissionsService.resolvePermissions(
        conflictingUser
      );

      // Should apply most restrictive permissions
      expect(finalPermissions).not.toContain('write_own_content');
    });

    test('allows group-specific content access', async () => {
      const groupContent = {
        id: 'group-content-1',
        title: 'Moderator Only Post',
        visibility: 'group:moderators'
      };

      const memberAccess = await userPermissionsService.canAccessGroupContent(
        mockUsers.member,
        groupContent
      );

      const moderatorAccess = await userPermissionsService.canAccessGroupContent(
        mockUsers.moderator,
        groupContent
      );

      expect(memberAccess).toBe(false);
      expect(moderatorAccess).toBe(true);
    });
  });

  describe('Audit Logging', () => {
    test('logs all dashboard access attempts', async () => {
      const auditSpy = jest.spyOn(dashboardSecurityService, 'auditLog');

      await userPermissionsService.canAccessDashboard(mockUsers.member.id);

      expect(auditSpy).toHaveBeenCalledWith({
        action: 'dashboard_access',
        userId: mockUsers.member.id,
        timestamp: expect.any(String),
        ipAddress: expect.any(String),
        userAgent: expect.any(String)
      });
    });

    test('tracks permission changes', async () => {
      const auditSpy = jest.spyOn(dashboardSecurityService, 'auditLog');

      await userPermissionsService.updateUserPermissions(
        mockUsers.member.id,
        ['read_own_content', 'write_own_content', 'new_permission']
      );

      expect(auditSpy).toHaveBeenCalledWith({
        action: 'permission_change',
        userId: mockUsers.member.id,
        changes: {
          added: ['new_permission'],
          removed: []
        },
        timestamp: expect.any(String)
      });
    });

    test('records failed authentication attempts', async () => {
      const auditSpy = jest.spyOn(dashboardSecurityService, 'auditLog');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      });

      await userPermissionsService.canAccessDashboard('invalid-user');

      expect(auditSpy).toHaveBeenCalledWith({
        action: 'authentication_failed',
        userId: 'invalid-user',
        reason: 'Invalid credentials',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Content Moderation Security', () => {
    test('prevents unauthorized content modification', async () => {
      const canModify = await userPermissionsService.canModifyContent(
        mockUsers.member,
        mockContent.otherContent
      );

      expect(canModify).toBe(false);
    });

    test('allows content owners to modify their content', async () => {
      const canModify = await userPermissionsService.canModifyContent(
        mockUsers.member,
        mockContent.ownContent
      );

      expect(canModify).toBe(true);
    });

    test('allows moderators to modify content for moderation', async () => {
      const canModify = await userPermissionsService.canModifyContent(
        mockUsers.moderator,
        mockContent.otherContent
      );

      expect(canModify).toBe(true);
    });

    test('validates content before allowing updates', async () => {
      const maliciousContent = {
        title: '<script>alert("XSS")</script>',
        content: 'javascript:alert("XSS")'
      };

      const isValid = await dashboardSecurityService.validateContentUpdate(
        maliciousContent
      );

      expect(isValid.valid).toBe(false);
      expect(isValid.errors).toContain('Invalid script content detected');
    });
  });

  describe('API Security', () => {
    test('validates API request signatures', async () => {
      const requestData = { userId: mockUsers.member.id, action: 'read' };
      const signature = dashboardSecurityService.generateSignature(requestData);
      
      const isValid = dashboardSecurityService.validateSignature(
        requestData,
        signature
      );

      expect(isValid).toBe(true);
    });

    test('rejects tampered API requests', async () => {
      const requestData = { userId: mockUsers.member.id, action: 'read' };
      const signature = dashboardSecurityService.generateSignature(requestData);
      
      // Tamper with the data
      requestData.action = 'write';
      
      const isValid = dashboardSecurityService.validateSignature(
        requestData,
        signature
      );

      expect(isValid).toBe(false);
    });

    test('implements CORS security headers', async () => {
      const headers = dashboardSecurityService.getSecurityHeaders();

      expect(headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff');
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY');
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block');
    });

    test('validates content-type headers', async () => {
      const validContentType = 'application/json';
      const invalidContentType = 'text/html';

      const validResult = dashboardSecurityService.validateContentType(
        validContentType
      );
      const invalidResult = dashboardSecurityService.validateContentType(
        invalidContentType
      );

      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);
    });
  });
});