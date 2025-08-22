import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Upload, X, Plus, Settings, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/EnhancedThemeProvider';
import CarouselHero from './index';

interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  overlayOpacity?: number;
}

interface EditableCarouselProps {
  slides: CarouselSlide[];
  onChange: (slides: CarouselSlide[]) => void;
  autoPlay?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  height?: string;
  onSettingsChange?: (settings: any) => void;
}

export default function EditableCarousel({
  slides = [],
  onChange,
  autoPlay = true,
  showDots = true,
  showArrows = true,
  height = '500px',
  onSettingsChange
}: EditableCarouselProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [showCarouselSettings, setShowCarouselSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSlidesChange = (newSlides: CarouselSlide[]) => {
    onChange(newSlides);
  };

  const updateCarouselSettings = (settings: any) => {
    onSettingsChange?.(settings);
  };

  const handleImageUpload = async (file: File, slideId?: string) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      if (slideId) {
        // Update existing slide
        const newSlides = slides.map(slide => 
          slide.id === slideId 
            ? { ...slide, image: imageUrl }
            : slide
        );
        onChange(newSlides);
      } else {
        // Add new slide
        const newSlide: CarouselSlide = {
          id: Date.now().toString(),
          image: imageUrl,
          title: 'New Slide',
          subtitle: 'Add your content here'
        };
        onChange([...slides, newSlide]);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Carousel Settings Panel */}
      <div className={`p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Carousel Settings
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCarouselSettings(!showCarouselSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {showCarouselSettings && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => updateCarouselSettings({ autoPlay: e.target.checked })}
                className="mr-2"
              />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Auto Play</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDots}
                onChange={(e) => updateCarouselSettings({ showDots: e.target.checked })}
                className="mr-2"
              />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Show Dots</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showArrows}
                onChange={(e) => updateCarouselSettings({ showArrows: e.target.checked })}
                className="mr-2"
              />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Show Arrows</span>
            </label>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                Height
              </label>
              <select
                value={height}
                onChange={(e) => updateCarouselSettings({ height: e.target.value })}
                className={`w-full px-2 py-1 text-sm border rounded ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="400px">Small (400px)</option>
                <option value="500px">Medium (500px)</option>
                <option value="600px">Large (600px)</option>
                <option value="100vh">Full Screen</option>
              </select>
            </div>
          </div>
        )}

        {/* Add Slide Button */}
        <Button
          onClick={() => {
            const newSlide: CarouselSlide = {
              id: Date.now().toString(),
              image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
              title: 'New Slide',
              subtitle: 'Click to edit this slide'
            };
            onChange([...slides, newSlide]);
          }}
          variant="ghost"
          className="w-full border border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Slide
        </Button>
      </div>

      {/* Carousel Component */}
      <CarouselHero
        slides={slides}
        onChange={handleSlidesChange}
        autoPlay={autoPlay}
        showDots={showDots}
        showArrows={showArrows}
        height={height}
        editable={true}
      />

      {/* Slides Management */}
      {slides.length > 0 && (
        <div className={`p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`font-medium mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Manage Slides ({slides.length})
          </h3>
          
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
                }`}
              >
                <div 
                  className="w-16 h-10 bg-cover bg-center rounded"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {slide.title}
                  </div>
                  {slide.subtitle && (
                    <div className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {slide.subtitle}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSlide(slide.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newSlides = slides.filter(s => s.id !== slide.id);
                      onChange(newSlides);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide Editor Modal */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-md w-full p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Edit Slide
            </h3>
            
            {(() => {
              const slide = slides.find(s => s.id === editingSlide);
              if (!slide) return null;
              
              return (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Background Image
                    </label>
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400"
                      style={{ backgroundImage: `url(${slide.image})` }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {!slide.image && (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <span className="text-sm text-gray-500">Click to upload</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => {
                        const newSlides = slides.map(s => 
                          s.id === editingSlide 
                            ? { ...s, title: e.target.value }
                            : s
                        );
                        onChange(newSlides);
                      }}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={(e) => {
                        const newSlides = slides.map(s => 
                          s.id === editingSlide 
                            ? { ...s, subtitle: e.target.value }
                            : s
                        );
                        onChange(newSlides);
                      }}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      CTA Text
                    </label>
                    <input
                      type="text"
                      value={slide.ctaText || ''}
                      onChange={(e) => {
                        const newSlides = slides.map(s => 
                          s.id === editingSlide 
                            ? { ...s, ctaText: e.target.value }
                            : s
                        );
                        onChange(newSlides);
                      }}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      CTA Link
                    </label>
                    <input
                      type="url"
                      value={slide.ctaLink || ''}
                      onChange={(e) => {
                        const newSlides = slides.map(s => 
                          s.id === editingSlide 
                            ? { ...s, ctaLink: e.target.value }
                            : s
                        );
                        onChange(newSlides);
                      }}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Overlay Opacity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={slide.overlayOpacity || 0.4}
                      onChange={(e) => {
                        const newSlides = slides.map(s => 
                          s.id === editingSlide 
                            ? { ...s, overlayOpacity: parseFloat(e.target.value) }
                            : s
                        );
                        onChange(newSlides);
                      }}
                      className="w-full"
                    />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {Math.round((slide.overlayOpacity || 0.4) * 100)}%
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => setEditingSlide(null)}
              >
                Cancel
              </Button>
              <Button onClick={() => setEditingSlide(null)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && editingSlide) {
            handleImageUpload(file, editingSlide);
          }
        }}
      />
    </div>
  );
}