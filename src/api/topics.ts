import { supabase } from '@/lib/supabase';
import type { Topic, TopicFormData, TopicAnalytics } from '@/types/topic';

export const topicsApi = {
  // Get all topics
  async getAll() {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as Topic[];
  },

  // Get topic by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Topic;
  },

  // Get topic by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Topic;
  },

  // Create topic
  async create(topic: TopicFormData) {
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .single();

    if (error) throw error;
    return data as Topic;
  },

  // Update topic
  async update(id: string, topic: Partial<TopicFormData>) {
    const { data, error } = await supabase
      .from('topics')
      .update(topic)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Topic;
  },

  // Delete topic
  async delete(id: string) {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Get topic analytics
  async getAnalytics() {
    const { data, error } = await supabase
      .from('topic_analytics')
      .select('*')
      .order('content_count', { ascending: false });

    if (error) throw error;
    return data as TopicAnalytics[];
  },

  // Entity-specific topic operations
  async getTopicsForEntity(entityType: string, entityId: string) {
    const tableName = `${entityType}_topics`;
    const { data, error } = await supabase
      .from(tableName)
      .select(`
        topic_id,
        topics (*)
      `)
      .eq(`${entityType}_id`, entityId);

    if (error) throw error;
    return data?.map(item => item.topics).filter(Boolean) as Topic[];
  },

  async addTopicsToEntity(entityType: string, entityId: string, topicIds: string[]) {
    const tableName = `${entityType}_topics`;
    const entityIdField = `${entityType}_id`;
    
    const records = topicIds.map(topicId => ({
      [entityIdField]: entityId,
      topic_id: topicId
    }));

    const { error } = await supabase
      .from(tableName)
      .insert(records);

    if (error) throw error;
    return true;
  },

  async removeTopicsFromEntity(entityType: string, entityId: string, topicIds: string[]) {
    const tableName = `${entityType}_topics`;
    const entityIdField = `${entityType}_id`;

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(entityIdField, entityId)
      .in('topic_id', topicIds);

    if (error) throw error;
    return true;
  },

  async setTopicsForEntity(entityType: string, entityId: string, topicIds: string[]) {
    const tableName = `${entityType}_topics`;
    const entityIdField = `${entityType}_id`;

    // First, delete all existing topics for this entity
    await supabase
      .from(tableName)
      .delete()
      .eq(entityIdField, entityId);

    // Then add the new topics
    if (topicIds.length > 0) {
      const records = topicIds.map(topicId => ({
        [entityIdField]: entityId,
        topic_id: topicId
      }));

      const { error } = await supabase
        .from(tableName)
        .insert(records);

      if (error) throw error;
    }

    return true;
  }
};

// Convenience functions for specific entities
export const newsTopicsApi = {
  getTopics: (newsId: string) => topicsApi.getTopicsForEntity('news', newsId),
  addTopics: (newsId: string, topicIds: string[]) => topicsApi.addTopicsToEntity('news', newsId, topicIds),
  removeTopics: (newsId: string, topicIds: string[]) => topicsApi.removeTopicsFromEntity('news', newsId, topicIds),
  setTopics: (newsId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('news', newsId, topicIds)
};

export const eventTopicsApi = {
  getTopics: (eventId: string) => topicsApi.getTopicsForEntity('event', eventId),
  addTopics: (eventId: string, topicIds: string[]) => topicsApi.addTopicsToEntity('event', eventId, topicIds),
  removeTopics: (eventId: string, topicIds: string[]) => topicsApi.removeTopicsFromEntity('event', eventId, topicIds),
  setTopics: (eventId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('event', eventId, topicIds)
};

export const resourceTopicsApi = {
  getTopics: (resourceId: string) => topicsApi.getTopicsForEntity('resource', resourceId),
  addTopics: (resourceId: string, topicIds: string[]) => topicsApi.addTopicsToEntity('resource', resourceId, topicIds),
  removeTopics: (resourceId: string, topicIds: string[]) => topicsApi.removeTopicsFromEntity('resource', resourceId, topicIds),
  setTopics: (resourceId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('resource', resourceId, topicIds)
};

export const groupTopicsApi = {
  getTopics: (groupId: string) => topicsApi.getTopicsForEntity('group', groupId),
  addTopics: (groupId: string, topicIds: string[]) => topicsApi.addTopicsToEntity('group', groupId, topicIds),
  removeTopics: (groupId: string, topicIds: string[]) => topicsApi.removeTopicsFromEntity('group', groupId, topicIds),
  setTopics: (groupId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('group', groupId, topicIds)
};

export const marketplaceTopicsApi = {
  getTopics: (listingId: string) => topicsApi.getTopicsForEntity('marketplace', listingId),
  addTopics: (listingId: string, topicIds: string[]) => topicsApi.addTopicsToEntity('marketplace', listingId, topicIds),
  removeTopics: (listingId: string, topicIds: string[]) => topicsApi.removeTopicsFromEntity('marketplace', listingId, topicIds),
  setTopics: (listingId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('marketplace', listingId, topicIds)
};

export const opportunityTopicsApi = {
  getTopics: (opportunityId: string) => topicsApi.getTopicsForEntity('opportunity', opportunityId),
  addTopics: (opportunityId: string, topicIds: string[]) => topicsApi.addTopicsToEntity('opportunity', opportunityId, topicIds),
  removeTopics: (opportunityId: string, topicIds: string[]) => topicsApi.removeTopicsFromEntity('opportunity', opportunityId, topicIds),
  setTopics: (opportunityId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('opportunity', opportunityId, topicIds)
};

export const companyTopicsApi = {
  getTopics: (companyId: string) => topicsApi.getTopicsForEntity('company', companyId),
  addTopics: (companyId: string, topicIds: string[]) => topicsApi.addTopicsToEntity('company', companyId, topicIds),
  removeTopics: (companyId: string, topicIds: string[]) => topicsApi.removeTopicsFromEntity('company', companyId, topicIds),
  setTopics: (companyId: string, topicIds: string[]) => topicsApi.setTopicsForEntity('company', companyId, topicIds)
};