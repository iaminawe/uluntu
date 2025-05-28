import React, { ReactNode } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import your reducers
import authReducer from '../redux/slices/authSlice';
import contentReducer from '../redux/slices/contentSlice';
import membersReducer from '../redux/slices/membersSlice';
import eventsReducer from '../redux/slices/eventsSlice';
import opportunitiesReducer from '../redux/slices/opportunitiesSlice';
import companiesReducer from '../redux/slices/companiesSlice';
import groupsReducer from '../redux/slices/groupsSlice';
import marketplaceReducer from '../redux/slices/marketplaceSlice';
import resourcesReducer from '../redux/slices/resourcesSlice';
import newsReducer from '../redux/slices/newsSlice';

// Create a custom render function that includes Redux provider
function render(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        content: contentReducer,
        members: membersReducer,
        events: eventsReducer,
        opportunities: opportunitiesReducer,
        companies: companiesReducer,
        groups: groupsReducer,
        marketplace: marketplaceReducer,
        resources: resourcesReducer,
        news: newsReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <HelmetProvider>
            {children}
          </HelmetProvider>
        </BrowserRouter>
      </Provider>
    );
  }
  return {
    store,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the render method
export { render };

// Mock Supabase session and user data
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    app_metadata: {
      provider: 'email',
    },
    user_metadata: {
      name: 'Test User',
    },
    aud: 'authenticated',
    role: 'authenticated',
  },
};

export const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  app_metadata: {
    provider: 'email',
  },
  user_metadata: {
    name: 'Test User',
  },
  aud: 'authenticated',
  role: 'authenticated',
};

// Helper to wait for promises to resolve
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
