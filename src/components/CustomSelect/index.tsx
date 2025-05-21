import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomSelectProps, Option } from './types';

const CustomSelect = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  required = false,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  error
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  // Update the selected label when value changes
  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedLabel(option ? option.label : placeholder);
  }, [value, options, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Create a synthetic event to match the native select onChange
  const handleOptionSelect = (optionValue: string) => {
    // Create a synthetic event that mimics a native select change event
    const syntheticEvent = {
      target: {
        name,
        value: optionValue
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Hidden native select for form submission */}
      <select 
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom select UI */}
      <div 
        ref={selectRef}
        className={`relative ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <div
          className={`flex items-center justify-between w-full px-4 py-2 border rounded-lg
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                     cursor-pointer select-none
                     ${isOpen ? 'border-orange-500 ring-2 ring-orange-500' : 'border-slate-300 dark:border-slate-600'} 
                     ${error ? 'border-red-500 dark:border-red-500' : ''}
                     ${disabled ? 'pointer-events-none' : 'hover:border-orange-400'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={id}
        >
          <span className={`block truncate ${!value ? 'text-slate-500 dark:text-slate-400' : ''}`}>
            {selectedLabel}
          </span>
          <ChevronDown 
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </div>
        
        {isOpen && (
          <ul
            className="absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 
                      border border-slate-300 dark:border-slate-600 shadow-lg"
            role="listbox"
          >
            {options.map(option => (
              <li
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700
                          ${option.value === value ? 'bg-orange-50 dark:bg-slate-600 text-orange-600 dark:text-orange-300' : ''}`}
                onClick={() => handleOptionSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;
