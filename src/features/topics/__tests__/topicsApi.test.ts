import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { topicsApi } from '../api/topicsApi';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('topicsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all topics successfully', async () => {
      const mockTopics = [
        {
          id: '1',
          name: 'Technology',
          slug: 'technology',
          description: 'Tech related content',
          sort_order: 1,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockTopics, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await topicsApi.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('topics');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Technology');
    });

    it('should handle errors gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await topicsApi.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should fetch topic by ID successfully', async () => {
      const mockTopic = {
        id: '1',
        name: 'Technology',
        slug: 'technology',
        sort_order: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTopic, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await topicsApi.getById('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('topics');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result?.name).toBe('Technology');
    });
  });

  describe('create', () => {
    it('should create topic successfully', async () => {
      const newTopic = {
        name: 'New Topic',
        description: 'A new topic'
      };

      const createdTopic = {
        id: '1',
        name: 'New Topic',
        slug: 'new-topic',
        description: 'A new topic',
        sort_order: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: createdTopic, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await topicsApi.create(newTopic);

      expect(mockSupabase.from).toHaveBeenCalledWith('topics');
      expect(result?.name).toBe('New Topic');
    });
  });

  describe('getTopicsForEntity', () => {
    it('should fetch topics for entity successfully', async () => {
      const mockData = [
        {
          topic_id: '1',
          topics: {
            id: '1',
            name: 'Technology',
            slug: 'technology',
            sort_order: 1,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await topicsApi.getTopicsForEntity('news', 'news-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('news_topics');
      expect(mockQuery.eq).toHaveBeenCalledWith('news_id', 'news-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Technology');
    });
  });

  describe('setTopicsForEntity', () => {
    it('should set topics for entity successfully', async () => {
      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      const mockInsertQuery = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockDeleteQuery as any)
        .mockReturnValueOnce(mockInsertQuery as any);

      const result = await topicsApi.setTopicsForEntity('news', 'news-1', ['topic-1', 'topic-2']);

      expect(result).toBe(true);
      expect(mockDeleteQuery.delete).toHaveBeenCalled();
      expect(mockInsertQuery.insert).toHaveBeenCalledWith([
        { news_id: 'news-1', topic_id: 'topic-1' },
        { news_id: 'news-1', topic_id: 'topic-2' }
      ]);
    });
  });
});