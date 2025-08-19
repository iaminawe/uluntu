import { supabase } from '@/lib/supabase';

export interface AdminActivity {
  id?: string;
  admin_id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

class AdminActivityLogger {
  private static instance: AdminActivityLogger;
  private pendingLogs: AdminActivity[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AdminActivityLogger {
    if (!AdminActivityLogger.instance) {
      AdminActivityLogger.instance = new AdminActivityLogger();
    }
    return AdminActivityLogger.instance;
  }

  async log(activity: Omit<AdminActivity, 'created_at'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user for admin activity logging');
        return;
      }

      const logEntry: AdminActivity = {
        ...activity,
        admin_id: user.id,
        admin_email: user.email || '',
        created_at: new Date().toISOString()
      };

      this.pendingLogs.push(logEntry);
      this.scheduleFlush();
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, 1000);
  }

  private async flush(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToFlush = [...this.pendingLogs];
    this.pendingLogs = [];

    try {
      const { error } = await supabase
        .from('admin_activity_logs')
        .insert(logsToFlush);

      if (error) {
        console.error('Failed to flush admin activity logs:', error);
        this.pendingLogs.unshift(...logsToFlush);
      }
    } catch (error) {
      console.error('Failed to flush admin activity logs:', error);
      this.pendingLogs.unshift(...logsToFlush);
    }
  }

  async logUserAction(
    action: 'create' | 'update' | 'delete' | 'block' | 'unblock' | 'archive' | 'restore',
    userId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: `user_${action}`,
      entity_type: 'user',
      entity_id: userId,
      details
    });
  }

  async logBulkAction(
    action: string,
    entityType: string,
    entityIds: string[],
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: `bulk_${action}`,
      entity_type: entityType,
      details: {
        ...details,
        affected_count: entityIds.length,
        entity_ids: entityIds
      }
    });
  }

  async logImport(
    entityType: string,
    count: number,
    source: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'import',
      entity_type: entityType,
      details: {
        ...details,
        imported_count: count,
        source
      }
    });
  }

  async logExport(
    entityType: string,
    count: number,
    format: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'export',
      entity_type: entityType,
      details: {
        ...details,
        exported_count: count,
        format
      }
    });
  }

  async logRoleAssignment(
    userId: string,
    roleId: string,
    action: 'assign' | 'remove'
  ): Promise<void> {
    await this.log({
      action: `role_${action}`,
      entity_type: 'user_role',
      entity_id: userId,
      details: {
        role_id: roleId
      }
    });
  }

  async getActivityLogs(
    filters?: {
      admin_id?: string;
      entity_type?: string;
      action?: string;
      start_date?: string;
      end_date?: string;
    },
    limit = 100,
    offset = 0
  ): Promise<AdminActivity[]> {
    try {
      let query = supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (filters?.admin_id) {
        query = query.eq('admin_id', filters.admin_id);
      }
      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch admin activity logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch admin activity logs:', error);
      return [];
    }
  }

  async getActivityStats(
    timeframe: '24h' | '7d' | '30d' = '7d'
  ): Promise<{
    total_actions: number;
    actions_by_type: Record<string, number>;
    most_active_admins: Array<{ admin_email: string; action_count: number }>;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const logs = await this.getActivityLogs({
      start_date: startDate.toISOString()
    }, 1000, 0);

    const actionsByType: Record<string, number> = {};
    const adminActions: Record<string, number> = {};

    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      adminActions[log.admin_email] = (adminActions[log.admin_email] || 0) + 1;
    });

    const mostActiveAdmins = Object.entries(adminActions)
      .map(([email, count]) => ({ admin_email: email, action_count: count }))
      .sort((a, b) => b.action_count - a.action_count)
      .slice(0, 5);

    return {
      total_actions: logs.length,
      actions_by_type: actionsByType,
      most_active_admins: mostActiveAdmins
    };
  }
}

export const adminActivityLogger = AdminActivityLogger.getInstance();