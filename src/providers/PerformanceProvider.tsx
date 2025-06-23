import React, { createContext, useContext, ReactNode } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { QueryPerformanceDevTools } from '@/utils/queryPerformance';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceContextValue {
  markPerformance: (markName: string) => void;
  measurePerformance: (measureName: string, startMark: string, endMark?: string) => number | null;
  getMetrics: () => any;
  generateReport: () => string;
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
}

interface PerformanceProviderProps {
  children: ReactNode;
  showDevTools?: boolean;
}

export function PerformanceProvider({ children, showDevTools = false }: PerformanceProviderProps) {
  const performanceHooks = usePerformanceMonitoring({
    enableNetworkTracking: true,
    enableRenderTracking: true,
    enableMemoryTracking: true,
    enableQueryTracking: true
  });

  // Add performance monitoring to window for debugging
  if (process.env.NODE_ENV === 'development') {
    (window as any).__PERF__ = {
      monitor: performanceMonitor,
      getMetrics: performanceHooks.getMetrics,
      generateReport: performanceHooks.generateReport,
      mark: performanceHooks.markPerformance,
      measure: performanceHooks.measurePerformance
    };
  }

  return (
    <PerformanceContext.Provider value={performanceHooks}>
      {children}
      {showDevTools && process.env.NODE_ENV === 'development' && <QueryPerformanceDevTools />}
    </PerformanceContext.Provider>
  );
}