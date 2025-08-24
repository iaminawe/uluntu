import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Type, 
  Image, 
  Layout, 
  BarChart3, 
  Calendar, 
  Building2,
  Users,
  Mail,
  Star,
  Zap,
  Plus,
  Settings,
  Trash2,
  GripVertical
} from 'lucide-react';

interface ComponentBlock {
  id: string;
  type: string;
  content: string;
  metadata?: {
    // Basic styling
    style?: string;
    subtitle?: string;
    cta?: boolean;
    description?: string;
    icon?: string;
    columns?: number;
    // Carousel specific
    slides?: Array<{
      id: string;
      image: string;
      title: string;
      subtitle: string;
      ctaText: string;
      ctaLink: string;
    }>;
    autoPlay?: boolean;
    showDots?: boolean;
    showArrows?: boolean;
    // Image specific
    src?: string;
    alt?: string;
    alignment?: string;
    width?: string;
    caption?: boolean;
    // Video specific
    type?: string;
    controls?: boolean;
    muted?: boolean;
    // Columns specific
    columnCount?: number;
    gap?: string;
    // Column layout data
    height?: string;
  };
}

interface ComponentBlockEditorProps {
  content: ComponentBlock[];
  onChange: (content: ComponentBlock[]) => void;
  editable?: boolean;
}

const blockTypes = [
  { 
    type: 'hero', 
    label: 'Hero Section', 
    icon: <Layout className="h-4 w-4" />,
    description: 'Eye-catching hero with CTA buttons'
  },
  { 
    type: 'carousel', 
    label: 'Carousel Hero', 
    icon: <Image className="h-4 w-4" />,
    description: 'Image carousel with controls and upload'
  },
  { 
    type: 'image', 
    label: 'Image', 
    icon: <Image className="h-4 w-4" />,
    description: 'Single image with caption and styling'
  },
  { 
    type: 'video', 
    label: 'Video', 
    icon: <Users className="h-4 w-4" />,
    description: 'Embedded video player with controls'
  },
  { 
    type: 'columns', 
    label: 'Columns Layout', 
    icon: <Layout className="h-4 w-4" />,
    description: 'Multi-column layout container'
  },
  { 
    type: 'features', 
    label: 'Features Grid', 
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Grid of features with icons'
  },
  { 
    type: 'stats', 
    label: 'Statistics', 
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Community stats and metrics'
  },
  { 
    type: 'events', 
    label: 'Events List', 
    icon: <Calendar className="h-4 w-4" />,
    description: 'Live events from database'
  },
  { 
    type: 'companies', 
    label: 'Companies', 
    icon: <Building2 className="h-4 w-4" />,
    description: 'Featured company logos'
  },
  { 
    type: 'values', 
    label: 'Values', 
    icon: <Star className="h-4 w-4" />,
    description: 'Organization values with icons'
  },
  { 
    type: 'contact', 
    label: 'Contact Form', 
    icon: <Mail className="h-4 w-4" />,
    description: 'Contact info and form'
  },
  { 
    type: 'cta', 
    label: 'Call to Action', 
    icon: <Zap className="h-4 w-4" />,
    description: 'Conversion-focused CTA section'
  },
  { 
    type: 'heading', 
    label: 'Heading', 
    icon: <Type className="h-4 w-4" />,
    description: 'Section heading'
  },
  { 
    type: 'paragraph', 
    label: 'Paragraph', 
    icon: <Type className="h-4 w-4" />,
    description: 'Text content'
  },
  { 
    type: 'bulletList', 
    label: 'Bullet List', 
    icon: <Type className="h-4 w-4" />,
    description: 'List item'
  },
  { 
    type: 'quote', 
    label: 'Quote', 
    icon: <Type className="h-4 w-4" />,
    description: 'Highlighted quote'
  }
];

export default function ComponentBlockEditor({ content, onChange, editable = true }: ComponentBlockEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  const addBlock = (type: string, index?: number) => {
    const newBlock: ComponentBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      metadata: getDefaultMetadata(type)
    };

    const newContent = [...content];
    if (index !== undefined) {
      newContent.splice(index + 1, 0, newBlock);
    } else {
      newContent.push(newBlock);
    }

    onChange(newContent);
    setShowBlockPicker(false);
    setEditingBlock(newBlock.id);
  };

  const updateBlock = useCallback((index: number, updates: Partial<ComponentBlock>) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], ...updates };
    onChange(newContent);
  }, [content, onChange]);

  const deleteBlock = (index: number) => {
    const newContent = content.filter((_, i) => i !== index);
    onChange(newContent);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newContent = [...content];
    const [moved] = newContent.splice(fromIndex, 1);
    newContent.splice(toIndex, 0, moved);
    onChange(newContent);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveBlock(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  function getDefaultContent(type: string): string {
    switch (type) {
      case 'hero': return 'Welcome to Our Platform';
      case 'carousel': return 'Image Carousel';
      case 'image': return 'Image Caption';
      case 'video': return 'Video Title';
      case 'columns': return 'Column Layout';
      case 'features': return 'Key Features';
      case 'stats': return 'Our Growth';
      case 'events': return 'Upcoming Events';
      case 'companies': return 'Our Partners';
      case 'values': return 'Our Values';
      case 'contact': return 'Get in Touch';
      case 'cta': return 'Ready to Get Started?';
      case 'heading': return 'Section Heading';
      case 'paragraph': return 'Add your content here...';
      case 'bulletList': return 'List item';
      case 'quote': return 'Inspiring quote goes here';
      default: return 'Content';
    }
  }

  function getDefaultMetadata(type: string) {
    switch (type) {
      case 'hero':
        return { 
          subtitle: 'Discover amazing possibilities with our platform',
          cta: true 
        };
      case 'carousel':
        return {
          slides: [
            {
              id: '1',
              image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
              title: 'Welcome to Our Platform',
              subtitle: 'Discover amazing possibilities',
              ctaText: 'Get Started',
              ctaLink: '#'
            },
            {
              id: '2', 
              image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop',
              title: 'Powerful Features',
              subtitle: 'Everything you need to succeed',
              ctaText: 'Learn More',
              ctaLink: '#features'
            }
          ],
          autoPlay: true,
          showDots: true,
          showArrows: true
        };
      case 'image':
        return {
          src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
          alt: 'Beautiful landscape',
          alignment: 'center',
          width: '100%',
          caption: true
        };
      case 'video':
        return {
          src: '',
          type: 'youtube', // youtube, vimeo, mp4
          autoPlay: false,
          controls: true,
          muted: false
        };
      case 'columns':
        return {
          columnCount: 2,
          gap: 'medium',
          columns: [
            { id: '1', blocks: [] },
            { id: '2', blocks: [] }
          ]
        };
      case 'cta':
        return { 
          description: 'Join thousands of satisfied users today' 
        };
      default:
        return {};
    }
  }

  const renderBlockEditor = (block: ComponentBlock, index: number) => {
    const isEditing = editingBlock === block.id;
    const blockType = blockTypes.find(bt => bt.type === block.type);

    return (
      <div
        key={block.id}
        className={`group relative border rounded-lg p-4 mb-4 transition-colors ${
          draggedIndex === index 
            ? 'border-blue-500 opacity-50' 
            : dragOverIndex === index 
              ? 'border-blue-500 border-dashed' 
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
        }`}
        draggable={editable}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
      >
        {/* Block Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="cursor-grab text-slate-400 hover:text-slate-600">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {blockType?.icon}
              {blockType?.label || block.type}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingBlock(isEditing ? null : block.id)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBlockPicker(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteBlock(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Block Content Editor */}
        {isEditing ? (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            {/* Main Content */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {block.type === 'hero' ? 'Main Title' : 
                 block.type === 'heading' ? 'Heading Text' :
                 block.type === 'paragraph' ? 'Paragraph Content' :
                 'Content'}
              </label>
              {block.type === 'paragraph' ? (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter paragraph content..."
                />
              ) : (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder={`Enter ${block.type} content...`}
                />
              )}
            </div>

            {/* Metadata Fields */}
            {block.type === 'hero' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={block.metadata?.subtitle || ''}
                  onChange={(e) => updateBlock(index, { 
                    metadata: { ...block.metadata, subtitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter subtitle..."
                />
              </div>
            )}

            {block.type === 'carousel' && (
              <div className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <strong>Carousel Editor:</strong> Manage slides and settings below.
                </div>
                
                {/* Carousel Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={block.metadata?.autoPlay !== false}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, autoPlay: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Auto Play</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={block.metadata?.showDots !== false}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, showDots: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Show Dots</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={block.metadata?.showArrows !== false}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, showArrows: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Show Arrows</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Height
                    </label>
                    <select
                      value={block.metadata?.height || '500px'}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, height: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="400px">Small (400px)</option>
                      <option value="500px">Medium (500px)</option>
                      <option value="600px">Large (600px)</option>
                      <option value="100vh">Full Screen</option>
                    </select>
                  </div>
                </div>

                {/* Slides Management */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Slides ({(block.metadata?.slides || []).length})
                    </label>
                    <Button
                      size="sm"
                      onClick={() => {
                        const newSlide = {
                          id: Date.now().toString(),
                          image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
                          title: 'New Slide',
                          subtitle: 'Add your content here'
                        };
                        const slides = block.metadata?.slides || [];
                        updateBlock(index, {
                          metadata: { ...block.metadata, slides: [...slides, newSlide] }
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Slide
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(block.metadata?.slides || []).map((slide: any, slideIndex: number) => (
                      <div key={slide.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-16 h-10 bg-cover bg-center rounded border"
                            style={{ backgroundImage: `url(${slide.image})` }}
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => {
                                const slides = [...(block.metadata?.slides || [])];
                                slides[slideIndex] = { ...slides[slideIndex], title: e.target.value };
                                updateBlock(index, {
                                  metadata: { ...block.metadata, slides }
                                });
                              }}
                              placeholder="Slide title"
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            />
                            <input
                              type="text"
                              value={slide.subtitle || ''}
                              onChange={(e) => {
                                const slides = [...(block.metadata?.slides || [])];
                                slides[slideIndex] = { ...slides[slideIndex], subtitle: e.target.value };
                                updateBlock(index, {
                                  metadata: { ...block.metadata, slides }
                                });
                              }}
                              placeholder="Slide subtitle"
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={slide.ctaText || ''}
                                onChange={(e) => {
                                  const slides = [...(block.metadata?.slides || [])];
                                  slides[slideIndex] = { ...slides[slideIndex], ctaText: e.target.value };
                                  updateBlock(index, {
                                    metadata: { ...block.metadata, slides }
                                  });
                                }}
                                placeholder="CTA text"
                                className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              />
                              <input
                                type="text"
                                value={slide.ctaLink || ''}
                                onChange={(e) => {
                                  const slides = [...(block.metadata?.slides || [])];
                                  slides[slideIndex] = { ...slides[slideIndex], ctaLink: e.target.value };
                                  updateBlock(index, {
                                    metadata: { ...block.metadata, slides }
                                  });
                                }}
                                placeholder="CTA link"
                                className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              />
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const slides = (block.metadata?.slides || []).filter((_: any, i: number) => i !== slideIndex);
                              updateBlock(index, {
                                metadata: { ...block.metadata, slides }
                              });
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
              </div>
            )}

            {block.type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={block.metadata?.src || ''}
                    onChange={(e) => updateBlock(index, { 
                      metadata: { ...block.metadata, src: e.target.value }
                    })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={block.metadata?.alt || ''}
                    onChange={(e) => updateBlock(index, { 
                      metadata: { ...block.metadata, alt: e.target.value }
                    })}
                    placeholder="Description of the image"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Alignment
                    </label>
                    <select
                      value={block.metadata?.alignment || 'center'}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, alignment: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Width
                    </label>
                    <select
                      value={block.metadata?.width || '100%'}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, width: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="50%">50%</option>
                      <option value="75%">75%</option>
                      <option value="100%">100%</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={block.metadata?.caption !== false}
                    onChange={(e) => updateBlock(index, { 
                      metadata: { ...block.metadata, caption: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Show Caption</span>
                </label>
              </div>
            )}

            {block.type === 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Video URL or Embed Code
                  </label>
                  <textarea
                    value={block.metadata?.src || ''}
                    onChange={(e) => updateBlock(index, { 
                      metadata: { ...block.metadata, src: e.target.value }
                    })}
                    placeholder="YouTube URL, Vimeo URL, or embed code"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Video Type
                  </label>
                  <select
                    value={block.metadata?.type || 'youtube'}
                    onChange={(e) => updateBlock(index, { 
                      metadata: { ...block.metadata, type: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="mp4">MP4 File</option>
                    <option value="embed">Custom Embed</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={block.metadata?.autoPlay || false}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, autoPlay: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Auto Play</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={block.metadata?.controls !== false}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, controls: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Show Controls</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={block.metadata?.muted || false}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, muted: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Muted</span>
                  </label>
                </div>
              </div>
            )}

            {block.type === 'columns' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Number of Columns
                    </label>
                    <select
                      value={block.metadata?.columnCount || 2}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        const columns = Array.from({ length: count }, (_, i) => ({
                          id: (i + 1).toString(),
                          blocks: block.metadata?.columns?.[i]?.blocks || []
                        }));
                        updateBlock(index, { 
                          metadata: { ...block.metadata, columnCount: count, columns }
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                      <option value={4}>4 Columns</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Gap Size
                    </label>
                    <select
                      value={block.metadata?.gap || 'medium'}
                      onChange={(e) => updateBlock(index, { 
                        metadata: { ...block.metadata, gap: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <strong>Note:</strong> Column content editing will be available in the rendered view. Each column can contain nested blocks.
                </div>
              </div>
            )}

            {block.type === 'cta' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={block.metadata?.description || ''}
                  onChange={(e) => updateBlock(index, { 
                    metadata: { ...block.metadata, description: e.target.value }
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter description..."
                />
              </div>
            )}

            {/* Heading Size Options */}
            {block.type === 'heading' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Heading Size
                </label>
                <select
                  value={block.metadata?.level || 'h2'}
                  onChange={(e) => updateBlock(index, { 
                    metadata: { ...block.metadata, level: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="h1">H1 - Large Title</option>
                  <option value="h2">H2 - Section Heading</option>
                  <option value="h3">H3 - Subsection</option>
                  <option value="h4">H4 - Small Heading</option>
                </select>
              </div>
            )}

            {/* Paragraph Size Options */}
            {block.type === 'paragraph' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Text Size
                </label>
                <select
                  value={block.metadata?.size || 'base'}
                  onChange={(e) => updateBlock(index, { 
                    metadata: { ...block.metadata, size: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="sm">Small</option>
                  <option value="base">Normal</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
            )}

            {/* Quote Style Options */}
            {block.type === 'quote' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quote Style
                </label>
                <select
                  value={block.metadata?.style || 'default'}
                  onChange={(e) => updateBlock(index, { 
                    metadata: { ...block.metadata, style: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="default">Default</option>
                  <option value="bordered">Bordered</option>
                  <option value="highlighted">Highlighted</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            )}

            {/* General Style Options for Complex Components */}
            {['hero', 'features', 'stats', 'cta'].includes(block.type) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Style
                </label>
                <select
                  value={block.metadata?.style || 'default'}
                  onChange={(e) => updateBlock(index, { 
                    metadata: { ...block.metadata, style: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="default">Default</option>
                  <option value="gradient">Gradient Background</option>
                  <option value="highlight">Highlighted</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setEditingBlock(null)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Block Preview */
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            {block.type === 'carousel' ? (
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <strong>{block.content}</strong>
                </div>
                <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-6 text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    📸 Carousel Hero Component
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {block.metadata?.slides?.length || 0} slide(s) • 
                    {block.metadata?.autoPlay ? ' Auto-play' : ' Manual'} • 
                    Height: {block.metadata?.height || '500px'}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Click settings to configure carousel • {blockType?.description}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>{block.content}</strong>
                  {block.metadata?.subtitle && (
                    <div className="text-xs mt-1 opacity-75">{block.metadata.subtitle}</div>
                  )}
                  {block.metadata?.description && (
                    <div className="text-xs mt-1 opacity-75">{block.metadata.description}</div>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Click settings to edit • {blockType?.description}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Blocks */}
      {content.map((block, index) => (
        <div key={block.id || `block-${index}`}>
          {renderBlockEditor(block, index)}
        </div>
      ))}

      {/* Add Block Button */}
      <div className="text-center py-8">
        <Button 
          onClick={() => setShowBlockPicker(true)}
          variant="ghost"
          className="border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Component Block
        </Button>
      </div>

      {/* Block Picker Modal */}
      {showBlockPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Choose a Block Type</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {blockTypes.map((blockType) => (
                  <button
                    key={blockType.type}
                    onClick={() => addBlock(blockType.type)}
                    className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                      {blockType.icon}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {blockType.label}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {blockType.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowBlockPicker(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}