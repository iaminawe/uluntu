import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/redux/store';

// Create a test query client
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Create a test Redux store
export const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  store?: ReturnType<typeof createTestStore>;
  queryClient?: QueryClient;
}

const AllTheProviders = ({ 
  children, 
  store, 
  queryClient 
}: { 
  children: ReactNode;
  store: ReturnType<typeof createTestStore>;
  queryClient: QueryClient;
}) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  {
    initialState,
    store = createTestStore(initialState),
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders store={store} queryClient={queryClient}>
      {children}
    </AllTheProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
    queryClient,
  };
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Mock data helpers
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  role: 'user',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockCompany = (overrides = {}) => ({
  id: '1',
  name: 'Test Company',
  description: 'A test company',
  slug: 'test-company',
  ...overrides,
});

export const createMockEvent = (overrides = {}) => ({
  id: '1',
  title: 'Test Event',
  description: 'A test event',
  date: new Date().toISOString(),
  ...overrides,
});

// Async utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Custom matchers
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveClass = (element: HTMLElement | null, className: string) => {
  expect(element).toHaveClass(className);
};

// Legacy compatibility exports
export const createLegacySettingFormat = (setting: any) => ({
  ...setting,
  value: JSON.stringify(setting.value),
  created_at: setting.created_at || new Date().toISOString(),
  updated_at: setting.updated_at || new Date().toISOString(),
});