import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type { AdminAuditLog } from '@/types/adminGallery';

/**
 * Gallery-specific audit logging service
 * Extends the general admin activity logger with gallery-specific functionality
 */
export class GalleryAuditLogger {
  
  /**
   * Log photo-related admin actions
   */
  async logPhotoAction(params: {
    adminId: string;
    action: 'CREATE_PHOTO' | 'UPDATE_PHOTO' | 'DELETE_PHOTO' | 'BULK_DELETE_PHOTOS' | 'MODERATE_PHOTO' | 'FEATURE_PHOTO';
    photoId?: string;
    photoIds?: string[];
    galleryId?: string;
    details?: {
      photo_name?: string;
      gallery_title?: string;
      user_name?: string;
      old_values?: Record<string, any>;
      new_values?: Record<string, any>;
      moderation_status?: string;
      reason?: string;
      file_size?: number;
      mime_type?: string;
      batch_size?: number;
      operation_id?: string;
    };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const auditData = {
        admin_id: params.adminId,
        action: params.action,
        entity_type: 'photo' as const,
        entity_id: params.photoId || (params.photoIds ? params.photoIds[0] : null),
        entity_name: params.details?.photo_name,
        details: {
          ...params.details,
          photo_id: params.photoId,
          photo_ids: params.photoIds,
          gallery_id: params.galleryId,
          timestamp: new Date().toISOString()
        },
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_activity_logs')
        .insert([auditData]);

      if (error) {
        logger.error('Failed to log photo audit action', 'GALLERY_AUDIT', error);
      }

    } catch (error) {
      logger.error('Gallery photo audit logging failed', 'GALLERY_AUDIT', error);
    }
  }

  /**
   * Log gallery-related admin actions
   */
  async logGalleryAction(params: {
    adminId: string;
    action: 'CREATE_GALLERY' | 'UPDATE_GALLERY' | 'DELETE_GALLERY' | 'BULK_DELETE_GALLERIES' | 'FEATURE_GALLERY' | 'CHANGE_PRIVACY';
    galleryId?: string;
    galleryIds?: string[];
    details?: {
      gallery_title?: string;
      user_name?: string;
      user_email?: string;
      old_values?: Record<string, any>;
      new_values?: Record<string, any>;
      photos_count?: number;
      reason?: string;
      privacy_change?: {
        from: string;
        to: string;
      };
      batch_size?: number;
      operation_id?: string;
    };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const auditData = {
        admin_id: params.adminId,
        action: params.action,
        entity_type: 'gallery' as const,
        entity_id: params.galleryId || (params.galleryIds ? params.galleryIds[0] : null),
        entity_name: params.details?.gallery_title,
        details: {
          ...params.details,
          gallery_id: params.galleryId,
          gallery_ids: params.galleryIds,
          timestamp: new Date().toISOString()
        },
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_activity_logs')
        .insert([auditData]);

      if (error) {
        logger.error('Failed to log gallery audit action', 'GALLERY_AUDIT', error);
      }

    } catch (error) {
      logger.error('Gallery audit logging failed', 'GALLERY_AUDIT', error);
    }
  }

  /**
   * Log moderation-related actions
   */
  async logModerationAction(params: {
    adminId: string;
    action: 'APPROVE_PHOTO' | 'REJECT_PHOTO' | 'FLAG_PHOTO' | 'BULK_MODERATE' | 'UNFLAG_PHOTO' | 'REVIEW_CONTENT';
    photoId?: string;
    photoIds?: string[];
    details?: {
      photo_name?: string;
      gallery_title?: string;
      user_name?: string;
      moderation_status?: {
        from: string;
        to: string;
      };
      review_notes?: string;
      auto_moderated?: boolean;
      flagged_reason?: string;
      batch_size?: number;
      operation_id?: string;
    };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const auditData = {
        admin_id: params.adminId,
        action: params.action,
        entity_type: 'photo' as const,
        entity_id: params.photoId || (params.photoIds ? params.photoIds[0] : null),
        entity_name: params.details?.photo_name,
        details: {
          ...params.details,
          photo_id: params.photoId,
          photo_ids: params.photoIds,
          moderation_action: true,
          timestamp: new Date().toISOString()
        },
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_activity_logs')
        .insert([auditData]);

      if (error) {
        logger.error('Failed to log moderation audit action', 'GALLERY_AUDIT', error);
      }

    } catch (error) {
      logger.error('Moderation audit logging failed', 'GALLERY_AUDIT', error);
    }
  }

  /**
   * Log bulk operations with progress tracking
   */
  async logBulkOperation(params: {
    adminId: string;
    action: string;
    entityType: 'photo' | 'gallery';
    operationId: string;
    totalItems: number;
    successfulItems: string[];
    failedItems: Array<{ id: string; error: string }>;
    details?: {
      operation_type: string;
      reason?: string;
      target_gallery?: string;
      moderation_status?: string;
      duration_ms?: number;
      batch_size?: number;
    };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const auditData = {
        admin_id: params.adminId,
        action: `BULK_${params.action}`,
        entity_type: params.entityType,
        entity_id: params.operationId,
        entity_name: `Bulk operation: ${params.action}`,
        details: {
          ...params.details,
          operation_id: params.operationId,
          total_requested: params.totalItems,
          successful_count: params.successfulItems.length,
          failed_count: params.failedItems.length,
          success_rate: params.totalItems > 0 ? (params.successfulItems.length / params.totalItems * 100).toFixed(2) : 0,
          successful_items: params.successfulItems,
          failed_items: params.failedItems,
          timestamp: new Date().toISOString()
        },
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_activity_logs')
        .insert([auditData]);

      if (error) {
        logger.error('Failed to log bulk operation audit', 'GALLERY_AUDIT', error);
      }

    } catch (error) {
      logger.error('Bulk operation audit logging failed', 'GALLERY_AUDIT', error);
    }
  }

  /**
   * Log system-level gallery actions
   */
  async logSystemAction(params: {
    adminId: string;
    action: 'CLEANUP_ORPHANED_FILES' | 'REGENERATE_THUMBNAILS' | 'UPDATE_STORAGE_QUOTA' | 'MIGRATE_GALLERIES' | 'BACKUP_GALLERIES';
    details?: {
      affected_galleries?: number;
      affected_photos?: number;
      storage_reclaimed?: number;
      operation_duration?: number;
      migration_type?: string;
      backup_location?: string;
      cleanup_type?: string;
      errors_encountered?: number;
    };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const auditData = {
        admin_id: params.adminId,
        action: params.action,
        entity_type: 'system' as const,
        entity_id: null,
        entity_name: `System operation: ${params.action}`,
        details: {
          ...params.details,
          system_operation: true,
          timestamp: new Date().toISOString()
        },
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_activity_logs')
        .insert([auditData]);

      if (error) {
        logger.error('Failed to log system audit action', 'GALLERY_AUDIT', error);
      }

    } catch (error) {
      logger.error('System audit logging failed', 'GALLERY_AUDIT', error);
    }
  }

  /**
   * Log access control changes
   */
  async logAccessControlAction(params: {
    adminId: string;
    action: 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'CHANGE_PERMISSIONS' | 'UPDATE_PRIVACY';
    galleryId: string;
    targetUserId?: string;
    details?: {
      gallery_title?: string;
      target_user_name?: string;
      target_user_email?: string;
      permission_level?: string;
      privacy_change?: {
        from: string;
        to: string;
      };
      reason?: string;
      expires_at?: string;
    };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const auditData = {
        admin_id: params.adminId,
        action: params.action,
        entity_type: 'gallery' as const,
        entity_id: params.galleryId,
        entity_name: params.details?.gallery_title,
        details: {
          ...params.details,
          gallery_id: params.galleryId,
          target_user_id: params.targetUserId,
          access_control_change: true,
          timestamp: new Date().toISOString()
        },
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_activity_logs')
        .insert([auditData]);

      if (error) {
        logger.error('Failed to log access control audit action', 'GALLERY_AUDIT', error);
      }

    } catch (error) {
      logger.error('Access control audit logging failed', 'GALLERY_AUDIT', error);
    }
  }

  /**
   * Get audit trail for specific entity
   */
  async getEntityAuditTrail(params: {
    entityType: 'photo' | 'gallery';
    entityId: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logs: AdminAuditLog[];
    total: number;
  }> {
    try {
      let query = supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin:members!admin_activity_logs_admin_id_fkey(name, email)
        `, { count: 'exact' })
        .eq('entity_type', params.entityType)
        .order('created_at', { ascending: false });

      // Entity-specific filtering
      if (params.entityType === 'photo') {
        query = query.or(`entity_id.eq.${params.entityId},details->>photo_id.eq.${params.entityId},details->photo_ids.cs.["${params.entityId}"]`);
      } else {
        query = query.or(`entity_id.eq.${params.entityId},details->>gallery_id.eq.${params.entityId},details->gallery_ids.cs.["${params.entityId}"]`);
      }

      if (params.startDate) {
        query = query.gte('created_at', params.startDate);
      }

      if (params.endDate) {
        query = query.lte('created_at', params.endDate);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, (params.offset + (params.limit || 50)) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to get audit trail', 'GALLERY_AUDIT', error);
        throw error;
      }

      const logs: AdminAuditLog[] = (data || []).map(log => ({
        id: log.id,
        admin_id: log.admin_id,
        admin_name: log.admin?.name || 'Unknown',
        admin_email: log.admin?.email || 'Unknown',
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        entity_name: log.entity_name,
        details: log.details || {},
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at
      }));

      return {
        logs,
        total: count || 0
      };

    } catch (error) {
      logger.error('Failed to retrieve audit trail', 'GALLERY_AUDIT', error);
      throw error;
    }
  }

  /**
   * Get admin activity summary
   */
  async getAdminActivitySummary(params: {
    adminId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total_actions: number;
    actions_by_type: Array<{ action: string; count: number }>;
    entities_affected: Array<{ entity_type: string; count: number }>;
    recent_activity: AdminAuditLog[];
  }> {
    try {
      let baseQuery = supabase
        .from('admin_activity_logs')
        .select('*');

      if (params.adminId) {
        baseQuery = baseQuery.eq('admin_id', params.adminId);
      }

      if (params.startDate) {
        baseQuery = baseQuery.gte('created_at', params.startDate);
      }

      if (params.endDate) {
        baseQuery = baseQuery.lte('created_at', params.endDate);
      }

      // Get summary data using RPC function
      const { data: summary, error: summaryError } = await supabase
        .rpc('get_admin_activity_summary', {
          p_admin_id: params.adminId,
          p_start_date: params.startDate,
          p_end_date: params.endDate
        });

      if (summaryError) {
        logger.error('Failed to get activity summary', 'GALLERY_AUDIT', summaryError);
        throw summaryError;
      }

      // Get recent activity
      const { data: recentActivity } = await baseQuery
        .select(`
          *,
          admin:members!admin_activity_logs_admin_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const recentLogs: AdminAuditLog[] = (recentActivity || []).map(log => ({
        id: log.id,
        admin_id: log.admin_id,
        admin_name: log.admin?.name || 'Unknown',
        admin_email: log.admin?.email || 'Unknown',
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        entity_name: log.entity_name,
        details: log.details || {},
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at
      }));

      return {
        total_actions: summary?.total_actions || 0,
        actions_by_type: summary?.actions_by_type || [],
        entities_affected: summary?.entities_affected || [],
        recent_activity: recentLogs
      };

    } catch (error) {
      logger.error('Failed to get admin activity summary', 'GALLERY_AUDIT', error);
      throw error;
    }
  }
}

// Export singleton instance
export const galleryAuditLogger = new GalleryAuditLogger();