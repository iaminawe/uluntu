import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
// import { ContentProvider } from '@/shared/contexts/ContentContext';
import { SessionProvider } from '@/shared/contexts/SessionContextWithRedux';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { store } from '@/store/index';
import { router } from './routes';
import { createQueryClient, setupQueryPerformanceMonitoring } from './config/queryClient';
import './index.css';
import { DebugUserRoles } from './components/DebugUserRoles';
import { DynamicAppConfig } from './components/DynamicAppConfig';
import { SettingsDebugger } from './components/SettingsDebugger';

// Create optimized query client
const queryClient = createQueryClient();

// Enable performance monitoring in development
if (import.meta.env.DEV) {
  setupQueryPerformanceMonitoring(queryClient);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <HelmetProvider>
        {/* SessionProvider syncs Supabase auth with Redux */}
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
              {/* SettingsProvider for global site configuration */}
              <SettingsProvider>
                <ThemeProvider>
                  {/* <ContentProvider> */}
                    <DynamicAppConfig />
                    <RouterProvider router={router} />
                  <ReactQueryDevtools initialIsOpen={false} />
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                      {/* <DebugUserRoles /> */}
                    <SettingsDebugger />
                  {/* </ContentProvider> */}
                </ThemeProvider>
              </SettingsProvider>
            </QueryClientProvider>
        </SessionProvider>
      </HelmetProvider>
    </ReduxProvider>
  </StrictMode>
);