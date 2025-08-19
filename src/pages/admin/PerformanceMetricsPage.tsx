import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { queryPerformanceMonitor } from '@/utils/queryPerformance';
import { 
  BarChart3, 
  Activity, 
  Database, 
  Zap, 
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RenderMetric {
  componentName: string;
  renderCount: number;
  renderTime: number;
}

export default function PerformanceMetricsPage() {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [queryMetrics, setQueryMetrics] = useState(queryPerformanceMonitor.getMetrics());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setQueryMetrics(queryPerformanceMonitor.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setMetrics(performanceMonitor.getMetrics());
    setQueryMetrics(queryPerformanceMonitor.getMetrics());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportReport = () => {
    const report = performanceMonitor.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateTrend = (current: number, baseline: number) => {
    const change = ((current - baseline) / baseline) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change < 0,
      icon: change < 0 ? TrendingDown : TrendingUp
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Performance Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time performance monitoring and analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="secondary"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bundle Size */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-slate-500">vs baseline</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.bundleSize ? formatBytes(metrics.bundleSize) : 'N/A'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Bundle Size
          </div>
        </div>

        {/* Network Requests */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-green-600" />
            <span className="text-sm text-slate-500">total</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.networkRequests?.length || 0}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Network Requests
          </div>
          <div className="text-xs text-green-600 mt-2">
            {metrics.networkRequests?.filter(r => r.cached).length || 0} cached
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-slate-500">target: 80%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {queryMetrics.totalQueries > 0
              ? ((queryMetrics.cachedQueries / queryMetrics.totalQueries) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Cache Hit Rate
          </div>
          <div className="text-xs text-purple-600 mt-2">
            {queryMetrics.cachedQueries} / {queryMetrics.totalQueries} queries
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-slate-500">current</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.memoryUsage ? formatBytes(metrics.memoryUsage.usedJSHeapSize) : 'N/A'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Memory Usage
          </div>
          <div className="text-xs text-orange-600 mt-2">
            {metrics.memoryUsage
              ? `${((metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100).toFixed(1)}% of limit`
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            React Query Performance
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Queries</span>
              <span className="text-sm font-medium">{queryMetrics.totalQueries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Average Duration</span>
              <span className="text-sm font-medium">{queryMetrics.averageDuration.toFixed(2)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Failed Queries</span>
              <span className="text-sm font-medium text-red-600">{queryMetrics.failedQueries}</span>
            </div>
          </div>

          {queryMetrics.slowestQueries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium mb-2">Slowest Queries</h3>
              <div className="space-y-1">
                {queryMetrics.slowestQueries.map((q, i) => (
                  <div key={i} className="text-xs flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                      {q.queryKey}
                    </span>
                    <span className="font-mono">{q.duration?.toFixed(0)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Component Render Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Component Performance
          </h2>
          {(metrics as any).renderMetrics && Array.isArray((metrics as any).renderMetrics) && (metrics as any).renderMetrics.length > 0 ? (
            <div className="space-y-3">
              {(metrics as any).renderMetrics
                .sort((a: RenderMetric, b: RenderMetric) => b.renderCount - a.renderCount)
                .slice(0, 5)
                .map((component: RenderMetric, i: number) => {
                  const avgTime = component.renderTime / component.renderCount;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{component.componentName}</span>
                        <span className="text-xs text-slate-500">{component.renderCount} renders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((avgTime / 50) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{avgTime.toFixed(1)}ms</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No render data available</p>
          )}
        </div>
      </div>

      {/* Network Requests Details */}
      {metrics.networkRequests && metrics.networkRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Network Requests
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {metrics.networkRequests.slice(-10).map((req, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-sm text-slate-900 dark:text-white truncate max-w-xs">
                      {req.url}
                    </td>
                    <td className="px-3 py-2 text-sm font-mono">
                      {req.duration.toFixed(0)}ms
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {formatBytes(req.size)}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {req.cached ? (
                        <span className="text-green-600">Cached</span>
                      ) : (
                        <span className="text-blue-600">Network</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}