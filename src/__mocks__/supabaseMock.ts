// Enhanced Mock Supabase Client with proper method chaining
class MockPostgrestBuilder {
  private mockData: any;
  private mockError: any;
  private mockCount: number;
  
  constructor(data: any = [], error: any = null, count: number = 0) {
    this.mockData = data;
    this.mockError = error;
    this.mockCount = count;
  }
  
  // Query builders that return this for chaining
  select = jest.fn(() => this);
  eq = jest.fn(() => this);
  neq = jest.fn(() => this);
  gt = jest.fn(() => this);
  gte = jest.fn(() => this);
  lt = jest.fn(() => this);
  lte = jest.fn(() => this);
  in = jest.fn(() => this);
  is = jest.fn(() => this);
  ilike = jest.fn(() => this);
  like = jest.fn(() => this);
  match = jest.fn(() => this);
  or = jest.fn(() => this);
  and = jest.fn(() => this);
  not = jest.fn(() => this);
  filter = jest.fn(() => this);
  contains = jest.fn(() => this);
  containedBy = jest.fn(() => this);
  overlaps = jest.fn(() => this);
  order = jest.fn(() => this);
  limit = jest.fn(() => this);
  range = jest.fn(() => this);
  
  // Terminal methods that return promises
  single = jest.fn(() => Promise.resolve({ data: this.mockData[0] || null, error: this.mockError }));
  maybeSingle = jest.fn(() => Promise.resolve({ data: this.mockData[0] || null, error: this.mockError }));
  then = jest.fn((onFulfilled) => {
    const result = { data: this.mockData, error: this.mockError, count: this.mockCount };
    return Promise.resolve(result).then(onFulfilled);
  });
}

class MockTable {
  private _tableName: string;
  
  constructor(tableName: string) {
    this._tableName = tableName;
  }
  
  select = jest.fn((_columns = '*', options = {}) => {
    const count = options.count ? 10 : undefined;
    return new MockPostgrestBuilder([], null, count);
  });
  
  insert = jest.fn((data) => {
    const insertBuilder = {
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: Array.isArray(data) ? data[0] : data,
          error: null
        }))
      }))
    };
    return insertBuilder;
  });
  
  update = jest.fn((data) => ({
    eq: jest.fn(() => Promise.resolve({ data: data, error: null })),
    match: jest.fn(() => Promise.resolve({ data: data, error: null }))
  }));
  
  delete = jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    match: jest.fn(() => Promise.resolve({ data: null, error: null }))
  }));
  
  upsert = jest.fn((data) => ({
    select: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({
        data: Array.isArray(data) ? data[0] : data,
        error: null
      }))
    }))
  }));
}

export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    updateUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    resetPasswordForEmail: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    onAuthStateChange: jest.fn(() => ({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    })),
  },
  
  from: jest.fn((tableName: string) => new MockTable(tableName)),
  
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
      remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
      list: jest.fn(() => Promise.resolve({ data: [], error: null })),
      copy: jest.fn(() => Promise.resolve({ data: null, error: null })),
      move: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  },
  
  rpc: jest.fn((functionName: string, params?: any) => {
    // Mock different RPC functions
    switch (functionName) {
      case 'version':
        return Promise.resolve({ data: '1.0.0', error: null });
      case 'get_campaign_analytics':
        return Promise.resolve({ 
          data: {
            campaign_id: params?.p_campaign_id || params?.campaign_id,
            sent_count: 100,
            delivered_count: 95,
            opened_count: 50,
            clicked_count: 10,
            bounced_count: 5,
            unsubscribed_count: 2,
            complained_count: 1,
            open_rate: 52.6,
            click_rate: 20.0,
            bounce_rate: 5.0
          }, 
          error: null 
        });
      case 'get_subscription_analytics':
        return Promise.resolve({
          data: {
            total_subscriptions: 1000,
            active_subscriptions: 850,
            pending_subscriptions: 50,
            bounced_subscriptions: 25,
            unsubscribed_subscriptions: 75,
            subscriptions_this_month: 100,
            unsubscribes_this_month: 10
          },
          error: null
        });
      case 'get_campaign_overview':
        return Promise.resolve({
          data: {
            total_campaigns: 25,
            draft_campaigns: 5,
            scheduled_campaigns: 2,
            sent_campaigns: 18,
            avg_open_rate: 42.5,
            avg_click_rate: 15.2,
            total_subscribers_reached: 15000
          },
          error: null
        });
      default:
        return Promise.resolve({ data: null, error: null });
    }
  }),
  
  functions: {
    invoke: jest.fn(() => Promise.resolve({ data: null, error: null }))
  },
  
  // Utility method to configure mock responses globally
  _setMockResponse: (_tableName: string, _data: any, _error: any = null) => {
    // This would be used in tests to set up specific responses
  }
};

// Mock Supabase environment variables
export const mockSupabaseEnv = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_KEY: 'mock-supabase-key',
};

// Helper function to check Supabase connection
export const checkSupabaseConnection = jest.fn(() => Promise.resolve(false));
