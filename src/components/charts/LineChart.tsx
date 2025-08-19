import React, { useState, useRef } from 'react';

interface LineChartProps {
  data: number[];
  labels: string[];
  title?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  value: number;
  label: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  title,
  color = '#3b82f6',
  height = 200,
  showGrid = true,
  showTooltip = true
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    label: ''
  });
  const chartRef = useRef<HTMLDivElement>(null);
  
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;
  
  // Calculate SVG path
  const pathData = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Calculate points for hover detection
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - ((value - minValue) / range) * 100,
    value,
    label: labels[index]
  }));

  const handlePointMouseEnter = (point: typeof points[0]) => {
    if (!showTooltip || !chartRef.current) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = (point.x / 100) * rect.width;
    const y = (point.y / 100) * rect.height;
    
    // Parse the date from label and create full date string with month name
    const currentDate = new Date();
    let fullDateLabel = point.label;
    
    try {
      // Try to detect if it's just a day number and add current month/year
      if (/^\d{1,2}$/.test(point.label)) {
        const day = parseInt(point.label);
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        fullDateLabel = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      } else if (/^\w{3}\s\d{1,2}$/.test(point.label)) {
        // For labels like "Mon 15", add current year
        const date = new Date(`${point.label}, ${currentDate.getFullYear()}`);
        fullDateLabel = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      // If parsing fails, use original label
      fullDateLabel = point.label;
    }
    
    setTooltip({
      visible: true,
      x: x + rect.left,
      y: y + rect.top - 40, // Position above the point
      value: point.value,
      label: fullDateLabel
    });
  };

  const handlePointMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}
      
      <div className="relative" style={{ height: height + 60 }}>        
        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="fixed z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded px-2 py-1 pointer-events-none shadow-lg whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-medium">{tooltip.label}</div>
            <div>{tooltip.value.toLocaleString()}</div>
          </div>
        )}
        
        {/* Chart container */}
        <div ref={chartRef} className="relative" style={{ height }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            className="overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {showGrid && (
              <g className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="0.5" fill="none">
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} />
                ))}
                {/* Vertical grid lines */}
                {labels.map((_, index) => {
                  const x = (index / (labels.length - 1)) * 100;
                  return <line key={index} x1={x} y1="0" x2={x} y2="100" />;
                })}
              </g>
            )}
            
            {/* Area fill */}
            <path
              d={`${pathData} L 100 100 L 0 100 Z`}
              fill={color}
              fillOpacity="0.1"
            />
            
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          
          {/* HTML-based data points for perfect circles */}
          {points.map((point, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Hover area */}
              <div
                className="absolute inset-0 cursor-pointer"
                style={{
                  width: '16px',
                  height: '16px',
                  left: '-8px',
                  top: '-8px'
                }}
                onMouseEnter={() => handlePointMouseEnter(point)}
                onMouseLeave={handlePointMouseLeave}
              />
              {/* Visible dot */}
              <div
                className="pointer-events-none"
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  filter: tooltip.visible && tooltip.label === point.label && tooltip.value === point.value 
                    ? 'brightness(1.2)' 
                    : 'none'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-1">
          {labels.map((label, index) => (
            <span
              key={index}
              className="text-xs text-gray-600 dark:text-gray-400 text-center"
              style={{ 
                width: `${100 / labels.length}%`,
                fontSize: labels.length > 10 ? '10px' : '12px'
              }}
            >
              {label}
            </span>
          ))}
        </div>
        
        {/* Y-axis indicators */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-1 -ml-12">
          {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), minValue].map((value, index) => (
            <span key={index} className="text-xs text-gray-600 dark:text-gray-400">
              {value.toLocaleString()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LineChart;