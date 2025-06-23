import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import authReducer from '@/features/auth/store/authSlice';
import eventsUIReducer from '@/features/events/store/eventsUISlice';
import membersUIReducer from '@/features/directory/store/membersUISlice';
import companiesUIReducer from '@/features/companies/store/companiesUISlice';
import opportunitiesReducer from '@/features/opportunities/store/opportunitiesSlice';
import groupsReducer from '@/features/groups/store/groupsSlice';
import newsReducer from '@/features/news/store/newsSlice';
import marketplaceReducer from '@/features/marketplace/store/marketplaceSlice';
import pagesReducer from '@/features/pages/store/pagesSlice';
import onboardingReducer from '@/features/onboarding/store/onboardingSlice';
import contentReducer from '@/store/contentSlice';
import galleryReducer from '@/features/gallery/store/gallerySlice';
import galleryUIReducer from '@/features/gallery/store/galleryUISlice';
import unifiedSettingsUIReducer from '@/features/admin/store/unifiedSettingsUISlice';
// Import additional reducers as they become available
// import companyProfilesReducer from './slices/companyProfilesSlice';

// Create a logger middleware for development environment
const _logger = createLogger({
  collapsed: true,
  // We can filter actions here to reduce noise
  predicate: (_getState, action) => !action.type.includes('@@redux-form')
});

// Configure and create the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    eventsUI: eventsUIReducer,
    membersUI: membersUIReducer,
    companiesUI: companiesUIReducer,
    opportunities: opportunitiesReducer,
    groups: groupsReducer,
    news: newsReducer,
    marketplace: marketplaceReducer,
    pages: pagesReducer,
    onboarding: onboardingReducer,
    content: contentReducer,
    gallery: galleryReducer,
    galleryUI: galleryUIReducer,
    unifiedSettingsUI: unifiedSettingsUIReducer,
    // Other reducers will be added as they are implemented
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware(),
  devTools: (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') ? {
    // Custom name for the instance shown in DevTools
    name: 'Kootenay Tech Community',
    // Trace action execution path through middleware, enhancers, and reducers
    trace: true,
    // Maximum number of actions to keep in history
    maxAge: 50,
    // Functions to sanitize data before sending to DevTools (remove sensitive info)
    actionSanitizer: (action: any) => {
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
    stateSanitizer: (state: any) => {
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
  } : false,
});

// Define types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
