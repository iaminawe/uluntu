import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import authReducer from '@/features/auth/store/authSlice';
import eventsUIReducer from '@/features/events/store/eventsUISlice';
import membersUIReducer from '@/features/directory/store/membersUISlice';
import companiesUIReducer from '@/features/companies/store/companiesUISlice';
import opportunitiesUIReducer from '@/features/opportunities/store/opportunitiesUISlice';
import groupsUIReducer from '@/features/groups/store/groupsUISlice';
import newsUIReducer from '@/features/news/store/newsUISlice';
import newsReducer from '@/features/news/store/newsSlice';
import marketplaceUIReducer from '@/features/marketplace/store/marketplaceUISlice';
import resourcesUIReducer from '@/features/resources/store/resourcesUISlice';
import pagesReducer from '@/features/pages/store/pagesSlice';
import onboardingReducer from '@/features/onboarding/store/onboardingSlice';
import galleryReducer from '@/features/gallery/store/gallerySlice';
import galleryUIReducer from '@/features/gallery/store/galleryUISlice';
import adminSettingsUIReducer from '@/features/admin/store/adminSettingsUISlice';
import messagingUIReducer from '@/features/messaging/store/messagingUISlice';
import topicsUIReducer from '@/features/topics/store/topicsUISlice';
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
    opportunitiesUI: opportunitiesUIReducer,
    groupsUI: groupsUIReducer,
    news: newsReducer,
    newsUI: newsUIReducer,
    marketplaceUI: marketplaceUIReducer,
    resourcesUI: resourcesUIReducer,
    pages: pagesReducer,
    onboarding: onboardingReducer,
    gallery: galleryReducer,
    galleryUI: galleryUIReducer,
    adminSettingsUI: adminSettingsUIReducer,
    messagingUI: messagingUIReducer,
    topicsUI: topicsUIReducer,
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
