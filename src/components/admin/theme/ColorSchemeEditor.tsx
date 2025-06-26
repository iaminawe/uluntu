import React, { useState, useCallback } from 'react';
import { 
  Palette, 
  Pipette, 
  RefreshCw, 
  Copy, 
  Check,
  Info,
  Sparkles
} from 'lucide-react';
import { Theme, ColorPalette } from './types';

interface ColorSchemeEditorProps {
  colors: Theme['colors'];
  onChange: (colors: Partial<Theme['colors']>) => void;
  isDarkMode: boolean;
}

const colorPalettes: ColorPalette[] = [
  {
    name: 'Vibrant Orange',
    colors: {
      primary: '#F97316',
      secondary: '#FED7AA',
      accent: '#FB923C'
    }
  },
  {
    name: 'Professional Blue',
    colors: {
      primary: '#3B82F6',
      secondary: '#DBEAFE',
      accent: '#60A5FA'
    }
  },
  {
    name: 'Nature Green',
    colors: {
      primary: '#10B981',
      secondary: '#D1FAE5',
      accent: '#34D399'
    }
  },
  {
    name: 'Royal Purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EDE9FE',
      accent: '#A78BFA'
    }
  },
  {
    name: 'Elegant Gray',
    colors: {
      primary: '#6B7280',
      secondary: '#F3F4F6',
      accent: '#9CA3AF'
    }
  },
  {
    name: 'Warm Pink',
    colors: {
      primary: '#EC4899',
      secondary: '#FCE7F3',
      accent: '#F472B6'
    }
  }
];

export default function ColorSchemeEditor({ colors, onChange, isDarkMode }: ColorSchemeEditorProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [customPalette, setCustomPalette] = useState<string[]>([]);

  const handleColorChange = useCallback((key: keyof Theme['colors'], value: string) => {
    onChange({ [key]: value });
  }, [onChange]);

  const copyToClipboard = useCallback((color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  }, []);

  const applyPalette = useCallback((palette: ColorPalette) => {
    onChange({
      primary: palette.colors.primary,
      secondary: palette.colors.secondary,
      accent: palette.colors.accent
    });
  }, [onChange]);

  const generateComplementaryColors = useCallback(() => {
    // Simple complementary color generation based on primary color
    const primary = colors.primary;
    const rgb = hexToRgb(primary);
    if (!rgb) return;

    // Generate complementary colors
    const complementary = rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
    const triadic1 = rgbToHex((rgb.r + 120) % 255, (rgb.g + 120) % 255, (rgb.b + 120) % 255);
    const triadic2 = rgbToHex((rgb.r + 240) % 255, (rgb.g + 240) % 255, (rgb.b + 240) % 255);

    onChange({
      secondary: complementary,
      accent: triadic1
    });
  }, [colors.primary, onChange]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const colorGroups = [
    {
      title: 'Brand Colors',
      description: 'Main colors that represent your brand',
      colors: [
        { key: 'primary', label: 'Primary', description: 'Main brand color used for CTAs and important elements' },
        { key: 'secondary', label: 'Secondary', description: 'Supporting color for less prominent elements' },
        { key: 'accent', label: 'Accent', description: 'Highlight color for special elements and hover states' }
      ]
    },
    {
      title: 'UI Colors',
      description: 'Colors for interface elements',
      colors: [
        { key: 'background', label: 'Background', description: 'Main page background color' },
        { key: 'surface', label: 'Surface', description: 'Card and container background color' },
        { key: 'border', label: 'Border', description: 'Default border color for elements' }
      ]
    },
    {
      title: 'Text Colors',
      description: 'Colors for typography',
      colors: [
        { key: 'text', label: 'Text', description: 'Primary text color' }
      ]
    },
    {
      title: 'Status Colors',
      description: 'Colors for system feedback',
      colors: [
        { key: 'error', label: 'Error', description: 'Error messages and destructive actions' },
        { key: 'success', label: 'Success', description: 'Success messages and positive feedback' },
        { key: 'warning', label: 'Warning', description: 'Warning messages and alerts' },
        { key: 'info', label: 'Info', description: 'Informational messages' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Palettes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Quick Color Palettes</h4>
              <p className="text-sm text-gray-500 mt-1">Select a predefined color scheme</p>
            </div>
            <button
              onClick={generateComplementaryColors}
              className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Generate Complementary
            </button>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => applyPalette(palette)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 group-hover:text-orange-700">
                  {palette.name}
                </span>
                <div className="flex space-x-1">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200" 
                    style={{ backgroundColor: palette.colors.primary }} 
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200" 
                    style={{ backgroundColor: palette.colors.secondary }} 
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200" 
                    style={{ backgroundColor: palette.colors.accent }} 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{palette.colors.primary}</span>
                <span>•</span>
                <span>{palette.colors.secondary}</span>
                <span>•</span>
                <span>{palette.colors.accent}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Groups */}
      {colorGroups.map((group) => (
        <div key={group.title} className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">{group.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.colors.map((colorItem) => {
              const colorKey = colorItem.key as keyof Theme['colors'];
              const colorValue = colors[colorKey];
              
              return (
                <div key={colorKey} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {colorItem.label}
                  </label>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={colorValue}
                        onChange={(e) => handleColorChange(colorKey, e.target.value)}
                        className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                      />
                      <Pipette className="absolute top-2 right-1 h-5 w-5 text-white pointer-events-none mix-blend-difference" />
                    </div>
                    
                    <input
                      type="text"
                      value={colorValue}
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                    
                    <button
                      onClick={() => copyToClipboard(colorValue)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Copy color code"
                    >
                      {copiedColor === colorValue ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">{colorItem.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Color Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Live Color Preview</h4>
        
        <div 
          className="rounded-lg p-6 space-y-4"
          style={{ backgroundColor: colors.background }}
        >
          <div 
            className="rounded-lg p-4 shadow-sm"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: colors.text }}
            >
              Sample Card Title
            </h3>
            <p 
              className="mb-4"
              style={{ color: colors.text, opacity: 0.8 }}
            >
              This is a preview of how your color scheme will look in the interface.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button 
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: colors.primary }}
              >
                Primary Button
              </button>
              <button 
                className="px-4 py-2 rounded font-medium"
                style={{ backgroundColor: colors.secondary, color: colors.text }}
              >
                Secondary Button
              </button>
              <button 
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: colors.accent }}
              >
                Accent Button
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div 
              className="rounded p-2 text-white text-sm text-center"
              style={{ backgroundColor: colors.error }}
            >
              Error
            </div>
            <div 
              className="rounded p-2 text-white text-sm text-center"
              style={{ backgroundColor: colors.success }}
            >
              Success
            </div>
            <div 
              className="rounded p-2 text-white text-sm text-center"
              style={{ backgroundColor: colors.warning }}
            >
              Warning
            </div>
            <div 
              className="rounded p-2 text-white text-sm text-center"
              style={{ backgroundColor: colors.info }}
            >
              Info
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Color Accessibility Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Ensure sufficient contrast between text and background colors (WCAG AA requires 4.5:1)</li>
              <li>Don't rely solely on color to convey information</li>
              <li>Test your color scheme with color blindness simulators</li>
              <li>Consider providing a high-contrast theme option</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}