import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import membersReducer from './slices/membersSlice';
import companiesReducer from './slices/companiesSlice';
import opportunitiesReducer from './slices/opportunitiesSlice';
import resourcesReducer from './slices/resourcesSlice';
import groupsReducer from './slices/groupsSlice';
import newsReducer from './slices/newsSlice';
import marketplaceReducer from './slices/marketplaceSlice';
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
    process.env.NODE_ENV === 'development' 
      ? getDefaultMiddleware().concat(logger)
      : getDefaultMiddleware(),
  devTools: {
    // Only enable in non-production environments
    enabled: process.env.NODE_ENV !== 'production',
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
