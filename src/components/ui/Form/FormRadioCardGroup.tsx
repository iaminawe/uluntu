import React from 'react';

export interface RadioOption {
  /**
   * Value of the radio option
   */
  value: string;
  /**
   * Label text to display
   */
  label: string;
  /**
   * Optional icon to display
   */
  icon?: React.ReactNode;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Optional color for the icon (e.g., 'text-green-500')
   */
  iconColor?: string;
}

export interface FormRadioCardGroupProps {
  /**
   * ID for the radio group
   */
  id: string;
  /**
   * Name for the radio group
   */
  name: string;
  /**
   * Current selected value
   */
  value: string;
  /**
   * Callback when selection changes
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Array of radio options
   */
  options: RadioOption[];
  /**
   * Label for the radio group
   */
  label?: string;
  /**
   * Helper text to display below the radio group
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Column configuration for responsive layout
   */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
  /**
   * Whether to show a more compact version
   */
  compact?: boolean;
}

/**
 * Component for visually appealing radio button groups with cards
 */
export const FormRadioCardGroup: React.FC<FormRadioCardGroupProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  helperText,
  error,
  required = false,
  columns = { sm: 1, md: 2, lg: 3 },
  containerClassName = '',
  compact = false,
}) => {
  // Create column classes for the grid
  const columnClasses = [
    `grid-cols-1`,
    columns.sm ? `sm:grid-cols-${columns.sm}` : '',
    columns.md ? `md:grid-cols-${columns.md}` : '',
    columns.lg ? `lg:grid-cols-${columns.lg}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className={`grid ${columnClasses} gap-3`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`relative ${compact ? 'p-3' : 'p-4'} border rounded-lg cursor-pointer
                      flex flex-col items-center text-center gap-2
                      transition-colors
                      ${value === option.value 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <input 
              type="radio" 
              id={`${id}-${option.value}`}
              name={name} 
              value={option.value} 
              checked={value === option.value} 
              onChange={onChange}
              className="sr-only"
              aria-describedby={error ? `${id}-error` : undefined}
              required={required}
            />
            
            {option.icon && (
              <div className={option.iconColor || 'text-slate-700 dark:text-slate-300'}>
                {option.icon}
              </div>
            )}
            
            <div>
              <span className={`block text-slate-900 dark:text-white ${option.description ? 'font-medium' : ''}`}>
                {option.label}
              </span>
              
              {option.description && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormRadioCardGroup;
