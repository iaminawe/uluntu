import React, { useEffect } from 'react';
import { useComponentPerformance } from '@/hooks/usePerformanceMonitoring';
import { usePerformance } from '@/providers/PerformanceProvider';

/**
 * Example component showing how to implement performance tracking
 */
export function PerformanceTrackedComponent() {
  const { markPerformance, measurePerformance } = usePerformance();
  const { renderCount, markStart, markEnd } = useComponentPerformance('ExampleComponent');

  useEffect(() => {
    // Track component mount
    markPerformance('example-component-mount');

    // Simulate an async operation
    const loadData = async () => {
      markPerformance('data-load-start');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      markPerformance('data-load-end');
      const loadTime = measurePerformance('data-load', 'data-load-start', 'data-load-end');
      
      console.log(`Data loaded in ${loadTime}ms`);
    };

    loadData();

    return () => {
      // Track component unmount
      markPerformance('example-component-unmount');
    };
  }, [markPerformance, measurePerformance]);

  // Track render performance
  useEffect(() => {
    const renderDuration = markEnd();
    if (renderDuration > 16) { // Longer than one frame (60fps)
      console.warn(`Slow render detected: ${renderDuration.toFixed(2)}ms`);
    }
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Performance Tracked Component</h2>
      <div className="text-sm text-gray-600">
        <p>Render count: {renderCount}</p>
        <p>This component tracks its own performance metrics</p>
      </div>
    </div>
  );
}

/**
 * Example of tracking user interactions
 */
export function InteractionTrackingExample() {
  const { markPerformance, measurePerformance } = usePerformance();

  const handleClick = async () => {
    markPerformance('button-click-start');

    try {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 500));
      
      markPerformance('button-click-end');
      const interactionTime = measurePerformance(
        'button-interaction',
        'button-click-start',
        'button-click-end'
      );

      console.log(`Button interaction took ${interactionTime}ms`);
    } catch (error) {
      markPerformance('button-click-error');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Click Me (Performance Tracked)
    </button>
  );
}

/**
 * Example of tracking list rendering performance
 */
export function ListRenderingExample({ items }: { items: any[] }) {
  const { markPerformance, measurePerformance } = usePerformance();
  const { markStart, markEnd } = useComponentPerformance('ListComponent');

  useEffect(() => {
    markStart();
    markPerformance(`list-render-${items.length}-items-start`);

    return () => {
      markPerformance(`list-render-${items.length}-items-end`);
      const renderTime = measurePerformance(
        `list-render-${items.length}`,
        `list-render-${items.length}-items-start`,
        `list-render-${items.length}-items-end`
      );

      if (renderTime && renderTime > 100) {
        console.warn(`List render slow: ${renderTime.toFixed(2)}ms for ${items.length} items`);
      }

      markEnd();
    };
  }, [items.length, markPerformance, measurePerformance, markStart, markEnd]);

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="p-2 border rounded">
          {item.name}
        </li>
      ))}
    </ul>
  );
}