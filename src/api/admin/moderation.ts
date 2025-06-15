/* eslint-disable @typescript-eslint/no-unused-vars */
import { ModerationItem } from '@/types/admin';

export const adminModerationApi = {
  // Get moderation queue - temporarily return empty data until DB is set up
  async getModerationQueue(_filters?: {
    status?: 'pending' | 'approved' | 'rejected';
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    console.warn('Admin moderation queue temporarily disabled - returning empty data');
    return {
      data: [] as ModerationItem[],
      count: 0
    };
  },

  // Submit item for moderation - temporarily stub
  async submitForModeration(_item: Omit<ModerationItem, 'id' | 'created_at' | 'updated_at'>) {
    console.warn('Admin moderation submission temporarily disabled');
    return 'temp-id';
  },

  // Approve item - temporarily stub
  async approveItem(_itemId: string, _notes?: string) {
    console.warn('Admin moderation approval temporarily disabled');
    return true;
  },

  // Reject item - temporarily stub
  async rejectItem(_itemId: string, _notes: string) {
    console.warn('Admin moderation rejection temporarily disabled');
    return true;
  },

  // Apply approved moderation action - temporarily stub
  async applyModerationAction(_item: ModerationItem) {
    console.warn('Admin moderation action temporarily disabled');
    return true;
  },

  // Get moderation stats - temporarily stub
  async getModerationStats() {
    console.warn('Admin moderation stats temporarily disabled');
    return {
      totalPending: 0,
      byType: {}
    };
  }
};