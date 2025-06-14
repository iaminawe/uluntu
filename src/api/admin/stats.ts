import { supabase } from '@/lib/supabase';
import { AdminStats } from '@/types/admin';

export const adminStatsApi = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<AdminStats> {
    const [
      totalUsers,
      totalMembers,
      totalCompanies,
      totalGroups,
      totalEvents,
      totalNews,
      totalResources,
      totalMarketplaceListings,
      totalOpportunities,
      pendingModeration,
      recentActivity
    ] = await Promise.all([
      // Count users - using a fallback approach since admin API might not be available
      supabase.from('user_roles').select('user_id', { count: 'exact', head: true }).then(res => res.count || 0),
      
      // Count entities
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }),
      supabase.from('opportunities').select('*', { count: 'exact', head: true }),
      
      // Pending moderation count
      supabase.from('moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Recent activity
      supabase.from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return {
      totalUsers: totalUsers as number,
      totalMembers: totalMembers.count || 0,
      totalCompanies: totalCompanies.count || 0,
      totalGroups: totalGroups.count || 0,
      totalEvents: totalEvents.count || 0,
      totalNews: totalNews.count || 0,
      totalResources: totalResources.count || 0,
      totalMarketplaceListings: totalMarketplaceListings.count || 0,
      totalOpportunities: totalOpportunities.count || 0,
      pendingModeration: pendingModeration.count || 0,
      recentActivity: recentActivity.data || []
    };
  },

  // Get entity counts by date range
  async getEntityGrowth(entityType: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from(entityType)
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    if (error) throw error;

    // Group by date
    const growth = data?.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return growth;
  },

  // Get user activity stats
  async getUserActivityStats(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('admin_id, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Count actions per user
    const userActivity = data?.reduce((acc, item) => {
      acc[item.admin_id] = (acc[item.admin_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActions: data?.length || 0,
      activeUsers: Object.keys(userActivity || {}).length,
      topUsers: Object.entries(userActivity || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({ userId, count }))
    };
  }
};