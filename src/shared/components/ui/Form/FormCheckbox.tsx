import React from 'react';

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label for the checkbox
   */
  label: string;
  /**
   * Helper text to display below the checkbox
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
  /**
   * Optional icon to display next to the label
   */
  icon?: React.ReactNode;
}

/**
 * Standardized checkbox component with consistent styling
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  name,
  label,
  helperText,
  error,
  required = false,
  containerClassName = '',
  className = '',
  checked,
  onChange,
  disabled = false,
  icon,
  ...rest
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 rounded
                    disabled:opacity-70 disabled:cursor-not-allowed
                    ${className}`}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          {...rest}
        />
        <label 
          htmlFor={id} 
          className={`ml-2 flex items-center text-sm text-slate-700 dark:text-slate-300
                    ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {icon && <span className="mr-1.5">{icon}</span>}
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 ml-6">{helperText}</p>
      )}
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-500 ml-6">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormCheckbox;
