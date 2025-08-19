import React from 'react';

interface BarChartProps {
  data: number[];
  labels: string[];
  title?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showValues?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  title,
  color = '#3b82f6',
  height = 200,
  showGrid = true,
  showValues = false
}) => {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}
      
      <div className="relative" style={{ height: height + 60 }}>
        {/* Chart container */}
        <div className="relative flex items-end justify-between px-1" style={{ height }}>
          {/* Grid lines */}
          {showGrid && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map(index => (
                <div
                  key={index}
                  className="border-t border-gray-200 dark:border-gray-700"
                  style={{ opacity: index === 0 ? 0 : 1 }}
                />
              ))}
            </div>
          )}
          
          {/* Bars */}
          {data.map((value, index) => {
            const barHeight = ((value - minValue) / range) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center relative group">
                <div
                  className="w-full max-w-12 rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer relative"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    minHeight: value > 0 ? '2px' : '0px'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium">
                      {(() => {
                        const label = labels[index];
                        const currentDate = new Date();
                        
                        try {
                          // Try to detect if it's just a day number and add current month/year
                          if (/^\d{1,2}$/.test(label)) {
                            const day = parseInt(label);
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            return date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          } else if (/^\w{3}\s\d{1,2}$/.test(label)) {
                            // For labels like "Mon 15", add current year
                            const date = new Date(`${label}, ${currentDate.getFullYear()}`);
                            return date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          }
                        } catch (e) {
                          // If parsing fails, use original label
                        }
                        
                        return label;
                      })()} 
                    </div>
                    <div>{value.toLocaleString()}</div>
                  </div>
                  
                  {/* Value on top of bar */}
                  {showValues && value > 0 && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
                      {value}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-1">
          {labels.map((label, index) => (
            <span
              key={index}
              className="text-xs text-gray-600 dark:text-gray-400 text-center flex-1"
              style={{ fontSize: labels.length > 10 ? '10px' : '12px' }}
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

export default BarChart;