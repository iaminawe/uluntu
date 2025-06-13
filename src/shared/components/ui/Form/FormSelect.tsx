import React from 'react';
import CustomSelect from '@/shared/components/ui/CustomSelect';
import { Option } from '@/shared/components/ui/CustomSelect/types';

export interface FormSelectProps {
  /**
   * ID for the select field
   */
  id: string;
  /**
   * Name for the select field
   */
  name: string;
  /**
   * Current selected value
   */
  value: string;
  /**
   * Callback when selection changes
   */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Array of options for the select
   */
  options: Option[];
  /**
   * Label for the select field
   */
  label?: string;
  /**
   * Helper text to display below the select
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
   * Select placeholder text
   */
  placeholder?: string;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
  /**
   * Additional CSS classes for the select
   */
  className?: string;
}

/**
 * Standardized select dropdown component using CustomSelect
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  helperText,
  error,
  required = false,
  placeholder = 'Select an option',
  disabled = false,
  containerClassName = '',
  className = '',
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <CustomSelect
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        error={error}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

export default FormSelect;
