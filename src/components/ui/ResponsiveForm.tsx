import React from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Info, 
  AlertCircle, 
  Save,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'color' | 'checkbox' | 'radio' | 'file' | 'url' | 'toggle' | 'range';
  value: any;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // for file inputs
  rows?: number; // for textarea
  section?: string;
  order?: number;
  visible?: boolean;
  onChange?: (value: any) => void;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  collapsed?: boolean;
  fields: FormField[];
  order?: number;
  visible?: boolean;
  className?: string;
}

export interface ResponsiveFormProps {
  title?: string;
  description?: string;
  sections: FormSection[];
  onFieldChange: (fieldId: string, value: any) => void;
  onSave?: () => void;
  onReset?: () => void;
  saveLabel?: string;
  resetLabel?: string;
  loading?: boolean;
  hasChanges?: boolean;
  errors?: Record<string, string>;
  readonly?: boolean;
  className?: string;
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  title,
  description,
  sections,
  onFieldChange,
  onSave,
  onReset,
  saveLabel = 'Save Changes',
  resetLabel = 'Reset',
  loading = false,
  hasChanges = false,
  errors = {},
  readonly = false,
  className = ''
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    new Set(sections.filter(s => s.collapsed).map(s => s.id))
  );
  const [showPasswords, setShowPasswords] = React.useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const togglePasswordVisibility = (fieldId: string) => {
    const newShowPasswords = new Set(showPasswords);
    if (newShowPasswords.has(fieldId)) {
      newShowPasswords.delete(fieldId);
    } else {
      newShowPasswords.add(fieldId);
    }
    setShowPasswords(newShowPasswords);
  };

  const renderField = (field: FormField) => {
    if (field.visible === false) return null;

    const error = errors[field.id];
    const hasError = !!error;
    const isPassword = field.type === 'password';
    const showPassword = showPasswords.has(field.id);

    const baseInputClasses = `
      w-full px-3 py-2 border rounded-lg transition-colors duration-200
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-50 disabled:cursor-not-allowed
      ${hasError 
        ? 'border-red-300 bg-red-50' 
        : 'border-gray-300 hover:border-gray-400'
      }
    `;

    const renderInput = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              id={field.id}
              value={field.value || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || readonly || loading}
              required={field.required}
              rows={field.rows || 4}
              className={baseInputClasses}
            />
          );

        case 'select':
          return (
            <select
              id={field.id}
              value={field.value || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              disabled={field.disabled || readonly || loading}
              required={field.required}
              className={baseInputClasses}
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'color':
          return (
            <div className="flex items-center space-x-3">
              <input
                type="color"
                id={field.id}
                value={field.value || '#000000'}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                disabled={field.disabled || readonly || loading}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={field.value || ''}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || '#000000'}
                disabled={field.disabled || readonly || loading}
                className={`flex-1 ${baseInputClasses}`}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          );

        case 'checkbox':
        case 'toggle':
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                id={field.id}
                checked={field.value || false}
                onChange={(e) => onFieldChange(field.id, e.target.checked)}
                disabled={field.disabled || readonly || loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={field.id} className="ml-2 text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${field.id}-${option.value}`}
                    name={field.id}
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                    disabled={field.disabled || readonly || loading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`${field.id}-${option.value}`} className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );

        case 'range':
          return (
            <div className="space-y-2">
              <input
                type="range"
                id={field.id}
                min={field.min || 0}
                max={field.max || 100}
                step={field.step || 1}
                value={field.value || 0}
                onChange={(e) => onFieldChange(field.id, parseInt(e.target.value))}
                disabled={field.disabled || readonly || loading}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{field.min || 0}</span>
                <span className="font-medium">{field.value || 0}</span>
                <span>{field.max || 100}</span>
              </div>
            </div>
          );

        case 'file':
          return (
            <input
              type="file"
              id={field.id}
              onChange={(e) => onFieldChange(field.id, e.target.files?.[0] || null)}
              disabled={field.disabled || readonly || loading}
              accept={field.accept}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          );

        case 'password':
          return (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id={field.id}
                value={field.value || ''}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                disabled={field.disabled || readonly || loading}
                required={field.required}
                className={`${baseInputClasses} pr-10`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field.id)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          );

        default:
          return (
            <input
              type={field.type}
              id={field.id}
              value={field.value || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || readonly || loading}
              required={field.required}
              min={field.min}
              max={field.max}
              step={field.step}
              className={baseInputClasses}
            />
          );
      }
    };

    return (
      <div key={field.id} className="space-y-2">
        {field.type !== 'checkbox' && field.type !== 'toggle' && (
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {renderInput()}
        
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
        
        {hasError && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  };

  const visibleSections = sections
    .filter(section => section.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || description || hasChanges) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          
          {hasChanges && !readonly && (
            <div className="flex items-center space-x-3">
              {onReset && (
                <button
                  onClick={onReset}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {resetLabel}
                </button>
              )}
              
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saveLabel}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      {visibleSections.map((section) => {
        const Icon = section.icon;
        const isCollapsed = collapsedSections.has(section.id);
        const visibleFields = section.fields
          .filter(field => field.visible !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        return (
          <div key={section.id} className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${section.className || ''}`}>
            {/* Section Header */}
            <div 
              className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {Icon && <Icon className="h-5 w-5 text-gray-600" />}
                  <div>
                    <h4 className="font-medium text-gray-900">{section.title}</h4>
                    {section.description && (
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    )}
                  </div>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Section Content */}
            {!isCollapsed && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleFields.map(renderField)}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Footer with save/reset buttons for mobile */}
      {hasChanges && !readonly && (onSave || onReset) && (
        <div className="sm:hidden bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0 flex space-x-3">
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {resetLabel}
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              <Save className="h-4 w-4 mr-1" />
              {saveLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};