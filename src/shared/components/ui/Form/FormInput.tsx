import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label for the input field
   */
  label?: string;
  /**
   * Helper text to display below the input
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
   * Additional CSS classes for the container
   */
  containerClassName?: string;
}

/**
 * Standardized text input component with consistent styling
 */
export const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  label,
  helperText,
  error,
  required = false,
  containerClassName = '',
  className = '',
  onChange,
  ...rest
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        id={id}
        name={name}
        onChange={(e) => {
          onChange?.(e);
        }}
        className={`w-full px-3 py-2 border rounded-lg transition-colors
                 text-slate-900 dark:text-white bg-white dark:bg-slate-800
                 border-slate-300 dark:border-slate-600
                 focus:border-orange-500 focus:ring focus:ring-orange-200 dark:focus:ring-orange-900/30 focus:ring-opacity-50
                 disabled:opacity-70 disabled:cursor-not-allowed
                 ${error ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                 ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      
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

export default FormInput;
