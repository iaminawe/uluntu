// Mock environment dependencies first
jest.mock('@/config/env', () => ({
  getIsSupabaseEnabled: jest.fn().mockReturnValue(false),
  IS_SUPABASE_ENABLED: false
}));

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { marketplaceApi } from '@/features/marketplace/api/marketplaceApi';
import { supabase } from '@/lib/supabase';
import type { MarketplaceFilters } from '../../../types';

// Mock Supabase client
jest.mock('@/lib/supabase', () => {
  const mockFrom = jest.fn();
  const mockAuth = {
    getUser: jest.fn()
  };
  
  return {
    supabase: {
      from: mockFrom,
      auth: mockAuth
    }
  };
});

describe.skip('Marketplace API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all marketplace listings without filters', async () => {
      const mockListings = [
        {
          id: '1',
          title: 'Test Item',
          description: 'Test description',
          price: 50,
          type: 'product',
          seller_id: 'user1',
          status: 'active'
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockListings, error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await marketplaceApi.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('marketplace_listings');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
      expect(result).toEqual(mockListings);
    });

    it('should apply search filter when provided', async () => {
      const filters: MarketplaceFilters = {
        search: 'wooden',
        type: '',
        condition: '',
        minPrice: 0,
        maxPrice: 0,
        seller_id: '',
        tags: []
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await marketplaceApi.getAll(filters);

      expect(mockQuery.or).toHaveBeenCalledWith(
        expect.stringContaining('title.ilike.%wooden%,description.ilike.%wooden%')
      );
    });

    it('should apply type filter when provided', async () => {
      const filters: MarketplaceFilters = {
        search: '',
        type: 'product',
        condition: '',
        minPrice: 0,
        maxPrice: 0,
        seller_id: '',
        tags: []
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await marketplaceApi.getAll(filters);

      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'product');
    });

    it('should apply price range filters', async () => {
      const filters: MarketplaceFilters = {
        search: '',
        type: '',
        condition: '',
        minPrice: 10,
        maxPrice: 100,
        seller_id: '',
        tags: []
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await marketplaceApi.getAll(filters);

      expect(mockQuery.gte).toHaveBeenCalledWith('price', 10);
      expect(mockQuery.lte).toHaveBeenCalledWith('price', 100);
    });

    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(marketplaceApi.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should fetch a single listing with seller details', async () => {
      const mockListing = {
        id: '1',
        title: 'Test Item',
        seller_id: 'user1',
        seller: {
          id: 'user1',
          full_name: 'Test Seller',
          email: 'seller@test.com'
        }
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockListing, error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await marketplaceApi.getById('1');

      expect(mockQuery.select).toHaveBeenCalledWith('*, seller:users!seller_id(*)');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockListing);
    });

    it('should throw error if listing not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(marketplaceApi.getById('nonexistent')).rejects.toThrow('Listing not found');
    });
  });

  describe('create', () => {
    it('should create a new listing with authenticated user as seller', async () => {
      const newListing = {
        title: 'New Item',
        description: 'New description',
        price: 25,
        type: 'product' as const,
        condition: 'new' as const,
        images: ['image1.jpg'],
        location: 'Test Location',
        tags: ['tag1', 'tag2']
      };

      const mockUser = { id: 'user1' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { ...newListing, id: '1', seller_id: 'user1' }, 
          error: null 
        })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await marketplaceApi.create(newListing);

      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...newListing,
        seller_id: 'user1',
        status: 'active'
      });
      expect(result.seller_id).toBe('user1');
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      });

      const newListing = {
        title: 'New Item',
        description: 'New description',
        price: 25,
        type: 'product' as const,
        condition: 'new' as const,
        images: [],
        location: 'Test Location',
        tags: []
      };

      await expect(marketplaceApi.create(newListing)).rejects.toThrow('User not authenticated');
    });
  });

  describe('update', () => {
    it('should update an existing listing', async () => {
      const updates = {
        title: 'Updated Title',
        price: 30
      };

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: '1', ...updates }, 
          error: null 
        })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await marketplaceApi.update('1', updates);

      expect(mockQuery.update).toHaveBeenCalledWith(updates);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result.title).toBe('Updated Title');
    });

    it('should validate seller ownership before updating', async () => {
      const mockUser = { id: 'user2' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      // First query to check ownership
      const checkQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { seller_id: 'user1' }, 
          error: null 
        })
      };

      (supabase.from as jest.Mock).mockReturnValueOnce(checkQuery);

      await expect(marketplaceApi.update('1', { title: 'New' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('delete', () => {
    it('should soft delete a listing by updating status', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await marketplaceApi.delete('1');

      expect(mockQuery.update).toHaveBeenCalledWith({ status: 'deleted' });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should validate seller ownership before deleting', async () => {
      const mockUser = { id: 'user2' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const checkQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { seller_id: 'user1' }, 
          error: null 
        })
      };

      (supabase.from as jest.Mock).mockReturnValueOnce(checkQuery);

      await expect(marketplaceApi.delete('1')).rejects.toThrow('Unauthorized');
    });
  });

  describe('getRelated', () => {
    it('should fetch related listings by type', async () => {
      const mockRelated = [
        { id: '2', type: 'product', title: 'Related Item 1' },
        { id: '3', type: 'product', title: 'Related Item 2' }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRelated, error: null })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await marketplaceApi.getRelated('1', 'product');

      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'product');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockQuery.neq).toHaveBeenCalledWith('id', '1');
      expect(mockQuery.limit).toHaveBeenCalledWith(4);
      expect(result).toEqual(mockRelated);
    });
  });
});