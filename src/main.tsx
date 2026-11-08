import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/shared/contexts/SessionContextWithRedux';
import { EnhancedThemeProvider } from '@/providers/EnhancedThemeProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { store } from '@/store/index';
import { router } from './routes';
import { createQueryClient, setupQueryPerformanceMonitoring } from './config/queryClient';
import { setupGlobalErrorHandlers, checkRuntimeEnvironment } from './utils/globalErrorHandler';
import './index.css';
import { DynamicAppConfig } from './components/DynamicAppConfig';
import { SettingsDebugger } from './components/SettingsDebugger';
import { ErrorBoundary } from './components/ErrorBoundary';

// Setup global error handlers
setupGlobalErrorHandlers();

// Check runtime environment
const envIssues = checkRuntimeEnvironment();
if (envIssues.length > 0 && import.meta.env.DEV) {
  console.warn('Runtime environment issues:', envIssues);
}

// Create optimized query client
const queryClient = createQueryClient();

// Enable performance monitoring in development
if (import.meta.env.DEV) {
  setupQueryPerformanceMonitoring(queryClient);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <HelmetProvider>
          {/* SessionProvider syncs Supabase auth with Redux */}
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {/* SettingsProvider for global site configuration */}
                <SettingsProvider>
                  <EnhancedThemeProvider>
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
                    {/* Debug components */}
                    {/* <SettingsDebugger /> */}
                  </EnhancedThemeProvider>
                </SettingsProvider>
              </QueryClientProvider>
          </SessionProvider>
        </HelmetProvider>
      </ReduxProvider>
    </ErrorBoundary>
  </StrictMode>
);