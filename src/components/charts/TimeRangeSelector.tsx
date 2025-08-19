import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export interface TimeRangeValue {
  type: 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

interface TimeRangeSelectorProps {
  value: TimeRangeValue;
  onChange: (range: TimeRangeValue) => void;
  className?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(
    value.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    value.endDate || new Date().toISOString().split('T')[0]
  );
  const datePickerRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: 'week' as const, label: 'Past Week' },
    { value: 'month' as const, label: 'Past Month' },
    { value: 'year' as const, label: 'Past Year' },
    { value: 'custom' as const, label: 'Custom' }
  ];

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: 'week' | 'month' | 'year' | 'custom') => {
    if (optionValue === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      onChange({ type: optionValue });
    }
  };

  const handleApplyCustomRange = () => {
    if (startDate && endDate && startDate <= endDate) {
      onChange({
        type: 'custom',
        startDate,
        endDate
      });
      setShowDatePicker(false);
    }
  };

  const formatCustomLabel = () => {
    if (value.type === 'custom' && value.startDate && value.endDate) {
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (start.getFullYear() !== end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      
      return `${startFormatted} - ${endFormatted}`;
    }
    return 'Custom';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {options.map((option) => {
          const isActive = value.type === option.value;
          const label = option.value === 'custom' ? formatCustomLabel() : option.label;
          
          return (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {option.value === 'custom' && (
                <Calendar className="w-3 h-3 mr-1 inline" />
              )}
              {label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker */}
      {showDatePicker && (
        <div 
          ref={datePickerRef}
          className="absolute top-full mt-2 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[300px]"
        >
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Select Date Range</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomRange}
                disabled={!startDate || !endDate || startDate > endDate}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;