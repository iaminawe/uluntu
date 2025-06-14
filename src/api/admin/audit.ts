import { supabase } from '@/lib/supabase';
import { AuditLogEntry } from '@/types/admin';

export const adminAuditApi = {
  // Get audit logs with filters
  async getAuditLogs(filters?: {
    adminId?: string;
    entityType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('admin_audit_log')
      .select('*, admin:auth.users!admin_id(email)', { count: 'exact' });

    if (filters?.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    query = query
      .order('created_at', { ascending: false })
      .range(
        filters?.offset || 0,
        (filters?.offset || 0) + (filters?.limit || 50) - 1
      );

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data as AuditLogEntry[], count };
  },

  // Log an admin action (called automatically by triggers, but can be called manually)
  async logAction(
    action: string,
    entityType?: string,
    entityId?: string,
    changes?: Record<string, any>
  ) {
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        changes,
        ip_address: null, // Would need to be passed from frontend
        user_agent: navigator.userAgent
      });

    if (error) throw error;
  },

  // Get audit summary for a specific entity
  async getEntityAuditHistory(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*, admin:auth.users!admin_id(email)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AuditLogEntry[];
  },

  // Export audit logs
  async exportAuditLogs(filters?: Parameters<typeof this.getAuditLogs>[0]) {
    const allLogs: AuditLogEntry[] = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const { data, count } = await this.getAuditLogs({
        ...filters,
        limit,
        offset
      });

      allLogs.push(...(data || []));

      if (!data || data.length < limit || allLogs.length >= (count || 0)) {
        break;
      }

      offset += limit;
    }

    // Convert to CSV
    const headers = ['Date', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'Changes'];
    const rows = allLogs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.admin?.email || log.admin_id,
      log.action,
      log.entity_type || '',
      log.entity_id || '',
      JSON.stringify(log.changes || {})
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }
};