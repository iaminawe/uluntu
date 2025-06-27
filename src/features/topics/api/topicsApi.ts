import { supabase, handleSupabaseError } from '@/shared/api';
import { 
  adaptTopicFromDatabase, 
  adaptTopicToDatabase, 
  adaptTopicWithAnalyticsFromDatabase,
  generateTopicSlug
} from '../utils/topicAdapter';
import type { 
  Topic, 
  TopicWithAnalytics, 
  TopicFormData, 
  TopicEntityType,
  TopicRow,
  TopicAnalyticsRow 
} from '../types';

// NOTE: Topics tables need to be added to the Supabase database and types regenerated
// Migration file exists at: /supabase/migrations/20250627000001_create_topics_system.sql
// Run: supabase db push && supabase gen types typescript --local > src/shared/types/supabase.ts

export const topicsApi = {
  async getAll(): Promise<Topic[]> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'fetching topics');
        return [];
      }

      return (data || []).map(adaptTopicFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching topics');
      return [];
    }
  },

  async getById(id: string): Promise<Topic | null> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error, 'fetching topic by id');
        return null;
      }

      return data ? adaptTopicFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'fetching topic by id');
      return null;
    }
  },

  async getBySlug(slug: string): Promise<Topic | null> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        handleSupabaseError(error, 'fetching topic by slug');
        return null;
      }

      return data ? adaptTopicFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'fetching topic by slug');
      return null;
    }
  },

  async getWithAnalytics(): Promise<TopicWithAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('topic_analytics')
        .select('*')
        .order('total_content_count', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'fetching topic analytics');
        return [];
      }

      return (data || []).map(adaptTopicWithAnalyticsFromDatabase);
    } catch (error) {
      handleSupabaseError(error, 'fetching topic analytics');
      return [];
    }
  },

  async create(topicData: TopicFormData): Promise<Topic | null> {
    try {
      const dbData = {
        name: topicData.name,
        slug: generateTopicSlug(topicData.name),
        description: topicData.description || null,
        icon: topicData.icon || null,
        color: topicData.color || null,
        sort_order: topicData.sortOrder || 0,
        is_active: topicData.isActive ?? true
      };

      const { data, error } = await supabase
        .from('topics')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'creating topic');
        return null;
      }

      return data ? adaptTopicFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'creating topic');
      return null;
    }
  },

  async update(id: string, topicData: Partial<TopicFormData>): Promise<Topic | null> {
    try {
      const dbData = adaptTopicToDatabase(topicData);

      const { data, error } = await supabase
        .from('topics')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updating topic');
        return null;
      }

      return data ? adaptTopicFromDatabase(data) : null;
    } catch (error) {
      handleSupabaseError(error, 'updating topic');
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting topic');
        return false;
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'deleting topic');
      return false;
    }
  },

  // Entity-specific topic functions
  async getTopicsForEntity(entityType: TopicEntityType, entityId: string): Promise<Topic[]> {
    try {
      const tableName = `${entityType}_topics`;
      const idColumn = `${entityType}_id`;

      const { data, error } = await (supabase as any)
        .from(tableName)
        .select(`
          topic_id,
          topics!inner (*)
        `)
        .eq(idColumn, entityId);

      if (error) {
        handleSupabaseError(error, `fetching ${entityType} topics`);
        return [];
      }

      return (data || []).map((item: any) => adaptTopicFromDatabase(item.topics));
    } catch (error) {
      handleSupabaseError(error, `fetching ${entityType} topics`);
      return [];
    }
  },

  async setTopicsForEntity(entityType: TopicEntityType, entityId: string, topicIds: string[]): Promise<boolean> {
    try {
      const tableName = `${entityType}_topics`;
      const idColumn = `${entityType}_id`;

      // First, delete existing topics
      const { error: deleteError } = await (supabase as any)
        .from(tableName)
        .delete()
        .eq(idColumn, entityId);

      if (deleteError) {
        handleSupabaseError(deleteError, `removing ${entityType} topics`);
        return false;
      }

      // Then insert new topics
      if (topicIds.length > 0) {
        const topicData = topicIds.map(topicId => ({
          [idColumn]: entityId,
          topic_id: topicId
        }));

        const { error: insertError } = await (supabase as any)
          .from(tableName)
          .insert(topicData);

        if (insertError) {
          handleSupabaseError(insertError, `adding ${entityType} topics`);
          return false;
        }
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, `setting ${entityType} topics`);
      return false;
    }
  },

  async getTopicContentCounts(slug: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .rpc('get_topic_content_counts', { topic_slug_param: slug });

      if (error) {
        handleSupabaseError(error, 'fetching topic content counts');
        return {};
      }

      const counts: Record<string, number> = {};
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          counts[item.entity_type] = item.count;
        });
      }

      return counts;
    } catch (error) {
      handleSupabaseError(error, 'fetching topic content counts');
      return {};
    }
  }
};

// Entity-specific API exports for convenience
export const newsTopicsApi = {
  getTopics: (newsId: string) => topicsApi.getTopicsForEntity('news', newsId),
  setTopics: (newsId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('news', newsId, topicIds)
};

export const eventTopicsApi = {
  getTopics: (eventId: string) => topicsApi.getTopicsForEntity('event', eventId),
  setTopics: (eventId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('event', eventId, topicIds)
};

export const resourceTopicsApi = {
  getTopics: (resourceId: string) => topicsApi.getTopicsForEntity('resource', resourceId),
  setTopics: (resourceId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('resource', resourceId, topicIds)
};

export const groupTopicsApi = {
  getTopics: (groupId: string) => topicsApi.getTopicsForEntity('group', groupId),
  setTopics: (groupId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('group', groupId, topicIds)
};

export const marketplaceTopicsApi = {
  getTopics: (marketplaceId: string) => topicsApi.getTopicsForEntity('marketplace', marketplaceId),
  setTopics: (marketplaceId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('marketplace', marketplaceId, topicIds)
};

export const opportunityTopicsApi = {
  getTopics: (opportunityId: string) => topicsApi.getTopicsForEntity('opportunity', opportunityId),
  setTopics: (opportunityId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('opportunity', opportunityId, topicIds)
};

export const companyTopicsApi = {
  getTopics: (companyId: string) => topicsApi.getTopicsForEntity('company', companyId),
  setTopics: (companyId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('company', companyId, topicIds)
};

export const memberTopicsApi = {
  getTopics: (memberId: string) => topicsApi.getTopicsForEntity('member', memberId),
  setTopics: (memberId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('member', memberId, topicIds)
};