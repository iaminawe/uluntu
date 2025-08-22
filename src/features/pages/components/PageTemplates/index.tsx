import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Layout, 
  Users, 
  Calendar, 
  Briefcase, 
  BookOpen,
  Plus,
  Eye,
  Copy,
  Trash2
} from 'lucide-react';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  blocks: any[];
  usage_count: number;
  is_active: boolean;
}

const defaultTemplates: Omit<PageTemplate, 'id' | 'usage_count'>[] = [
  {
    name: 'Blog Post',
    description: 'A standard blog post layout with title, content, and author info',
    category: 'content',
    is_active: true,
    blocks: [
      { type: 'heading', content: 'Blog Post Title' },
      { type: 'paragraph', content: 'Published on [Date] by [Author]' },
      { type: 'paragraph', content: 'Introduction paragraph that hooks the reader...' },
      { type: 'heading', content: 'Main Section' },
      { type: 'paragraph', content: 'Main content goes here...' },
      { type: 'bulletList', content: 'Key point 1' },
      { type: 'bulletList', content: 'Key point 2' },
      { type: 'bulletList', content: 'Key point 3' },
      { type: 'quote', content: 'An inspiring quote related to the topic' },
      { type: 'heading', content: 'Conclusion' },
      { type: 'paragraph', content: 'Wrap up your thoughts...' }
    ]
  },
  {
    name: 'Landing Page',
    description: 'A conversion-focused landing page with hero, features, and CTA',
    category: 'marketing',
    is_active: true,
    blocks: [
      { type: 'heading', content: 'Welcome to Our Amazing Product' },
      { type: 'paragraph', content: 'The solution you\'ve been looking for...' },
      { type: 'heading', content: 'Key Features' },
      { type: 'bulletList', content: '✨ Feature 1: Amazing capability' },
      { type: 'bulletList', content: '🚀 Feature 2: Lightning fast' },
      { type: 'bulletList', content: '🎯 Feature 3: Precision targeting' },
      { type: 'heading', content: 'What Our Customers Say' },
      { type: 'quote', content: 'This product changed our business!' },
      { type: 'heading', content: 'Get Started Today' },
      { type: 'paragraph', content: 'Join thousands of satisfied customers...' }
    ]
  },
  {
    name: 'Event Page',
    description: 'Event details with date, location, and registration info',
    category: 'events',
    is_active: true,
    blocks: [
      { type: 'heading', content: 'Event Name' },
      { type: 'paragraph', content: '📅 Date: [Event Date]' },
      { type: 'paragraph', content: '📍 Location: [Venue Name]' },
      { type: 'paragraph', content: '🎟️ Tickets: [Price/Availability]' },
      { type: 'heading', content: 'About This Event' },
      { type: 'paragraph', content: 'Event description and what to expect...' },
      { type: 'heading', content: 'Agenda' },
      { type: 'bulletList', content: '9:00 AM - Registration & Coffee' },
      { type: 'bulletList', content: '10:00 AM - Keynote Speaker' },
      { type: 'bulletList', content: '12:00 PM - Lunch Break' },
      { type: 'bulletList', content: '2:00 PM - Workshop Sessions' },
      { type: 'heading', content: 'Register Now' },
      { type: 'paragraph', content: 'Secure your spot today!' }
    ]
  },
  {
    name: 'Team Page',
    description: 'Showcase your team members with bios and roles',
    category: 'about',
    is_active: true,
    blocks: [
      { type: 'heading', content: 'Meet Our Team' },
      { type: 'paragraph', content: 'The passionate people behind our success...' },
      { type: 'heading', content: 'Leadership' },
      { type: 'paragraph', content: '👤 John Doe - CEO & Founder' },
      { type: 'quote', content: 'Building the future, one innovation at a time.' },
      { type: 'paragraph', content: '👤 Jane Smith - CTO' },
      { type: 'quote', content: 'Technology is our canvas for creativity.' },
      { type: 'heading', content: 'Our Values' },
      { type: 'bulletList', content: 'Innovation & Excellence' },
      { type: 'bulletList', content: 'Collaboration & Trust' },
      { type: 'bulletList', content: 'Customer Success' }
    ]
  },
  {
    name: 'Documentation',
    description: 'Technical documentation with code examples',
    category: 'docs',
    is_active: true,
    blocks: [
      { type: 'heading', content: 'Documentation Title' },
      { type: 'paragraph', content: 'Version: 1.0.0 | Last Updated: [Date]' },
      { type: 'heading', content: 'Overview' },
      { type: 'paragraph', content: 'This documentation covers...' },
      { type: 'heading', content: 'Getting Started' },
      { type: 'paragraph', content: 'Follow these steps to begin:' },
      { type: 'bulletList', content: 'Step 1: Install dependencies' },
      { type: 'bulletList', content: 'Step 2: Configure settings' },
      { type: 'bulletList', content: 'Step 3: Run the application' },
      { type: 'heading', content: 'API Reference' },
      { type: 'paragraph', content: 'Detailed API documentation...' },
      { type: 'heading', content: 'Examples' },
      { type: 'paragraph', content: 'Here are some practical examples...' }
    ]
  }
];

const categoryIcons: Record<string, React.ReactNode> = {
  content: <FileText className="h-5 w-5" />,
  marketing: <Layout className="h-5 w-5" />,
  events: <Calendar className="h-5 w-5" />,
  about: <Users className="h-5 w-5" />,
  docs: <BookOpen className="h-5 w-5" />,
  business: <Briefcase className="h-5 w-5" />
};

export default function PageTemplates({ onSelectTemplate }: { onSelectTemplate?: (template: PageTemplate) => void }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['page-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data as PageTemplate[];
    }
  });

  // Initialize default templates
  const initializeTemplates = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('page_templates')
        .insert(
          defaultTemplates.map(template => ({
            ...template,
            id: template.name.toLowerCase().replace(/\s+/g, '-')
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-templates'] });
      toast.success('Templates initialized successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to initialize templates: ' + error.message);
    }
  });

  // Use template
  const useTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      // Increment usage count
      const { error } = await supabase.rpc('increment', {
        table_name: 'page_templates',
        column_name: 'usage_count',
        row_id: templateId
      }).single();

      if (error) throw error;
      
      const template = templates?.find(t => t.id === templateId);
      return template;
    },
    onSuccess: (template) => {
      if (template && onSelectTemplate) {
        onSelectTemplate(template);
        toast.success(`Using "${template.name}" template`);
      }
    }
  });

  const filteredTemplates = templates?.filter(
    t => selectedCategory === 'all' || t.category === selectedCategory
  );

  const categories = ['all', ...Array.from(new Set(templates?.map(t => t.category) || []))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No templates found</p>
        <Button onClick={() => initializeTemplates.mutate()} variant="primary">
          Initialize Default Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category !== 'all' && categoryIcons[category]}
            <span className="capitalize">{category}</span>
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates?.map(template => (
          <div
            key={template.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {categoryIcons[template.category] || <FileText className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Used {template.usage_count} times
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {template.description}
              </p>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => useTemplate.mutate(template.id)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Use Template
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">{previewTemplate.name} Preview</h2>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                {previewTemplate.blocks.map((block: any, index: number) => {
                  const content = typeof block.content === 'string' 
                    ? block.content 
                    : block.content?.text || '';
                  
                  switch (block.type) {
                    case 'heading':
                      return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{content}</h3>;
                    case 'paragraph':
                      return <p key={index} className="mb-3">{content}</p>;
                    case 'bulletList':
                      return (
                        <ul key={index} className="list-disc pl-6 mb-3">
                          <li>{content}</li>
                        </ul>
                      );
                    case 'quote':
                      return (
                        <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-3">
                          {content}
                        </blockquote>
                      );
                    default:
                      return <div key={index}>{content}</div>;
                  }
                })}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  useTemplate.mutate(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
              >
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}