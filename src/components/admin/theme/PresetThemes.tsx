import React, { useState } from 'react';
import { 
  Palette, 
  Check,
  Eye,
  Download,
  Sparkles,
  Briefcase,
  Zap,
  Heart,
  Minimize2
} from 'lucide-react';
import { PresetTheme } from '@/types/theme';
import { presetThemes } from '@/lib/themes/presets';

interface PresetThemesProps {
  onSelectPreset: (preset: PresetTheme) => void;
  currentThemeName?: string;
}

// Map preset themes to categories
const categorizedPresets = presetThemes.map(preset => {
  // Determine category based on theme name
  let category: 'professional' | 'modern' | 'playful' | 'minimal' | 'dark' = 'professional';
  
  if (preset.name.toLowerCase().includes('dark')) {
    category = 'dark';
  } else if (preset.name.toLowerCase().includes('minimal')) {
    category = 'minimal';
  } else if (preset.name.toLowerCase().includes('modern') || preset.name.toLowerCase().includes('purple')) {
    category = 'modern';
  } else if (preset.name.toLowerCase().includes('vibrant')) {
    category = 'playful';
  }
  
  return {
    ...preset,
    category,
    thumbnail: `/themes/${preset.slug}.png`
  };
});

const categoryIcons = {
  professional: Briefcase,
  modern: Zap,
  playful: Heart,
  minimal: Minimize2,
  dark: Sparkles
};

export default function PresetThemes({ onSelectPreset, currentThemeName }: PresetThemesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTheme, setPreviewTheme] = useState<typeof categorizedPresets[0] | null>(null);

  const filteredPresets = selectedCategory === 'all' 
    ? categorizedPresets 
    : categorizedPresets.filter(preset => preset.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Themes', icon: Palette },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'modern', name: 'Modern', icon: Zap },
    { id: 'playful', name: 'Playful', icon: Heart },
    { id: 'minimal', name: 'Minimal', icon: Minimize2 },
    { id: 'dark', name: 'Dark', icon: Sparkles }
  ];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map(preset => {
          const Icon = categoryIcons[preset.category];
          const isActive = currentThemeName === preset.name;
          
          return (
            <div
              key={preset.slug}
              className={`relative rounded-lg border-2 transition-all ${
                isActive 
                  ? 'border-orange-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {isActive && (
                <div className="absolute -top-3 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Active
                </div>
              )}
              
              {/* Preview */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-500" />
                      {preset.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg border"
                    style={{ backgroundColor: preset.configurations.colors.primary }}
                    title="Primary"
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border"
                    style={{ backgroundColor: preset.configurations.colors.secondary }}
                    title="Secondary"
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border"
                    style={{ backgroundColor: preset.configurations.colors.background }}
                    title="Background"
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border"
                    style={{ backgroundColor: preset.configurations.colors.surface }}
                    title="Surface"
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border"
                    style={{ backgroundColor: preset.configurations.colors.text }}
                    title="Text"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setPreviewTheme(preset)}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => onSelectPreset(preset)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {isActive ? 'Current' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTheme && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewTheme(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Theme Preview: {previewTheme.name}</h3>
              <button
                onClick={() => setPreviewTheme(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {/* Full theme preview implementation */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(previewTheme.configurations.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div 
                          className="h-16 rounded-lg border"
                          style={{ backgroundColor: value }}
                        />
                        <div className="text-sm">
                          <p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-gray-500">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Typography</h4>
                  <div style={{ fontFamily: previewTheme.configurations.typography.font_family }}>
                    <p className="text-4xl mb-2">The quick brown fox</p>
                    <p className="text-2xl mb-2">jumps over the lazy dog</p>
                    <p className="text-lg mb-2">1234567890 !@#$%^&*()</p>
                    <p className="text-base">Regular paragraph text looks like this.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3 justify-end">
              <button
                onClick={() => {
                  onSelectPreset(previewTheme);
                  setPreviewTheme(null);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Apply Theme
              </button>
              <button
                onClick={() => setPreviewTheme(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}