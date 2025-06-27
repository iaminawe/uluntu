import React, { useState, useEffect, useCallback } from 'react';
import { 
  Type, 
  Search, 
  Download, 
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Theme, GoogleFont } from './types';

interface FontSelectorProps {
  typography: Theme['typography'];
  onChange: (typography: Partial<Theme['typography']>) => void;
}

// Popular Google Fonts for quick selection
const popularFonts = [
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Source Code Pro', category: 'monospace' },
  { family: 'Fira Code', category: 'monospace' }
];

const fontCategories = [
  { value: 'all', label: 'All Fonts' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Handwriting' },
  { value: 'monospace', label: 'Monospace' }
];

export default function FontSelector({ typography, onChange }: FontSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');

  // Load Google Fonts API key from environment or use a demo key
  const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY || 'demo-key';

  useEffect(() => {
    // Load the current font
    if (typography.fontFamily && !loadedFonts.has(typography.fontFamily)) {
      loadGoogleFont(typography.fontFamily);
    }
  }, [typography.fontFamily]);

  const loadGoogleFont = useCallback((fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setLoadedFonts(prev => new Set(prev).add(fontFamily));
  }, [loadedFonts]);

  const fetchGoogleFonts = useCallback(async () => {
    if (GOOGLE_FONTS_API_KEY === 'demo-key') {
      // Use popular fonts as fallback when no API key
      setGoogleFonts(popularFonts.map(font => ({
        family: font.family,
        variants: ['regular', '500', '600', '700'],
        subsets: ['latin'],
        category: font.category
      })));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
      );
      
      if (!response.ok) throw new Error('Failed to fetch fonts');
      
      const data = await response.json();
      setGoogleFonts(data.items.slice(0, 100)); // Limit to top 100 fonts
    } catch (err) {
      setError('Failed to load Google Fonts. Using popular fonts instead.');
      setGoogleFonts(popularFonts.map(font => ({
        family: font.family,
        variants: ['regular', '500', '600', '700'],
        subsets: ['latin'],
        category: font.category
      })));
    } finally {
      setLoading(false);
    }
  }, [GOOGLE_FONTS_API_KEY]);

  useEffect(() => {
    fetchGoogleFonts();
  }, [fetchGoogleFonts]);

  const filteredFonts = googleFonts.filter(font => {
    const matchesSearch = font.family.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFontChange = useCallback((fontFamily: string) => {
    loadGoogleFont(fontFamily);
    onChange({ 
      fontFamily,
      fontFallback: `${fontFamily}, system-ui, -apple-system, sans-serif`
    });
  }, [onChange, loadGoogleFont]);

  const handleFontSizeChange = useCallback((size: keyof Theme['typography']['fontSize'], value: string) => {
    onChange({
      fontSize: {
        ...typography.fontSize,
        [size]: value
      }
    });
  }, [typography.fontSize, onChange]);

  const handleFontWeightChange = useCallback((weight: keyof Theme['typography']['fontWeight'], value: number) => {
    onChange({
      fontWeight: {
        ...typography.fontWeight,
        [weight]: value
      }
    });
  }, [typography.fontWeight, onChange]);

  const handleLineHeightChange = useCallback((type: keyof Theme['typography']['lineHeight'], value: number) => {
    onChange({
      lineHeight: {
        ...typography.lineHeight,
        [type]: value
      }
    });
  }, [typography.lineHeight, onChange]);

  return (
    <div className="space-y-6">
      {/* Font Selection */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Font Family</h4>
          <p className="text-sm text-gray-500 mt-1">Choose from Google Fonts library</p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fonts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              {fontCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Font */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Current Font</p>
                <p 
                  className="text-2xl mt-1"
                  style={{ fontFamily: `${typography.fontFamily}, ${typography.fontFallback}` }}
                >
                  {typography.fontFamily}
                </p>
              </div>
              <Check className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          {/* Font Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredFonts.map((font) => (
                <button
                  key={font.family}
                  onClick={() => handleFontChange(font.family)}
                  className={`p-4 text-left border rounded-lg transition-all hover:border-orange-300 hover:bg-orange-50 ${
                    typography.fontFamily === font.family 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200'
                  }`}
                  style={{ fontFamily: loadedFonts.has(font.family) ? font.family : 'inherit' }}
                >
                  <p className="font-medium text-gray-900">{font.family}</p>
                  <p className="text-sm text-gray-500 mt-1">{font.category}</p>
                  <p className="text-lg mt-2" style={{ fontFamily: font.family }}>
                    {previewText}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Preview Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Text
            </label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Enter preview text..."
            />
          </div>
        </div>
      </div>

      {/* Font Sizes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Font Sizes</h4>
          <p className="text-sm text-gray-500 mt-1">Configure text sizes for different elements</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {key.toUpperCase()} ({value})
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleFontSizeChange(key as keyof Theme['typography']['fontSize'], e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="16px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Font Weights</h4>
          <p className="text-sm text-gray-500 mt-1">Set weight values for text emphasis</p>
        </div>
        
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <select
                value={value}
                onChange={(e) => handleFontWeightChange(key as keyof Theme['typography']['fontWeight'], parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="300">300 (Light)</option>
                <option value="400">400 (Regular)</option>
                <option value="500">500 (Medium)</option>
                <option value="600">600 (SemiBold)</option>
                <option value="700">700 (Bold)</option>
                <option value="800">800 (ExtraBold)</option>
                <option value="900">900 (Black)</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Line Heights */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Line Heights</h4>
          <p className="text-sm text-gray-500 mt-1">Control spacing between lines of text</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(typography.lineHeight).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleLineHeightChange(key as keyof Theme['typography']['lineHeight'], parseFloat(e.target.value))}
                step="0.05"
                min="1"
                max="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Typography Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Typography Preview</h4>
        
        <div 
          className="space-y-4"
          style={{ fontFamily: `${typography.fontFamily}, ${typography.fontFallback}` }}
        >
          <div style={{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>
            Heading 1 - {typography.fontSize['4xl']}
          </div>
          <div style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.semibold, lineHeight: typography.lineHeight.tight }}>
            Heading 2 - {typography.fontSize['3xl']}
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.semibold, lineHeight: typography.lineHeight.normal }}>
            Heading 3 - {typography.fontSize['2xl']}
          </div>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.medium, lineHeight: typography.lineHeight.normal }}>
            Heading 4 - {typography.fontSize.xl}
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, lineHeight: typography.lineHeight.normal }}>
            Heading 5 - {typography.fontSize.lg}
          </div>
          <p style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.normal, lineHeight: typography.lineHeight.relaxed }}>
            Body text - This is how your regular paragraph text will look. {previewText}
          </p>
          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, lineHeight: typography.lineHeight.normal }}>
            Small text - {typography.fontSize.sm}
          </p>
          <p style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.normal, lineHeight: typography.lineHeight.normal }}>
            Extra small text - {typography.fontSize.xs}
          </p>
        </div>
      </div>
    </div>
  );
}