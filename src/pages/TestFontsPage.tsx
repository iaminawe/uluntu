import React from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';

export default function TestFontsPage() {
  const { currentTheme, themes } = useTheme();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Font Test Page</h1>
      <h2 className="text-3xl font-semibold mb-4">Current Theme: {currentTheme?.name || 'None'}</h2>
      
      <div className="space-y-4 mb-8">
        <p className="text-lg">
          Current Font Family: <code className="bg-gray-100 px-2 py-1 rounded">{currentTheme?.typography?.font_family || 'Not set'}</code>
        </p>
        <p className="text-lg">
          Body Font Family (computed): <code className="bg-gray-100 px-2 py-1 rounded">{window.getComputedStyle(document.body).fontFamily}</code>
        </p>
        <p className="text-lg">
          CSS Variable --theme-font-family: <code className="bg-gray-100 px-2 py-1 rounded">{getComputedStyle(document.documentElement).getPropertyValue('--theme-font-family')}</code>
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold mb-2">Font Preview</h3>
          <p className="text-base">This is regular body text using the theme font.</p>
          <p className="text-sm">This is small text.</p>
          <p className="text-lg">This is large text.</p>
          <p className="text-xl">This is extra large text.</p>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold mb-2">Font Weights</h3>
          <p className="font-light">Light (300)</p>
          <p className="font-normal">Normal (400)</p>
          <p className="font-medium">Medium (500)</p>
          <p className="font-semibold">Semibold (600)</p>
          <p className="font-bold">Bold (700)</p>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold mb-2">Sample Text</h3>
          <p className="text-lg leading-relaxed">
            The quick brown fox jumps over the lazy dog. This pangram contains all letters of the alphabet
            and is commonly used to test fonts and typography settings.
          </p>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold mb-2">Available Themes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map(theme => (
              <div key={theme.id} className="border p-4 rounded">
                <h4 className="font-medium">{theme.name}</h4>
                <p className="text-sm text-gray-600">
                  Font: {theme.typography?.font_family || 'Not set'}
                </p>
                <p className="text-sm text-gray-600">
                  Active: {theme.is_active ? 'Yes' : 'No'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}