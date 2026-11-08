import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  Send,
  Clock,
  Plus,
  Trash2,
  GripVertical,
  Type,
  Image,
  Layout,
  List,
  Link2,
  Quote,
  Palette,
  Settings,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Calendar,
  Users,
  Building,
  ShoppingBag,
  FileText,
  Star
} from 'lucide-react';
import { newsletterCampaignApi } from '@/features/newsletter/api/campaigns';
import { NewsletterCampaign, CuratedContent } from '@/types/newsletter';

interface EditorBlock {
  id: string;
  type: 'text' | 'image' | 'events' | 'news' | 'opportunities' | 'marketplace' | 'members' | 'companies' | 'divider' | 'button' | 'social';
  content: any;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontSize?: string;
    fontWeight?: string;
  };
}

const NewsletterEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);

  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editorMode, setEditorMode] = useState<'design' | 'preview'>('design');
  const [campaignSettings, setCampaignSettings] = useState({
    subject: '',
    preheader: '',
    branding: {
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      logo_url: '',
      footer_text: 'Uluntu'
    }
  });

  // Fetch campaign data
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['newsletter-campaign', id],
    queryFn: () => id ? newsletterCampaignApi.getCampaign(id) : null,
    enabled: !!id
  });

  // Save campaign mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (!id) throw new Error('No campaign ID');
      return newsletterCampaignApi.updateCampaign(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaign', id] });
    }
  });

  // Load campaign data into editor
  React.useEffect(() => {
    if (campaign) {
      setCampaignSettings({
        subject: campaign.subject,
        preheader: campaign.template_data?.preheader || '',
        branding: {
          ...campaignSettings.branding,
          ...campaign.branding
        }
      });
      
      // Convert campaign content to editor blocks
      const contentBlocks = convertContentToBlocks(campaign.content);
      setBlocks(contentBlocks);
    }
  }, [campaign]);

  const convertContentToBlocks = (content: CuratedContent): EditorBlock[] => {
    const blocks: EditorBlock[] = [];
    
    // Header block
    blocks.push({
      id: 'header',
      type: 'text',
      content: {
        html: `<h1 style="color: ${campaignSettings.branding.primary_color};">${campaign?.title || 'Newsletter'}</h1>`
      },
      styles: {
        backgroundColor: '#f8fafc',
        padding: '20px',
        textAlign: 'center'
      }
    });

    // Custom message block
    if (campaign?.custom_message) {
      blocks.push({
        id: 'custom-message',
        type: 'text',
        content: {
          html: `<p>${campaign.custom_message}</p>`
        },
        styles: {
          padding: '20px',
          backgroundColor: '#fff'
        }
      });
    }

    // Events block
    if (content.events.length > 0) {
      blocks.push({
        id: 'events',
        type: 'events',
        content: content.events,
        styles: {
          padding: '20px',
          backgroundColor: '#fff'
        }
      });
    }

    // News block
    if (content.news.length > 0) {
      blocks.push({
        id: 'news',
        type: 'news',
        content: content.news,
        styles: {
          padding: '20px',
          backgroundColor: '#f8fafc'
        }
      });
    }

    // Opportunities block
    if (content.opportunities.length > 0) {
      blocks.push({
        id: 'opportunities',
        type: 'opportunities',
        content: content.opportunities,
        styles: {
          padding: '20px',
          backgroundColor: '#fff'
        }
      });
    }

    return blocks;
  };

  const addBlock = (type: EditorBlock['type']) => {
    const newBlock: EditorBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: {
        padding: '20px',
        backgroundColor: '#fff'
      }
    };
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
    setShowBlockLibrary(false);
  };

  const getDefaultContent = (type: EditorBlock['type']) => {
    switch (type) {
      case 'text':
        return { html: '<p>Enter your text here...</p>' };
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'button':
        return { text: 'Click Here', url: '#', style: 'primary' };
      case 'divider':
        return { style: 'solid', color: '#e5e7eb' };
      case 'social':
        return { 
          platforms: [
            { name: 'Facebook', url: '#', icon: 'facebook' },
            { name: 'Twitter', url: '#', icon: 'twitter' },
            { name: 'LinkedIn', url: '#', icon: 'linkedin' }
          ]
        };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, updates: Partial<EditorBlock>) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === blockId);
    if (index === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < blocks.length) {
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleSave = () => {
    const campaignData = {
      subject: campaignSettings.subject,
      template_data: {
        preheader: campaignSettings.preheader,
        blocks: blocks
      },
      branding: campaignSettings.branding
    };
    
    saveMutation.mutate(campaignData);
  };

  const renderBlock = (block: EditorBlock) => {
    const isSelected = selectedBlock === block.id;
    
    return (
      <div
        key={block.id}
        className={`relative group cursor-pointer border-2 transition-colors ${
          isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
        }`}
        style={block.styles}
        onClick={() => setSelectedBlock(block.id)}
      >
        {/* Block Controls */}
        {isSelected && (
          <div className="absolute -top-10 left-0 flex items-center space-x-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, 'up');
              }}
              className="hover:bg-blue-700 px-1 rounded"
            >
              ↑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, 'down');
              }}
              className="hover:bg-blue-700 px-1 rounded"
            >
              ↓
            </button>
            <GripVertical className="w-3 h-3" />
            <span className="capitalize">{block.type}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBlock(block.id);
              }}
              className="hover:bg-red-600 px-1 rounded ml-2"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
        
        {/* Block Content */}
        <div className="min-h-[40px]">
          {renderBlockContent(block)}
        </div>
      </div>
    );
  };

  const renderBlockContent = (block: EditorBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            contentEditable
            dangerouslySetInnerHTML={{ __html: block.content.html }}
            onBlur={(e) => {
              updateBlock(block.id, {
                content: { ...block.content, html: e.currentTarget.innerHTML }
              });
            }}
            className="outline-none"
          />
        );
      
      case 'events':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {block.content.slice(0, 3).map((event: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-600 pl-4">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(event.date).toLocaleDateString()} • {event.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'news':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Latest News
            </h3>
            <div className="space-y-4">
              {block.content.slice(0, 3).map((article: any, index: number) => (
                <div key={index} className="border-l-4 border-green-600 pl-4">
                  <h4 className="font-medium text-gray-900">{article.title}</h4>
                  <p className="text-sm text-gray-600">{article.excerpt}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    By {article.author} • {new Date(article.published_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'opportunities':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-600" />
              Job Opportunities
            </h3>
            <div className="space-y-4">
              {block.content.slice(0, 3).map((job: any, index: number) => (
                <div key={index} className="border-l-4 border-purple-600 pl-4">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {job.location} • {job.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'image':
        return block.content.src ? (
          <div className="text-center">
            <img
              src={block.content.src}
              alt={block.content.alt}
              className="max-w-full h-auto mx-auto"
            />
            {block.content.caption && (
              <p className="text-sm text-gray-600 mt-2">{block.content.caption}</p>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Click to add an image</p>
          </div>
        );
      
      case 'button':
        return (
          <div className="text-center">
            <a
              href={block.content.url}
              className={`inline-block px-6 py-3 rounded-lg font-medium text-white ${
                block.content.style === 'primary' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              {block.content.text}
            </a>
          </div>
        );
      
      case 'divider':
        return (
          <hr
            className="border-0 h-px"
            style={{
              backgroundColor: block.content.color,
              borderStyle: block.content.style
            }}
          />
        );
      
      default:
        return <div className="text-gray-500 italic">Unsupported block type: {block.type}</div>;
    }
  };

  const BlockLibrary = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Add Content Block</h3>
            <button
              onClick={() => setShowBlockLibrary(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { type: 'text', icon: Type, label: 'Text', desc: 'Rich text content' },
              { type: 'image', icon: Image, label: 'Image', desc: 'Photos and graphics' },
              { type: 'events', icon: Calendar, label: 'Events', desc: 'Upcoming events' },
              { type: 'news', icon: FileText, label: 'News', desc: 'Latest articles' },
              { type: 'opportunities', icon: Star, label: 'Jobs', desc: 'Job opportunities' },
              { type: 'marketplace', icon: ShoppingBag, label: 'Marketplace', desc: 'Marketplace items' },
              { type: 'members', icon: Users, label: 'Members', desc: 'Featured members' },
              { type: 'companies', icon: Building, label: 'Companies', desc: 'Company profiles' },
              { type: 'button', icon: Link2, label: 'Button', desc: 'Call-to-action button' },
              { type: 'divider', icon: Layout, label: 'Divider', desc: 'Section separator' },
              { type: 'social', icon: Link2, label: 'Social', desc: 'Social media links' }
            ].map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => addBlock(blockType.type as EditorBlock['type'])}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
              >
                <blockType.icon className="w-8 h-8 text-gray-600 mb-2" />
                <h4 className="font-medium text-gray-900">{blockType.label}</h4>
                <p className="text-xs text-gray-600">{blockType.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/newsletter/campaigns')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Campaigns
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Newsletter Editor: {campaign?.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditorMode(editorMode === 'design' ? 'preview' : 'design')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              {editorMode === 'design' ? 'Preview' : 'Design'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Editor Sidebar */}
        {editorMode === 'design' && (
          <div className="flex-none w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Campaign Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Campaign Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={campaignSettings.subject}
                      onChange={(e) => setCampaignSettings({
                        ...campaignSettings,
                        subject: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Preheader Text
                    </label>
                    <input
                      type="text"
                      value={campaignSettings.preheader}
                      onChange={(e) => setCampaignSettings({
                        ...campaignSettings,
                        preheader: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Preview text that appears after subject"
                    />
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Branding</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={campaignSettings.branding.primary_color}
                      onChange={(e) => setCampaignSettings({
                        ...campaignSettings,
                        branding: {
                          ...campaignSettings.branding,
                          primary_color: e.target.value
                        }
                      })}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Add Content */}
              <div>
                <button
                  onClick={() => setShowBlockLibrary(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Content Block
                </button>
              </div>

              {/* Block Properties */}
              {selectedBlock && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Block Properties</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={blocks.find(b => b.id === selectedBlock)?.styles.backgroundColor || '#ffffff'}
                        onChange={(e) => {
                          updateBlock(selectedBlock, {
                            styles: {
                              ...blocks.find(b => b.id === selectedBlock)?.styles,
                              backgroundColor: e.target.value
                            }
                          });
                        }}
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Text Alignment
                      </label>
                      <div className="flex space-x-1">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => {
                              updateBlock(selectedBlock, {
                                styles: {
                                  ...blocks.find(b => b.id === selectedBlock)?.styles,
                                  textAlign: align as 'left' | 'center' | 'right'
                                }
                              });
                            }}
                            className={`px-2 py-1 border rounded text-xs ${
                              blocks.find(b => b.id === selectedBlock)?.styles.textAlign === align
                                ? 'bg-blue-100 border-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {align === 'left' && <AlignLeft className="w-3 h-3" />}
                            {align === 'center' && <AlignCenter className="w-3 h-3" />}
                            {align === 'right' && <AlignRight className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 bg-gray-100 overflow-y-auto">
          <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Email Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="text-sm text-gray-600">
                  <strong>From:</strong> Uluntu &lt;newsletter@example.com&gt;
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Subject:</strong> {campaignSettings.subject || 'Your Newsletter Subject'}
                </div>
                {campaignSettings.preheader && (
                  <div className="text-xs text-gray-500 mt-1">
                    {campaignSettings.preheader}
                  </div>
                )}
              </div>

              {/* Email Content */}
              <div ref={editorRef} className="min-h-[500px]">
                {blocks.map(renderBlock)}
                
                {blocks.length === 0 && (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Layout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Start building your newsletter</p>
                      <button
                        onClick={() => setShowBlockLibrary(true)}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first content block
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t text-center text-xs text-gray-500">
                <p>{campaignSettings.branding.footer_text}</p>
                <p className="mt-1">
                  <a href="#" className="text-blue-600">Unsubscribe</a> | 
                  <a href="#" className="text-blue-600 ml-1">Update Preferences</a> | 
                  <a href="#" className="text-blue-600 ml-1">View in Browser</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Library Modal */}
      {showBlockLibrary && <BlockLibrary />}
    </div>
  );
};

export default NewsletterEditor;