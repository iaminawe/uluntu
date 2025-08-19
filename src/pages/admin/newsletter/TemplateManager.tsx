import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Calendar,
  FileText,
  Layout,
  Palette,
  Settings,
  Code,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { NewsletterTemplate } from '@/types/newsletter';

interface TemplateFilters {
  search?: string;
  type?: 'mjml' | 'react-email' | 'all';
  category?: string;
  is_active?: boolean;
}

const TemplateManager: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<TemplateFilters>({
    type: 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NewsletterTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    type: 'mjml' as 'mjml' | 'react-email',
    category: 'general',
    template_content: '',
    default_settings: {}
  });

  // Mock templates data - replace with actual API call
  const templates: NewsletterTemplate[] = [
    {
      id: '1',
      name: 'Weekly Digest',
      description: 'Clean and professional weekly newsletter template',
      type: 'mjml',
      template_content: '<mjml>...</mjml>',
      default_settings: { primary_color: '#3B82F6' },
      preview_image: '/api/placeholder/400/300',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Event Announcement',
      description: 'Perfect for promoting upcoming events and meetups',
      type: 'mjml',
      template_content: '<mjml>...</mjml>',
      default_settings: { primary_color: '#10B981' },
      preview_image: '/api/placeholder/400/300',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'News Update',
      description: 'Focused on news articles and community updates',
      type: 'react-email',
      template_content: 'export default function...',
      default_settings: { primary_color: '#8B5CF6' },
      preview_image: '/api/placeholder/400/300',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Minimal Clean',
      description: 'Simple, text-focused template for professional communication',
      type: 'mjml',
      template_content: '<mjml>...</mjml>',
      default_settings: { primary_color: '#6B7280' },
      preview_image: '/api/placeholder/400/300',
      is_active: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !template.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && template.type !== filters.type) {
      return false;
    }
    if (filters.is_active !== undefined && template.is_active !== filters.is_active) {
      return false;
    }
    return true;
  });

  const handleCreateTemplate = () => {
    // Mock create operation
    console.log('Creating template:', templateForm);
    setShowCreateModal(false);
    setTemplateForm({
      name: '',
      description: '',
      type: 'mjml',
      category: 'general',
      template_content: '',
      default_settings: {}
    });
  };

  const handleEditTemplate = (template: NewsletterTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      type: template.type,
      category: 'general', // assuming category
      template_content: template.template_content,
      default_settings: template.default_settings || {}
    });
    setShowCodeEditor(true);
  };

  const handleDuplicateTemplate = (template: NewsletterTemplate) => {
    setTemplateForm({
      name: `${template.name} (Copy)`,
      description: template.description,
      type: template.type,
      category: 'general',
      template_content: template.template_content,
      default_settings: template.default_settings || {}
    });
    setShowCreateModal(true);
  };

  const TemplateCard = ({ template }: { template: NewsletterTemplate }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      {/* Preview Image */}
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        {template.preview_image ? (
          <img
            src={template.preview_image}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layout className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 truncate flex-1">{template.name}</h3>
          <div className="flex items-center space-x-1 ml-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              template.type === 'mjml' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {template.type.toUpperCase()}
            </span>
            {!template.is_active && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* Preview logic */}}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditTemplate(template)}
              className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDuplicateTemplate(template)}
              className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Delete logic */}}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <Link
            to={`/admin/newsletter/templates/${template.id}/campaigns/new`}
            className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Use Template
          </Link>
        </div>
      </div>
    </div>
  );

  const TemplateListItem = ({ template }: { template: NewsletterTemplate }) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {template.preview_image ? (
              <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Layout className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                template.type === 'mjml' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {template.type.toUpperCase()}
              </span>
              {!template.is_active && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{template.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Updated {new Date(template.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {/* Preview logic */}}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditTemplate(template)}
            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDuplicateTemplate(template)}
            className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <Link
            to={`/admin/newsletter/templates/${template.id}/campaigns/new`}
            className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Use Template
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Newsletter Templates</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create and manage email templates for your campaigns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {/* Import template logic */}}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filters.type || 'all'}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="mjml">MJML</option>
                <option value="react-email">React Email</option>
              </select>
              
              <select
                value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    is_active: value === 'all' ? undefined : value === 'active'
                  });
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {filteredTemplates.map(template => 
          viewMode === 'grid' 
            ? <TemplateCard key={template.id} template={template} />
            : <TemplateListItem key={template.id} template={template} />
        )}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.type !== 'all' || filters.is_active !== undefined
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first template'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </button>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Template</h3>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type
                  </label>
                  <select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as 'mjml' | 'react-email' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="mjml">MJML</option>
                    <option value="react-email">React Email</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this template is for"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Code
                </label>
                <textarea
                  value={templateForm.template_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, template_content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder={templateForm.type === 'mjml' ? '<mjml>...</mjml>' : 'export default function Template() {...}'}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor Modal */}
      {showCodeEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Template: {selectedTemplate.name}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => {
                    setShowCodeEditor(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex h-[70vh]">
              {/* Code Editor */}
              <div className="flex-1 p-6">
                <textarea
                  value={templateForm.template_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, template_content: e.target.value })}
                  className="w-full h-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                  placeholder={templateForm.type === 'mjml' ? '<mjml>...</mjml>' : 'export default function Template() {...}'}
                />
              </div>
              
              {/* Settings Panel */}
              <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Template Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as 'mjml' | 'react-email' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="mjml">MJML</option>
                      <option value="react-email">React Email</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCodeEditor(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save template logic
                  console.log('Saving template:', templateForm);
                  setShowCodeEditor(false);
                  setSelectedTemplate(null);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;