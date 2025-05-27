import { configureStore } from '@reduxjs/toolkit';
import newsReducer, {
  NewsState,
  fetchNewsArticles,
  fetchNewsArticleById,
  fetchNewsArticleBySlug,
  fetchFilteredNewsArticles,
  fetchRelatedNewsArticles,
  fetchFeaturedNewsArticles,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  setFilters,
  clearFilters
} from './newsSlice';

// Mock data
const mockNewsArticles = [
  {
    id: '1',
    title: 'Kootenay Tech Summit Announced',
    slug: 'kootenay-tech-summit-announced',
    excerpt: 'Annual tech summit to be held in Nelson this fall',
    content: 'The annual Kootenay Tech Summit will take place this September in Nelson, BC. This event brings together tech professionals, entrepreneurs, and enthusiasts from across the region.',
    date: '2023-07-15T12:00:00Z',
    image: 'https://example.com/images/tech-summit.jpg',
    hero_image_alt: 'Tech Summit banner',
    featured: true,
    status: 'published',
    author: {
      id: '1',
      name: 'Jane Smith',
      image: 'https://example.com/images/jane-smith.jpg'
    },
    tags: ['event', 'summit', 'tech']
  },
  {
    id: '2',
    title: 'New Coworking Space Opens in Rossland',
    slug: 'new-coworking-space-rossland',
    excerpt: 'Modern workspace aims to attract remote workers',
    content: 'A new coworking space has opened in Rossland, offering modern amenities for remote workers and digital nomads. The space includes high-speed internet, meeting rooms, and a coffee bar.',
    date: '2023-07-01T10:30:00Z',
    image: 'https://example.com/images/coworking-space.jpg',
    hero_image_alt: 'Coworking space interior',
    featured: false,
    status: 'published',
    author: {
      id: '2',
      name: 'John Doe',
      image: 'https://example.com/images/john-doe.jpg'
    },
    tags: ['workspace', 'remote-work', 'tech']
  }
];

// Mock API functions
jest.mock('../../api/newsApi', () => ({
  newsApi: {
    getAll: jest.fn().mockImplementation((filters) => {
      let result = [...mockNewsArticles];
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        result = result.filter(article => 
          article.title.toLowerCase().includes(searchTerm) || 
          article.excerpt.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        result = result.filter(article => 
          article.tags.some(tag => filters.tags.includes(tag))
        );
      }
      
      if (filters?.featured !== undefined) {
        result = result.filter(article => article.featured === filters.featured);
      }
      
      return Promise.resolve(result);
    }),
    getById: jest.fn().mockImplementation((id) => {
      const article = mockNewsArticles.find(article => article.id === id);
      return Promise.resolve(article || null);
    }),
    getBySlug: jest.fn().mockImplementation((slug) => {
      const article = mockNewsArticles.find(article => article.slug === slug);
      return Promise.resolve(article || null);
    }),
    getRelated: jest.fn().mockImplementation((id, limit = 3) => {
      const article = mockNewsArticles.find(article => article.id === id);
      if (!article) return Promise.resolve([]);
      
      const relatedArticles = mockNewsArticles
        .filter(a => a.id !== id && a.tags.some(tag => article.tags.includes(tag)))
        .slice(0, limit);
      
      return Promise.resolve(relatedArticles);
    }),
    create: jest.fn().mockImplementation((data) => {
      const newArticle = {
        id: '3',
        ...data,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        date: data.publish_date || new Date().toISOString(),
        status: data.status || 'published',
        featured: data.featured || false,
        author: {
          id: data.author_id || '1',
          name: 'Default Author',
          image: 'https://example.com/images/default-author.jpg'
        },
        tags: data.tags || []
      };
      return Promise.resolve(newArticle);
    }),
    update: jest.fn().mockImplementation((id, data) => {
      const article = mockNewsArticles.find(article => article.id === id);
      if (!article) return Promise.resolve(null);
      
      const updatedArticle = {
        ...article,
        ...data,
        author: article.author
      };
      
      return Promise.resolve(updatedArticle);
    }),
    delete: jest.fn().mockResolvedValue(true)
  }
}));

// Mock environment variable
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    VITE_USE_SUPABASE: 'true'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('news slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        news: newsReducer
      }
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().news).toEqual({
      articles: [],
      currentArticle: null,
      filteredArticles: [],
      relatedArticles: [],
      featuredArticles: [],
      filters: {},
      status: 'idle',
      error: null
    });
  });

  it('should handle fetchNewsArticles', async () => {
    await store.dispatch(fetchNewsArticles());
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.articles).toEqual(mockNewsArticles);
  });

  it('should handle fetchNewsArticleById', async () => {
    await store.dispatch(fetchNewsArticleById('1'));
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.currentArticle).toEqual(mockNewsArticles[0]);
  });

  it('should handle fetchNewsArticleBySlug', async () => {
    await store.dispatch(fetchNewsArticleBySlug('kootenay-tech-summit-announced'));
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.currentArticle).toEqual(mockNewsArticles[0]);
  });

  it('should handle fetchFilteredNewsArticles with search', async () => {
    await store.dispatch(fetchFilteredNewsArticles({ search: 'coworking' }));
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.filteredArticles).toEqual([mockNewsArticles[1]]);
  });

  it('should handle fetchFilteredNewsArticles with tags', async () => {
    await store.dispatch(fetchFilteredNewsArticles({ tags: ['event'] }));
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.filteredArticles).toEqual([mockNewsArticles[0]]);
  });

  it('should handle fetchFilteredNewsArticles with featured', async () => {
    await store.dispatch(fetchFilteredNewsArticles({ featured: true }));
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.filteredArticles).toEqual([mockNewsArticles[0]]);
  });

  it('should handle fetchRelatedNewsArticles', async () => {
    await store.dispatch(fetchRelatedNewsArticles({ id: '1' }));
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.relatedArticles).toHaveLength(1);
    expect(store.getState().news.relatedArticles[0].id).toBe('2');
  });

  it('should handle fetchFeaturedNewsArticles', async () => {
    await store.dispatch(fetchFeaturedNewsArticles());
    expect(store.getState().news.status).toBe('succeeded');
    expect(store.getState().news.featuredArticles).toEqual([mockNewsArticles[0]]);
  });

  it('should handle createNewsArticle', async () => {
    const newArticle = {
      title: 'New Technology Trends',
      excerpt: 'Exploring emerging tech trends',
      content: 'Detailed analysis of emerging technology trends in the Kootenay region',
      hero_image: 'https://example.com/images/tech-trends.jpg',
      tags: ['tech', 'trends']
    };
    
    await store.dispatch(createNewsArticle(newArticle));
    expect(store.getState().news.articles).toHaveLength(1);
    expect(store.getState().news.articles[0].title).toBe('New Technology Trends');
    expect(store.getState().news.articles[0].id).toBe('3');
  });

  it('should handle updateNewsArticle', async () => {
    // First fetch articles to populate the state
    await store.dispatch(fetchNewsArticles());
    
    // Then update one article
    const updateData = {
      title: 'Updated Tech Summit Announcement',
      excerpt: 'Updated details about the tech summit'
    };
    
    await store.dispatch(updateNewsArticle({ id: '1', data: updateData }));
    
    const updatedArticle = store.getState().news.articles.find(article => article.id === '1');
    expect(updatedArticle).toBeTruthy();
    expect(updatedArticle?.title).toBe('Updated Tech Summit Announcement');
    expect(updatedArticle?.excerpt).toBe('Updated details about the tech summit');
  });

  it('should handle deleteNewsArticle', async () => {
    // First fetch articles to populate the state
    await store.dispatch(fetchNewsArticles());
    expect(store.getState().news.articles.length).toBe(2);
    
    // Then delete one article
    await store.dispatch(deleteNewsArticle('1'));
    
    expect(store.getState().news.articles.length).toBe(1);
    expect(store.getState().news.articles[0].id).toBe('2');
  });

  it('should handle setFilters', () => {
    store.dispatch(setFilters({ search: 'tech', tags: ['event'] }));
    expect(store.getState().news.filters).toEqual({
      search: 'tech',
      tags: ['event']
    });
  });

  it('should handle clearFilters', () => {
    // First set some filters
    store.dispatch(setFilters({ search: 'tech', tags: ['event'] }));
    
    // Then clear them
    store.dispatch(clearFilters());
    
    expect(store.getState().news.filters).toEqual({});
  });
});
