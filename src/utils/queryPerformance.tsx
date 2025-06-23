import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { performanceMonitor, markPerformance, measurePerformance } from './performanceMonitor';

interface QueryPerformanceTracker {
  queryKey: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  cached: boolean;
  duration?: number;
}

class QueryPerformanceMonitor {
  private activeQueries: Map<string, QueryPerformanceTracker> = new Map();
  private queryMetrics: QueryPerformanceTracker[] = [];

  trackQueryStart(queryKey: string[]) {
    const key = JSON.stringify(queryKey);
    const tracker: QueryPerformanceTracker = {
      queryKey: key,
      startTime: performance.now(),
      success: false,
      cached: false
    };
    this.activeQueries.set(key, tracker);
    markPerformance(`query-start-${key}`);
  }

  trackQueryEnd(queryKey: string[], success: boolean, cached: boolean) {
    const key = JSON.stringify(queryKey);
    const tracker = this.activeQueries.get(key);
    
    if (tracker) {
      tracker.endTime = performance.now();
      tracker.success = success;
      tracker.cached = cached;
      tracker.duration = tracker.endTime - tracker.startTime;
      
      this.queryMetrics.push(tracker);
      this.activeQueries.delete(key);
      
      markPerformance(`query-end-${key}`);
      measurePerformance(`query-${key}`, `query-start-${key}`, `query-end-${key}`);
    }
  }

  getMetrics() {
    return {
      totalQueries: this.queryMetrics.length,
      cachedQueries: this.queryMetrics.filter(q => q.cached).length,
      averageDuration: this.queryMetrics.reduce((sum, q) => sum + (q.duration || 0), 0) / this.queryMetrics.length,
      slowestQueries: [...this.queryMetrics]
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 5),
      failedQueries: this.queryMetrics.filter(q => !q.success).length
    };
  }

  reset() {
    this.activeQueries.clear();
    this.queryMetrics = [];
  }
}

export const queryPerformanceMonitor = new QueryPerformanceMonitor();

// Hook to track React Query performance
export function useQueryPerformance() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'added' && event.query.queryKey) {
        queryPerformanceMonitor.trackQueryStart(event.query.queryKey as string[]);
      }
      
      if (event.type === 'updated' && event.query.queryKey) {
        const { state } = event.query;
        if (state.status === 'success' || state.status === 'error') {
          queryPerformanceMonitor.trackQueryEnd(
            event.query.queryKey as string[],
            state.status === 'success',
            state.dataUpdateCount > 0 && state.fetchStatus === 'idle'
          );
        }
      }
    });

    // Track cache metrics periodically
    const interval = setInterval(() => {
      performanceMonitor.trackCacheMetrics(queryClient);
    }, 10000); // Every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [queryClient]);
}

// Component to display React Query DevTools with performance metrics
export function QueryPerformanceDevTools() {
  const [metrics, setMetrics] = React.useState(queryPerformanceMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(queryPerformanceMonitor.getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <h3 className="font-bold mb-2">Query Performance</h3>
      <div className="space-y-1">
        <div>Total Queries: {metrics.totalQueries}</div>
        <div>Cached: {metrics.cachedQueries} ({metrics.totalQueries > 0 ? ((metrics.cachedQueries / metrics.totalQueries) * 100).toFixed(1) : 0}%)</div>
        <div>Avg Duration: {metrics.averageDuration.toFixed(2)}ms</div>
        <div>Failed: {metrics.failedQueries}</div>
      </div>
      {metrics.slowestQueries.length > 0 && (
        <>
          <h4 className="font-bold mt-2 mb-1">Slowest Queries:</h4>
          <div className="space-y-1 text-xs">
            {metrics.slowestQueries.map((q, i) => (
              <div key={i} className="truncate">
                {q.queryKey}: {q.duration?.toFixed(0)}ms
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}