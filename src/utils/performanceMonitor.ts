/**
 * Performance monitoring utility for tracking key metrics
 */

interface PerformanceMetrics {
  bundleSize?: number;
  networkRequests?: NetworkRequest[];
  cacheHits?: CacheMetrics;
  renderMetrics?: RenderMetrics;
  memoryUsage?: MemoryMetrics;
}

interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  size: number;
  cached: boolean;
  timestamp: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  queriesWithData: string[];
}

interface RenderMetrics {
  componentName: string;
  renderCount: number;
  renderTime: number;
  propsChangeCount: number;
}

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private networkObserver: PerformanceObserver | null = null;
  private renderTracker: Map<string, RenderMetrics> = new Map();

  constructor() {
    this.initializeNetworkObserver();
    this.initializeMemoryMonitoring();
  }

  private initializeNetworkObserver() {
    if ('PerformanceObserver' in window) {
      try {
        this.networkObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.trackNetworkRequest(resourceEntry);
            }
          });
        });
        this.networkObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Failed to initialize network observer:', e);
      }
    }
  }

  private initializeMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        this.captureMemorySnapshot();
      }, 30000); // Every 30 seconds
    }
  }

  private trackNetworkRequest(entry: PerformanceResourceTiming) {
    if (!this.metrics.networkRequests) {
      this.metrics.networkRequests = [];
    }

    const request: NetworkRequest = {
      url: entry.name,
      method: 'GET', // Default, as PerformanceResourceTiming doesn't provide method
      duration: entry.duration,
      size: entry.transferSize,
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
      timestamp: entry.startTime
    };

    this.metrics.networkRequests.push(request);
  }

  private captureMemorySnapshot() {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      this.metrics.memoryUsage = {
        usedJSHeapSize: memoryInfo.usedJSHeapSize,
        totalJSHeapSize: memoryInfo.totalJSHeapSize,
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        timestamp: Date.now()
      };
    }
  }

  // React component render tracking
  trackComponentRender(componentName: string, renderTime: number) {
    const existing = this.renderTracker.get(componentName) || {
      componentName,
      renderCount: 0,
      renderTime: 0,
      propsChangeCount: 0
    };

    existing.renderCount++;
    existing.renderTime += renderTime;

    this.renderTracker.set(componentName, existing);
  }

  // React Query cache metrics
  trackCacheMetrics(queryClient: any) {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const hits = queries.filter((q: any) => q.state.data !== undefined).length;
    const total = queries.length;
    const misses = total - hits;

    this.metrics.cacheHits = {
      hits,
      misses,
      hitRate: total > 0 ? (hits / total) * 100 : 0,
      queriesWithData: queries
        .filter((q: any) => q.state.data !== undefined)
        .map((q: any) => q.queryHash)
    };
  }

  // Bundle size tracking (would be populated from build process)
  setBundleSize(size: number) {
    this.metrics.bundleSize = size;
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      renderMetrics: Array.from(this.renderTracker.values())[0] // Get first render metric or undefined
    };
  }

  // Generate performance report
  generateReport(): string {
    const metrics = this.getMetrics();
    const report: string[] = [
      '=== Performance Report ===',
      ''
    ];

    // Bundle Size
    if (metrics.bundleSize) {
      report.push(`Bundle Size: ${(metrics.bundleSize / 1024 / 1024).toFixed(2)} MB`);
      report.push('');
    }

    // Network Requests
    if (metrics.networkRequests && metrics.networkRequests.length > 0) {
      const totalRequests = metrics.networkRequests.length;
      const cachedRequests = metrics.networkRequests.filter(r => r.cached).length;
      const avgDuration = metrics.networkRequests.reduce((sum, r) => sum + r.duration, 0) / totalRequests;

      report.push('Network Performance:');
      report.push(`  Total Requests: ${totalRequests}`);
      report.push(`  Cached Requests: ${cachedRequests} (${((cachedRequests / totalRequests) * 100).toFixed(1)}%)`);
      report.push(`  Average Duration: ${avgDuration.toFixed(2)}ms`);
      report.push('');
    }

    // Cache Metrics
    if (metrics.cacheHits) {
      report.push('Cache Performance:');
      report.push(`  Hit Rate: ${metrics.cacheHits.hitRate.toFixed(1)}%`);
      report.push(`  Hits: ${metrics.cacheHits.hits}`);
      report.push(`  Misses: ${metrics.cacheHits.misses}`);
      report.push('');
    }

    // Render Metrics
    if (metrics.renderMetrics) {
      report.push('Component Render Performance:');
      const renderMetricsArray = Array.from(this.renderTracker.values());
      const topRenders = renderMetricsArray
        .sort((a: RenderMetrics, b: RenderMetrics) => b.renderCount - a.renderCount)
        .slice(0, 5);

      topRenders.forEach((component: RenderMetrics) => {
        const avgRenderTime = component.renderTime / component.renderCount;
        report.push(`  ${component.componentName}:`);
        report.push(`    Renders: ${component.renderCount}`);
        report.push(`    Avg Time: ${avgRenderTime.toFixed(2)}ms`);
      });
      report.push('');
    }

    // Memory Usage
    if (metrics.memoryUsage) {
      report.push('Memory Usage:');
      report.push(`  Used Heap: ${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      report.push(`  Total Heap: ${(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      report.push(`  Heap Limit: ${(metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    }

    return report.join('\n');
  }

  // Clean up
  destroy() {
    if (this.networkObserver) {
      this.networkObserver.disconnect();
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();

  return {
    trackRender: () => {
      const endTime = performance.now();
      performanceMonitor.trackComponentRender(componentName, endTime - startTime);
    }
  };
}

// Performance marks for key operations
export function markPerformance(markName: string) {
  if ('mark' in performance) {
    performance.mark(markName);
  }
}

export function measurePerformance(measureName: string, startMark: string, endMark?: string) {
  if ('measure' in performance) {
    try {
      if (endMark) {
        performance.measure(measureName, startMark, endMark);
      } else {
        performance.measure(measureName, startMark);
      }
      
      const measures = performance.getEntriesByName(measureName, 'measure');
      if (measures.length > 0) {
        return measures[measures.length - 1].duration;
      }
    } catch (e) {
      console.warn('Failed to measure performance:', e);
    }
  }
  return null;
}