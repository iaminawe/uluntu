import React from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';

const SimpleThemeConfigPage: React.FC = () => {
  // First, let's try rendering without using any hooks
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Theme Configuration
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Theme System Status</h2>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Checking theme provider availability...
          </p>
          
          {/* Now let's try to use the theme hook */}
          <ThemeStatus />
        </div>
      </div>
    </div>
  );
};

// Separate component to test theme hook
const ThemeStatus: React.FC = () => {
  try {
    const themeContext = useTheme();
    
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800">✓ Theme provider is available</p>
        <p className="text-sm text-green-600 mt-1">
          Current theme: {themeContext.currentTheme?.name || 'None'}
        </p>
        <p className="text-sm text-green-600">
          Total themes: {themeContext.themes.length}
        </p>
        <p className="text-sm text-green-600">
          Loading: {themeContext.loading ? 'Yes' : 'No'}
        </p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">✗ Theme provider error</p>
        <p className="text-sm text-red-600 mt-1">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <p className="text-xs text-red-500 mt-2">
          This usually means the EnhancedThemeProvider is not wrapping this component.
        </p>
      </div>
    );
  }
};

export default SimpleThemeConfigPage;