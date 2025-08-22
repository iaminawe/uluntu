import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Upload, X, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/EnhancedThemeProvider';

interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  overlayOpacity?: number;
}

interface CarouselHeroProps {
  slides: CarouselSlide[];
  onChange?: (slides: CarouselSlide[]) => void;
  editable?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  height?: string;
}

export default function CarouselHero({
  slides = [],
  onChange,
  editable = false,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  height = '500px'
}: CarouselHeroProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
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
        onChange?.(newSlides);
      } else {
        // Add new slide
        const newSlide: CarouselSlide = {
          id: Date.now().toString(),
          image: imageUrl,
          title: 'New Slide',
          subtitle: 'Add your content here'
        };
        onChange?.([...slides, newSlide]);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateSlide = (slideId: string, updates: Partial<CarouselSlide>) => {
    const newSlides = slides.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    );
    onChange?.(newSlides);
  };

  const deleteSlide = (slideId: string) => {
    const newSlides = slides.filter(slide => slide.id !== slideId);
    onChange?.(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(Math.max(0, newSlides.length - 1));
    }
  };

  const addNewSlide = () => {
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
      title: 'New Slide',
      subtitle: 'Click to edit this slide'
    };
    onChange?.([ ...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const handleDrop = (e: React.DragEvent, slideId?: string) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile, slideId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  if (slides.length === 0 && editable) {
    return (
      <div 
        className={`relative ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg border-2 border-dashed ${isDark ? 'border-slate-600' : 'border-slate-300'} transition-all`}
        style={{ height }}
        onDrop={(e) => handleDrop(e)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Create Your Carousel
            </h3>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              Drag and drop images here or click to upload
            </p>
            <Button onClick={addNewSlide}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Slide
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => handleImageUpload(file));
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg group" style={{ height }}>
      {/* Main Carousel */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
            onDrop={(e) => editable ? handleDrop(e, slide.id) : undefined}
            onDragOver={editable ? handleDragOver : undefined}
            onDragLeave={editable ? handleDragLeave : undefined}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: slide.overlayOpacity || 0.4 }}
            />

            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center text-white px-4">
              <div className="max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl mb-8 drop-shadow-lg opacity-90">
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaText && slide.ctaLink && (
                  <Button
                    as="a"
                    href={slide.ctaLink}
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                  >
                    {slide.ctaText}
                  </Button>
                )}
              </div>
            </div>

            {/* Edit Overlay */}
            {editable && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all opacity-0 group-hover:opacity-100">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingSlide(slide.id)}
                    className="bg-white bg-opacity-90 text-gray-900"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white bg-opacity-90 text-gray-900"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  {slides.length > 1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => deleteSlide(slide.id)}
                      className="bg-red-500 bg-opacity-90 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {dragOver && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-400 border-dashed flex items-center justify-center">
                    <div className="text-white text-xl font-semibold">
                      Drop image to replace
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Add Slide Button */}
      {editable && (
        <button
          onClick={addNewSlide}
          className="absolute top-4 left-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file, currentSlideData?.id);
          }
        }}
      />

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
                      Title
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlide(editingSlide, { title: e.target.value })}
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
                      onChange={(e) => updateSlide(editingSlide, { subtitle: e.target.value })}
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
                      onChange={(e) => updateSlide(editingSlide, { ctaText: e.target.value })}
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
                      onChange={(e) => updateSlide(editingSlide, { ctaLink: e.target.value })}
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
                      onChange={(e) => updateSlide(editingSlide, { overlayOpacity: parseFloat(e.target.value) })}
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
    </div>
  );
}