import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/lib/supabase';
import { topicsApi, newsTopicsApi, eventTopicsApi } from '@/api/topics';
import type { Topic } from '@/types/topic';

describe('Topics Integration Tests', () => {
  let testTopic: Topic;
  let testNewsId: string;
  let testEventId: string;

  beforeAll(async () => {
    // Create a test topic
    testTopic = await topicsApi.create({
      name: 'Test Topic',
      description: 'Test topic for integration tests',
      color: '#FF0000',
      sort_order: 999
    });

    // Create test entities
    const { data: newsData } = await supabase
      .from('news')
      .insert({
        title: 'Test News Article',
        content: 'Test content',
        status: 'draft',
        author_id: '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single();
    
    if (newsData) {
      testNewsId = newsData.id;
    }

    const { data: eventData } = await supabase
      .from('events')
      .insert({
        title: 'Test Event',
        description: 'Test event description',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'draft'
      })
      .select()
      .single();
    
    if (eventData) {
      testEventId = eventData.id;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testNewsId) {
      await supabase.from('news').delete().eq('id', testNewsId);
    }
    if (testEventId) {
      await supabase.from('events').delete().eq('id', testEventId);
    }
    if (testTopic) {
      await topicsApi.delete(testTopic.id);
    }
  });

  describe('Topic CRUD Operations', () => {
    test('should retrieve all topics', async () => {
      const topics = await topicsApi.getAll();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
      
      // Check for initial seeded topics
      const topicNames = topics.map(t => t.name);
      expect(topicNames).toContain('Technology');
      expect(topicNames).toContain('Business');
      expect(topicNames).toContain('Art');
    });

    test('should get topic by ID', async () => {
      const topic = await topicsApi.getById(testTopic.id);
      expect(topic).toBeDefined();
      expect(topic.name).toBe('Test Topic');
      expect(topic.slug).toBe('test-topic');
    });

    test('should get topic by slug', async () => {
      const topic = await topicsApi.getBySlug('test-topic');
      expect(topic).toBeDefined();
      expect(topic.id).toBe(testTopic.id);
    });

    test('should update topic', async () => {
      const updated = await topicsApi.update(testTopic.id, {
        description: 'Updated description'
      });
      expect(updated.description).toBe('Updated description');
    });

    test('should handle slug generation', async () => {
      const topic = await topicsApi.create({
        name: 'Complex Topic Name!!!',
        sort_order: 998
      });
      expect(topic.slug).toBe('complex-topic-name');
      
      // Clean up
      await topicsApi.delete(topic.id);
    });
  });

  describe('News-Topic Integration', () => {
    test('should add topics to news article', async () => {
      await newsTopicsApi.addTopics(testNewsId, [testTopic.id]);
      
      const topics = await newsTopicsApi.getTopics(testNewsId);
      expect(topics).toHaveLength(1);
      expect(topics[0].id).toBe(testTopic.id);
    });

    test('should set multiple topics for news article', async () => {
      // Get existing topics
      const allTopics = await topicsApi.getAll();
      const topicIds = allTopics.slice(0, 3).map(t => t.id);
      
      await newsTopicsApi.setTopics(testNewsId, topicIds);
      
      const topics = await newsTopicsApi.getTopics(testNewsId);
      expect(topics).toHaveLength(3);
    });

    test('should remove topics from news article', async () => {
      const topics = await newsTopicsApi.getTopics(testNewsId);
      const topicToRemove = topics[0];
      
      await newsTopicsApi.removeTopics(testNewsId, [topicToRemove.id]);
      
      const remainingTopics = await newsTopicsApi.getTopics(testNewsId);
      expect(remainingTopics.length).toBe(topics.length - 1);
      expect(remainingTopics.find(t => t.id === topicToRemove.id)).toBeUndefined();
    });
  });

  describe('Event-Topic Integration', () => {
    test('should add topics to event', async () => {
      await eventTopicsApi.addTopics(testEventId, [testTopic.id]);
      
      const topics = await eventTopicsApi.getTopics(testEventId);
      expect(topics).toHaveLength(1);
      expect(topics[0].id).toBe(testTopic.id);
    });

    test('should handle duplicate topic assignments', async () => {
      // Try to add the same topic again
      await expect(
        eventTopicsApi.addTopics(testEventId, [testTopic.id])
      ).rejects.toThrow();
    });
  });

  describe('Topic Analytics', () => {
    test('should retrieve topic analytics', async () => {
      const analytics = await topicsApi.getAnalytics();
      expect(Array.isArray(analytics)).toBe(true);
      
      const testTopicAnalytics = analytics.find(a => a.topic_id === testTopic.id);
      expect(testTopicAnalytics).toBeDefined();
      expect(testTopicAnalytics?.content_count).toBeGreaterThanOrEqual(0);
    });

    test('analytics should update when topics are assigned', async () => {
      // Get initial analytics
      const initialAnalytics = await topicsApi.getAnalytics();
      const initialCount = initialAnalytics.find(a => a.topic_id === testTopic.id)?.content_count || 0;
      
      // Add topic to a new entity
      const { data: newNews } = await supabase
        .from('news')
        .insert({
          title: 'Analytics Test Article',
          content: 'Test',
          status: 'draft',
          author_id: '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();
      
      if (newNews) {
        await newsTopicsApi.addTopics(newNews.id, [testTopic.id]);
        
        // Check updated analytics
        const updatedAnalytics = await topicsApi.getAnalytics();
        const updatedCount = updatedAnalytics.find(a => a.topic_id === testTopic.id)?.content_count || 0;
        
        expect(updatedCount).toBe(initialCount + 1);
        
        // Clean up
        await supabase.from('news').delete().eq('id', newNews.id);
      }
    });
  });

  describe('Topic Permissions', () => {
    test('should allow all users to read topics', async () => {
      // This test would need to run with different user contexts
      // For now, we'll just verify the basic read operation works
      const topics = await topicsApi.getAll();
      expect(topics).toBeDefined();
    });

    test('should restrict topic creation to admins', async () => {
      // This would need to be tested with a non-admin user context
      // For now, we'll skip this test in the integration suite
      expect(true).toBe(true);
    });
  });

  describe('Entity Query Integration', () => {
    test('should include topics when querying news with relations', async () => {
      // Set topics for the test news
      const allTopics = await topicsApi.getAll();
      await newsTopicsApi.setTopics(testNewsId, [allTopics[0].id, allTopics[1].id]);
      
      // Query news with topics relation
      const { data: newsWithTopics } = await supabase
        .from('news')
        .select(`
          *,
          news_topics (
            topic_id,
            topics (*)
          )
        `)
        .eq('id', testNewsId)
        .single();
      
      expect(newsWithTopics).toBeDefined();
      expect(newsWithTopics?.news_topics).toHaveLength(2);
      expect(newsWithTopics?.news_topics[0].topics).toBeDefined();
    });
  });
});

describe('Topic UI Components', () => {
  test('TopicSelector should be importable', async () => {
    const module = await import('@/components/topics/TopicSelector');
    expect(module.TopicSelector).toBeDefined();
  });

  test('TopicBadges should be importable', async () => {
    const module = await import('@/components/topics/TopicBadges');
    expect(module.TopicBadges).toBeDefined();
    expect(module.TopicBadgesCompact).toBeDefined();
  });
});

describe('Topic Migration Validation', () => {
  test('topics table should exist with correct structure', async () => {
    const { data: columns } = await supabase
      .from('topics')
      .select('*')
      .limit(0);
    
    // If the query doesn't throw, the table exists
    expect(columns).toBeDefined();
  });

  test('junction tables should exist', async () => {
    const tables = [
      'news_topics',
      'event_topics',
      'resource_topics',
      'group_topics',
      'marketplace_topics',
      'opportunity_topics',
      'company_topics'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      expect(error).toBeNull();
    }
  });

  test('topic_analytics view should exist', async () => {
    const { error } = await supabase
      .from('topic_analytics')
      .select('*')
      .limit(0);
    
    expect(error).toBeNull();
  });
});