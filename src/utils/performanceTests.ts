import { performanceMonitor, markPerformance } from './performanceMonitor';

export interface PerformanceTestResult {
  testName: string;
  duration: number;
  networkRequests: number;
  cacheHits: number;
  memoryBefore: number;
  memoryAfter: number;
  renderCount: number;
  passed: boolean;
  details: string[];
}

export class PerformanceTestRunner {
  private results: PerformanceTestResult[] = [];

  async runTestScenario(
    testName: string,
    scenario: () => Promise<void>,
    expectations?: {
      maxDuration?: number;
      maxNetworkRequests?: number;
      minCacheHitRate?: number;
      maxMemoryIncrease?: number;
    }
  ): Promise<PerformanceTestResult> {
    console.log(`Running performance test: ${testName}`);
    
    // Reset metrics
    const metricsBefore = performanceMonitor.getMetrics();
    const memoryBefore = this.getMemoryUsage();
    const networkRequestsBefore = metricsBefore.networkRequests?.length || 0;
    
    // Mark test start
    markPerformance(`test-start-${testName}`);
    const startTime = performance.now();
    
    try {
      // Run the scenario
      await scenario();
      
      // Wait a bit for all async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark test end
      markPerformance(`test-end-${testName}`);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Collect metrics
      const metricsAfter = performanceMonitor.getMetrics();
      const memoryAfter = this.getMemoryUsage();
      const networkRequestsAfter = metricsAfter.networkRequests?.length || 0;
      const newNetworkRequests = networkRequestsAfter - networkRequestsBefore;
      
      // Calculate cache hit rate for new requests
      const newRequests = metricsAfter.networkRequests?.slice(networkRequestsBefore) || [];
      const cachedRequests = newRequests.filter(r => r.cached).length;
      const cacheHitRate = newRequests.length > 0 ? (cachedRequests / newRequests.length) * 100 : 0;
      
      // Check expectations
      const details: string[] = [];
      let passed = true;
      
      if (expectations?.maxDuration && duration > expectations.maxDuration) {
        passed = false;
        details.push(`Duration ${duration.toFixed(0)}ms exceeds limit of ${expectations.maxDuration}ms`);
      }
      
      if (expectations?.maxNetworkRequests && newNetworkRequests > expectations.maxNetworkRequests) {
        passed = false;
        details.push(`Network requests ${newNetworkRequests} exceeds limit of ${expectations.maxNetworkRequests}`);
      }
      
      if (expectations?.minCacheHitRate && cacheHitRate < expectations.minCacheHitRate) {
        passed = false;
        details.push(`Cache hit rate ${cacheHitRate.toFixed(1)}% below minimum of ${expectations.minCacheHitRate}%`);
      }
      
      const memoryIncrease = memoryAfter - memoryBefore;
      if (expectations?.maxMemoryIncrease && memoryIncrease > expectations.maxMemoryIncrease) {
        passed = false;
        details.push(`Memory increase ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB exceeds limit`);
      }
      
      const result: PerformanceTestResult = {
        testName,
        duration,
        networkRequests: newNetworkRequests,
        cacheHits: cachedRequests,
        memoryBefore,
        memoryAfter,
        renderCount: this.countNewRenders(metricsBefore, metricsAfter),
        passed,
        details
      };
      
      this.results.push(result);
      return result;
      
    } catch (error) {
      const result: PerformanceTestResult = {
        testName,
        duration: performance.now() - startTime,
        networkRequests: 0,
        cacheHits: 0,
        memoryBefore,
        memoryAfter: memoryBefore,
        renderCount: 0,
        passed: false,
        details: [`Test failed with error: ${error}`]
      };
      
      this.results.push(result);
      return result;
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private countNewRenders(before: any, after: any): number {
    const beforeRenders = before.renderMetrics?.reduce((sum: number, m: any) => sum + m.renderCount, 0) || 0;
    const afterRenders = after.renderMetrics?.reduce((sum: number, m: any) => sum + m.renderCount, 0) || 0;
    return afterRenders - beforeRenders;
  }

  generateReport(): string {
    const report: string[] = [
      '=== Performance Test Report ===',
      `Total Tests: ${this.results.length}`,
      `Passed: ${this.results.filter(r => r.passed).length}`,
      `Failed: ${this.results.filter(r => !r.passed).length}`,
      ''
    ];

    this.results.forEach(result => {
      report.push(`Test: ${result.testName}`);
      report.push(`  Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
      report.push(`  Duration: ${result.duration.toFixed(0)}ms`);
      report.push(`  Network Requests: ${result.networkRequests} (${result.cacheHits} cached)`);
      report.push(`  Memory: ${((result.memoryAfter - result.memoryBefore) / 1024 / 1024).toFixed(2)}MB increase`);
      report.push(`  Renders: ${result.renderCount}`);
      
      if (result.details.length > 0) {
        report.push('  Issues:');
        result.details.forEach(detail => {
          report.push(`    - ${detail}`);
        });
      }
      report.push('');
    });

    return report.join('\n');
  }

  reset() {
    this.results = [];
  }
}

// Predefined test scenarios
export const performanceTests = {
  // Test: Browse companies list
  async testCompaniesListPerformance() {
    const runner = new PerformanceTestRunner();
    
    await runner.runTestScenario(
      'Browse Companies List',
      async () => {
        // Simulate navigation to companies page
        markPerformance('companies-navigation-start');
        // This would be replaced with actual navigation in a real test
        await new Promise(resolve => setTimeout(resolve, 100));
        markPerformance('companies-navigation-end');
        
        // Simulate loading companies
        markPerformance('companies-load-start');
        await new Promise(resolve => setTimeout(resolve, 200));
        markPerformance('companies-load-end');
        
        // Simulate filtering
        markPerformance('companies-filter-start');
        await new Promise(resolve => setTimeout(resolve, 50));
        markPerformance('companies-filter-end');
      },
      {
        maxDuration: 1000,
        maxNetworkRequests: 5,
        minCacheHitRate: 50
      }
    );
    
    return runner.generateReport();
  },

  // Test: Admin managing resources
  async testAdminResourceManagement() {
    const runner = new PerformanceTestRunner();
    
    await runner.runTestScenario(
      'Admin Resource Management',
      async () => {
        // Simulate loading admin panel
        markPerformance('admin-load-start');
        await new Promise(resolve => setTimeout(resolve, 150));
        markPerformance('admin-load-end');
        
        // Simulate loading resources
        markPerformance('resources-load-start');
        await new Promise(resolve => setTimeout(resolve, 300));
        markPerformance('resources-load-end');
        
        // Simulate editing resource
        markPerformance('resource-edit-start');
        await new Promise(resolve => setTimeout(resolve, 100));
        markPerformance('resource-edit-end');
      },
      {
        maxDuration: 1500,
        maxNetworkRequests: 8,
        minCacheHitRate: 60
      }
    );
    
    return runner.generateReport();
  },

  // Test: Gallery photo uploads
  async testGalleryUploadPerformance() {
    const runner = new PerformanceTestRunner();
    
    await runner.runTestScenario(
      'Gallery Photo Upload',
      async () => {
        // Simulate opening upload dialog
        markPerformance('upload-dialog-start');
        await new Promise(resolve => setTimeout(resolve, 50));
        markPerformance('upload-dialog-end');
        
        // Simulate file processing
        markPerformance('file-process-start');
        await new Promise(resolve => setTimeout(resolve, 500));
        markPerformance('file-process-end');
        
        // Simulate upload
        markPerformance('file-upload-start');
        await new Promise(resolve => setTimeout(resolve, 1000));
        markPerformance('file-upload-end');
      },
      {
        maxDuration: 3000,
        maxNetworkRequests: 3,
        maxMemoryIncrease: 50 * 1024 * 1024 // 50MB
      }
    );
    
    return runner.generateReport();
  },

  // Test: Complex filtering operations
  async testComplexFilteringPerformance() {
    const runner = new PerformanceTestRunner();
    
    await runner.runTestScenario(
      'Complex Filtering Operations',
      async () => {
        // Simulate initial data load
        markPerformance('data-load-start');
        await new Promise(resolve => setTimeout(resolve, 200));
        markPerformance('data-load-end');
        
        // Simulate multiple filter applications
        for (let i = 0; i < 5; i++) {
          markPerformance(`filter-${i}-start`);
          await new Promise(resolve => setTimeout(resolve, 50));
          markPerformance(`filter-${i}-end`);
        }
        
        // Simulate sort operation
        markPerformance('sort-start');
        await new Promise(resolve => setTimeout(resolve, 100));
        markPerformance('sort-end');
      },
      {
        maxDuration: 800,
        maxNetworkRequests: 1,
        minCacheHitRate: 80
      }
    );
    
    return runner.generateReport();
  }
};