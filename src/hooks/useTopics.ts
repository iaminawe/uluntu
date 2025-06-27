import { useState, useEffect, useCallback } from 'react';
import { topicsApi } from '@/api/topics';
import type { Topic, TopicFormData, TopicAnalytics } from '@/types/topic';

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await topicsApi.getAll();
      setTopics(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const createTopic = async (topic: TopicFormData) => {
    try {
      const newTopic = await topicsApi.create(topic);
      setTopics(prev => [...prev, newTopic].sort((a, b) => a.sort_order - b.sort_order));
      return newTopic;
    } catch (err) {
      throw err;
    }
  };

  const updateTopic = async (id: string, topic: Partial<TopicFormData>) => {
    try {
      const updatedTopic = await topicsApi.update(id, topic);
      setTopics(prev => 
        prev.map(t => t.id === id ? updatedTopic : t)
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      return updatedTopic;
    } catch (err) {
      throw err;
    }
  };

  const deleteTopic = async (id: string) => {
    try {
      await topicsApi.delete(id);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    topics,
    loading,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
    refetch: fetchTopics
  };
}

export function useTopic(id: string | null) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setTopic(null);
      setLoading(false);
      return;
    }

    const fetchTopic = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await topicsApi.getById(id);
        setTopic(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  return { topic, loading, error };
}

export function useTopicBySlug(slug: string | null) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setTopic(null);
      setLoading(false);
      return;
    }

    const fetchTopic = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await topicsApi.getBySlug(slug);
        setTopic(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [slug]);

  return { topic, loading, error };
}

export function useTopicAnalytics() {
  const [analytics, setAnalytics] = useState<TopicAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await topicsApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

export function useEntityTopics(entityType: string, entityId: string | null) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopics = useCallback(async () => {
    if (!entityId) {
      setTopics([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await topicsApi.getTopicsForEntity(entityType, entityId);
      setTopics(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const addTopics = async (topicIds: string[]) => {
    if (!entityId) return;
    try {
      await topicsApi.addTopicsToEntity(entityType, entityId, topicIds);
      await fetchTopics();
    } catch (err) {
      throw err;
    }
  };

  const removeTopics = async (topicIds: string[]) => {
    if (!entityId) return;
    try {
      await topicsApi.removeTopicsFromEntity(entityType, entityId, topicIds);
      await fetchTopics();
    } catch (err) {
      throw err;
    }
  };

  const setTopics = async (topicIds: string[]) => {
    if (!entityId) return;
    try {
      await topicsApi.setTopicsForEntity(entityType, entityId, topicIds);
      await fetchTopics();
    } catch (err) {
      throw err;
    }
  };

  return {
    topics,
    loading,
    error,
    addTopics,
    removeTopics,
    setTopics,
    refetch: fetchTopics
  };
}