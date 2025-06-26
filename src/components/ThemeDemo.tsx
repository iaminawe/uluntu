import React from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';

export const ThemeDemo: React.FC = () => {
  const { currentTheme, theme } = useTheme();

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-theme mb-4">Theme Integration Demo</h2>
      
      {/* Color Showcase */}
      <div>
        <h3 className="text-xl font-semibold text-theme mb-4">Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-theme-primary p-4 rounded-theme-md text-white text-center">
            Primary
          </div>
          <div className="bg-theme-secondary p-4 rounded-theme-md text-white text-center">
            Secondary
          </div>
          <div className="bg-theme-surface p-4 rounded-theme-md text-theme border border-theme text-center">
            Surface
          </div>
          <div className="bg-theme-background p-4 rounded-theme-md text-theme border border-theme text-center">
            Background
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-xl font-semibold text-theme mb-4">Typography</h3>
        <div className="space-y-2">
          <p className="text-theme-4xl font-theme-heading">Heading 4XL</p>
          <p className="text-theme-3xl font-theme-heading">Heading 3XL</p>
          <p className="text-theme-2xl font-theme-heading">Heading 2XL</p>
          <p className="text-theme-xl font-theme">Text XL</p>
          <p className="text-theme-lg font-theme">Text Large</p>
          <p className="text-theme-base font-theme">Text Base</p>
          <p className="text-theme-sm font-theme text-theme-muted">Text Small Muted</p>
        </div>
      </div>

      {/* Spacing & Borders */}
      <div>
        <h3 className="text-xl font-semibold text-theme mb-4">Spacing & Borders</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-theme-md">
            <h4 className="font-semibold mb-2">Card with MD Padding</h4>
            <p className="text-theme-muted">Uses theme spacing variables</p>
          </div>
          <div className="bg-theme-surface p-theme-lg rounded-theme-lg border border-theme">
            <h4 className="font-semibold mb-2">Large Rounded Box</h4>
            <p className="text-theme-muted">Uses theme border radius</p>
          </div>
          <div className="bg-theme-primary text-white p-theme-sm rounded-theme-full text-center">
            Fully Rounded
          </div>
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h3 className="text-xl font-semibold text-theme mb-4">Shadows</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-theme-md shadow-theme-sm">
            Small Shadow
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-theme-md shadow-theme-md">
            Medium Shadow
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-theme-md shadow-theme-lg">
            Large Shadow
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-theme-md shadow-theme-xl">
            XL Shadow
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <h3 className="text-xl font-semibold text-theme mb-4">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary px-6 py-2 rounded-theme-md theme-transition">
            Primary Button
          </button>
          <button className="btn-secondary px-6 py-2 rounded-theme-md theme-transition">
            Secondary Button
          </button>
          <button className="bg-theme-surface text-theme border border-theme px-6 py-2 rounded-theme-md theme-transition hover:bg-theme-primary hover:text-white hover:border-transparent">
            Outline Button
          </button>
        </div>
      </div>

      {/* Form Elements */}
      <div>
        <h3 className="text-xl font-semibold text-theme mb-4">Form Elements</h3>
        <div className="max-w-md space-y-4">
          <input
            type="text"
            placeholder="Text input with theme styles"
            className="form-input w-full px-4 py-2 rounded-theme-md theme-transition"
          />
          <textarea
            placeholder="Textarea with theme styles"
            rows={3}
            className="form-input w-full px-4 py-2 rounded-theme-md theme-transition"
          />
          <select className="form-input w-full px-4 py-2 rounded-theme-md theme-transition">
            <option>Select with theme styles</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      </div>

      {/* Theme Info */}
      <div className="bg-theme-surface p-6 rounded-theme-lg border border-theme">
        <h3 className="text-xl font-semibold text-theme mb-4">Current Theme Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Theme Name:</span> {currentTheme?.name || 'Default'}
          </div>
          <div>
            <span className="font-semibold">Mode:</span> {theme === 'dark' ? 'Dark' : 'Light'}
          </div>
          <div>
            <span className="font-semibold">Primary Color:</span> 
            <span className="ml-2 inline-block w-6 h-6 rounded align-middle" style={{backgroundColor: currentTheme?.colors?.primary || '#F97316'}}></span>
          </div>
          <div>
            <span className="font-semibold">Secondary Color:</span> 
            <span className="ml-2 inline-block w-6 h-6 rounded align-middle" style={{backgroundColor: currentTheme?.colors?.secondary || '#1F2937'}}></span>
          </div>
        </div>
      </div>
    </div>
  );
};