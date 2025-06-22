import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import { AuthProvider } from '@/shared/contexts/AuthContextWithRedux';
import { ContentProvider } from '@/shared/contexts/ContentContext';
import { SessionProvider } from '@/shared/contexts/SessionContextWithRedux';
import { store } from '@/store/index';
import { router } from './routes';
import './index.css';
import { DebugUserRoles } from './components/DebugUserRoles';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <HelmetProvider>
        {/* SessionProvider syncs Supabase auth with Redux */}
        <SessionProvider>
          {/* Keep AuthProvider for backward compatibility */}
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <ContentProvider>
                <RouterProvider router={router} />
                <ReactQueryDevtools initialIsOpen={false} />
                {/* <DebugUserRoles /> */}
              </ContentProvider>
            </QueryClientProvider>
          </AuthProvider>
        </SessionProvider>
      </HelmetProvider>
    </ReduxProvider>
  </StrictMode>
);