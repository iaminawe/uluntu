/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuditLogEntry } from '@/types/admin';

export const adminAuditApi = {
  // Get audit logs with filters - temporarily return empty data until DB is set up
  async getAuditLogs(_filters?: {
    adminId?: string;
    entityType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    // TODO: Re-enable when admin_audit_log table is properly configured
    console.warn('Admin audit log temporarily disabled - returning empty data');
    
    return {
      data: [] as AuditLogEntry[],
      count: 0
    };
  },

  // Log an admin action - temporarily stub
  async logAction(
    _action: string,
    _entityType?: string,
    _entityId?: string,
    _changes?: Record<string, unknown>
  ) {
    // TODO: Re-enable when admin_audit_log table is properly configured
    console.warn('Admin audit logging temporarily disabled');
    return true;
  },

  // Get audit summary for a specific entity - temporarily stub
  async getEntityAuditHistory(_entityType: string, _entityId: string) {
    // TODO: Re-enable when admin_audit_log table is properly configured
    console.warn('Admin entity audit history temporarily disabled');
    return [] as AuditLogEntry[];
  },

  // Export audit logs - temporarily stub
  async exportAuditLogs(_filters?: {
    adminId?: string;
    entityType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    // TODO: Re-enable when admin_audit_log table is properly configured
    console.warn('Admin audit export temporarily disabled');
    return 'Date,Admin,Action,Entity Type,Entity ID,Changes\n';
  }
};