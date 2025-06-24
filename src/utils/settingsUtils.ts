import type {
  SettingDataType,
  SettingValidationRule,
  SettingValidationResult,
  ApplicationSetting,
  PublicSettings,
} from '@/types/settings';

/**
 * Validate a setting value based on its data type and rules
 */
export function validateSettingValue(
  value: any,
  dataType: SettingDataType,
  rules?: SettingValidationRule[]
): SettingValidationResult {
  const errors: string[] = [];

  // Type validation
  switch (dataType) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push('Value must be a string');
      }
      break;
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push('Value must be a valid number');
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push('Value must be true or false');
      }
      break;
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push('Value must be an object');
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        errors.push('Value must be an array');
      }
      break;
  }

  // Apply validation rules
  if (rules && rules.length > 0) {
    rules.forEach(rule => {
      switch (rule.type) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            errors.push(rule.message || 'This field is required');
          }
          break;
        
        case 'min':
          if (typeof value === 'number' && value < (rule.value as number)) {
            errors.push(rule.message || `Value must be at least ${rule.value}`);
          } else if (typeof value === 'string' && value.length < (rule.value as number)) {
            errors.push(rule.message || `Length must be at least ${rule.value} characters`);
          }
          break;
        
        case 'max':
          if (typeof value === 'number' && value > (rule.value as number)) {
            errors.push(rule.message || `Value must be at most ${rule.value}`);
          } else if (typeof value === 'string' && value.length > (rule.value as number)) {
            errors.push(rule.message || `Length must be at most ${rule.value} characters`);
          }
          break;
        
        case 'pattern':
          if (typeof value === 'string' && rule.value) {
            const regex = new RegExp(rule.value as string);
            if (!regex.test(value)) {
              errors.push(rule.message || 'Value does not match required pattern');
            }
          }
          break;
        
        case 'email':
          if (typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(rule.message || 'Invalid email address');
            }
          }
          break;
        
        case 'url':
          if (typeof value === 'string') {
            try {
              new URL(value);
            } catch {
              errors.push(rule.message || 'Invalid URL');
            }
          }
          break;
        
        case 'custom':
          if (rule.validator) {
            const result = rule.validator(value);
            if (typeof result === 'string') {
              errors.push(result);
            } else if (!result) {
              errors.push(rule.message || 'Validation failed');
            }
          }
          break;
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Cast a value to the appropriate type based on data type
 */
export function castValue(value: any, dataType: SettingDataType): any {
  if (value === null || value === undefined) {
    return value;
  }

  switch (dataType) {
    case 'string':
      return String(value);
    
    case 'number':
      const num = Number(value);
      return isNaN(num) ? value : num;
    
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    
    case 'object':
    case 'array':
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    
    default:
      return value;
  }
}

/**
 * Get default value for a data type
 */
export function getDefaultValue(dataType: SettingDataType): any {
  switch (dataType) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'object':
      return {};
    case 'array':
      return [];
    default:
      return null;
  }
}

/**
 * Deep merge settings objects
 */
export function mergeSettings(
  defaults: Partial<PublicSettings>,
  overrides: PublicSettings
): PublicSettings {
  const merged: PublicSettings = {};

  // Add all default categories and settings
  Object.entries(defaults).forEach(([category, categorySettings]) => {
    merged[category] = { ...categorySettings };
  });

  // Override with actual settings
  Object.entries(overrides).forEach(([category, categorySettings]) => {
    if (!merged[category]) {
      merged[category] = {};
    }
    Object.entries(categorySettings).forEach(([key, value]) => {
      merged[category][key] = value;
    });
  });

  return merged;
}

/**
 * Extract public settings from all settings
 */
export function extractPublicSettings(
  settings: ApplicationSetting[]
): PublicSettings {
  const publicSettings: PublicSettings = {};

  settings
    .filter(setting => setting.is_public)
    .forEach(setting => {
      if (!publicSettings[setting.category]) {
        publicSettings[setting.category] = {};
      }
      
      publicSettings[setting.category][setting.setting_key] = {
        value: castValue(setting.setting_value, setting.data_type as SettingDataType),
        type: setting.data_type as SettingDataType,
      };
    });

  return publicSettings;
}

/**
 * Format setting value for display
 */
export function formatSettingValue(value: any, dataType: SettingDataType): string {
  if (value === null || value === undefined) {
    return 'Not set';
  }

  switch (dataType) {
    case 'boolean':
      return value ? 'Enabled' : 'Disabled';
    
    case 'object':
    case 'array':
      return JSON.stringify(value, null, 2);
    
    case 'number':
      return value.toLocaleString();
    
    default:
      return String(value);
  }
}

/**
 * Parse setting value from string input
 */
export function parseSettingInput(input: string, dataType: SettingDataType): any {
  if (!input && dataType !== 'string') {
    return getDefaultValue(dataType);
  }

  switch (dataType) {
    case 'string':
      return input;
    
    case 'number':
      const num = Number(input);
      return isNaN(num) ? 0 : num;
    
    case 'boolean':
      return input.toLowerCase() === 'true' || input === '1';
    
    case 'object':
    case 'array':
      try {
        return JSON.parse(input);
      } catch {
        return dataType === 'array' ? [] : {};
      }
    
    default:
      return input;
  }
}

/**
 * Check if a setting value has changed
 */
export function hasSettingChanged(
  oldValue: any,
  newValue: any,
  dataType: SettingDataType
): boolean {
  const normalizedOld = castValue(oldValue, dataType);
  const normalizedNew = castValue(newValue, dataType);

  if (dataType === 'object' || dataType === 'array') {
    return JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew);
  }

  return normalizedOld !== normalizedNew;
}

/**
 * Create a cache key for settings
 */
export function createSettingsCacheKey(category?: string, key?: string): string {
  const parts = ['settings'];
  if (category) parts.push(category);
  if (key) parts.push(key);
  return parts.join(':');
}

/**
 * Debounce settings updates
 */
export function debounceSettingsUpdate(
  fn: (...args: any[]) => void,
  delay: number = 500
): (...args: any[]) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}