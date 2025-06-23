import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { queryPerformanceMonitor } from '@/utils/queryPerformance';
import { performanceTests } from '@/utils/performanceTests';
import { Button } from '@/components/ui/Button';
import { BarChart3, Activity, Database, Zap, Package } from 'lucide-react';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [queryMetrics, setQueryMetrics] = useState(queryPerformanceMonitor.getMetrics());
  const [testResults, setTestResults] = useState<string>('');
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setQueryMetrics(queryPerformanceMonitor.getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const runPerformanceTests = async () => {
    setIsRunningTests(true);
    setTestResults('Running performance tests...\n');

    try {
      const results = [];
      
      results.push(await performanceTests.testCompaniesListPerformance());
      results.push(await performanceTests.testAdminResourceManagement());
      results.push(await performanceTests.testGalleryUploadPerformance());
      results.push(await performanceTests.testComplexFilteringPerformance());

      setTestResults(results.join('\n\n'));
    } catch (error) {
      setTestResults(`Error running tests: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Performance Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Real-time performance metrics and analysis
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Bundle Size */}
            {metrics.bundleSize && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Bundle Size</h2>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {formatBytes(metrics.bundleSize)}
                </div>
              </div>
            )}

            {/* Network Performance */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">Network Performance</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.networkRequests?.length || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Requests
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.networkRequests?.filter(r => r.cached).length || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Cached
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.networkRequests && metrics.networkRequests.length > 0
                      ? (
                          metrics.networkRequests.reduce((sum, r) => sum + r.duration, 0) /
                          metrics.networkRequests.length
                        ).toFixed(0)
                      : 0}
                    ms
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Avg Duration
                  </div>
                </div>
              </div>
            </div>

            {/* Query Performance */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold">React Query Performance</h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {queryMetrics.totalQueries}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Queries
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {queryMetrics.totalQueries > 0
                      ? ((queryMetrics.cachedQueries / queryMetrics.totalQueries) * 100).toFixed(0)
                      : 0}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Cache Hit Rate
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {queryMetrics.averageDuration.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Avg Duration
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {queryMetrics.failedQueries}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Failed
                  </div>
                </div>
              </div>

              {queryMetrics.slowestQueries.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Slowest Queries</h3>
                  <div className="space-y-1">
                    {queryMetrics.slowestQueries.map((q, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-mono">{q.duration?.toFixed(0)}ms</span> -{' '}
                        <span className="truncate inline-block max-w-xs">{q.queryKey}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">Memory Usage</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatBytes(metrics.memoryUsage.usedJSHeapSize)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Used Heap
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatBytes(metrics.memoryUsage.totalJSHeapSize)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Total Heap
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {(
                        (metrics.memoryUsage.usedJSHeapSize /
                          metrics.memoryUsage.jsHeapSizeLimit) *
                        100
                      ).toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Usage
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tests */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Performance Tests</h2>
                <Button
                  onClick={runPerformanceTests}
                  disabled={isRunningTests}
                  size="sm"
                >
                  {isRunningTests ? 'Running Tests...' : 'Run Tests'}
                </Button>
              </div>
              {testResults && (
                <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {testResults}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}