import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import authReducer from '@/features/auth/store/authSlice';
import eventsReducer from '@/features/events/store/eventsSlice';
import membersReducer from '@/features/directory/store/membersSlice';
import companiesReducer from '@/features/companies/store/companiesSlice';
import opportunitiesReducer from '@/features/opportunities/store/opportunitiesSlice';
import resourcesReducer from '@/features/resources/store/resourcesSlice';
import groupsReducer from '@/features/groups/store/groupsSlice';
import newsReducer from '@/features/news/store/newsSlice';
import marketplaceReducer from '@/features/marketplace/store/marketplaceSlice';
import contentReducer from './slices/contentSlice';
// Import additional reducers as they become available
// import companyProfilesReducer from './slices/companyProfilesSlice';

// Create a logger middleware for development environment
const logger = createLogger({
  collapsed: true,
  // We can filter actions here to reduce noise
  predicate: (_getState, action) => !action.type.includes('@@redux-form')
});

// Configure and create the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    members: membersReducer,
    companies: companiesReducer,
    opportunities: opportunitiesReducer,
    resources: resourcesReducer,
    groups: groupsReducer,
    news: newsReducer,
    marketplace: marketplaceReducer,
    content: contentReducer,
    // Other reducers will be added as they are implemented
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware(),
  devTools: {
    // Only enable in non-production environments
    enabled: import.meta.env.MODE !== 'production',
    // Custom name for the instance shown in DevTools
    name: 'Kootenay Tech Community',
    // Trace action execution path through middleware, enhancers, and reducers
    trace: true,
    // Maximum number of actions to keep in history
    maxAge: 50,
    // Functions to sanitize data before sending to DevTools (remove sensitive info)
    actionSanitizer: (action) => {
      // Sanitize actions with sensitive data (e.g., authentication)
      if (action.type === 'auth/signIn' && action.payload?.password) {
        return {
          ...action,
          payload: {
            ...action.payload,
            password: '[REDACTED]'
          }
        };
      }
      return action;
    },
    stateSanitizer: (state) => {
      // Sanitize sensitive data in state if needed
      if (state.auth?.session?.access_token) {
        return {
          ...state,
          auth: {
            ...state.auth,
            session: {
              ...state.auth.session,
              access_token: '[REDACTED TOKEN]'
            }
          }
        };
      }
      return state;
    }
  },
});

// Define types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
