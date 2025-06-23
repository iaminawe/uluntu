import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { performanceMonitor, markPerformance, measurePerformance } from '@/utils/performanceMonitor';
import { useQueryPerformance } from '@/utils/queryPerformance';

interface UsePerformanceMonitoringOptions {
  enableNetworkTracking?: boolean;
  enableRenderTracking?: boolean;
  enableMemoryTracking?: boolean;
  enableQueryTracking?: boolean;
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    enableNetworkTracking = true,
    enableRenderTracking = true,
    enableMemoryTracking = true,
    enableQueryTracking = true
  } = options;

  const location = useLocation();
  const previousLocation = useRef(location.pathname);

  // Track React Query performance
  if (enableQueryTracking) {
    useQueryPerformance();
  }

  // Track route changes
  useEffect(() => {
    if (previousLocation.current !== location.pathname) {
      markPerformance(`route-change-end-${location.pathname}`);
      const duration = measurePerformance(
        `route-change-${previousLocation.current}-to-${location.pathname}`,
        `route-change-start-${previousLocation.current}`,
        `route-change-end-${location.pathname}`
      );

      if (duration) {
        console.log(`Route change took ${duration.toFixed(2)}ms`);
      }

      previousLocation.current = location.pathname;
    }

    markPerformance(`route-change-start-${location.pathname}`);
  }, [location]);

  // Log performance report periodically in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        console.log(performanceMonitor.generateReport());
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, []);

  return {
    markPerformance,
    measurePerformance,
    getMetrics: () => performanceMonitor.getMetrics(),
    generateReport: () => performanceMonitor.generateReport()
  };
}

// Hook for tracking individual component performance
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;
    
    performanceMonitor.trackComponentRender(componentName, renderDuration);
    
    // Reset for next render
    renderStartTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    markStart: () => {
      renderStartTime.current = performance.now();
      markPerformance(`${componentName}-render-start`);
    },
    markEnd: () => {
      const endTime = performance.now();
      const duration = endTime - renderStartTime.current;
      markPerformance(`${componentName}-render-end`);
      performanceMonitor.trackComponentRender(componentName, duration);
      return duration;
    }
  };
}