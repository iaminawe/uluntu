import React from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';
import ThemeEditor from './ThemeEditor';

interface ThemeEditorWrapperProps {
  settings: any[];
  onRefresh: () => void;
}

/**
 * Wrapper component to ensure ThemeEditor has access to the theme context
 */
export default function ThemeEditorWrapper({ settings, onRefresh }: ThemeEditorWrapperProps) {
  try {
    // Try to access the theme context
    const themeContext = useTheme();
    
    // If we get here, the context is available
    return <ThemeEditor settings={settings} onRefresh={onRefresh} />;
  } catch (error) {
    // If context is not available, show a helpful error message
    console.error('Theme context error:', error);
    
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Theme System Error</h2>
        <p className="text-red-600">
          The theme system is not properly initialized. Please ensure the EnhancedThemeProvider is wrapping your application.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-red-700">Technical Details</summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </details>
      </div>
    );
  }
}