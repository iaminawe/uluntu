import React, { useState, useEffect } from 'react';
import { Topic, TopicFormData } from '@/types/topic';
import { X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface TopicEditorProps {
  topic?: Topic | null;
  onSave: (data: TopicFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Popular icon suggestions for topics
const popularIcons = [
  'Tag', 'Hash', 'Folder', 'FileText', 'Briefcase', 'Code', 'Cpu', 
  'Database', 'Globe', 'Heart', 'Home', 'Layers', 'Layout', 'Link',
  'Map', 'MessageSquare', 'Package', 'Palette', 'PenTool', 'Rocket',
  'Shield', 'ShoppingBag', 'Sparkles', 'Star', 'Target', 'Tool',
  'TrendingUp', 'Users', 'Zap', 'Award', 'Book', 'Camera', 'Coffee'
];

// Preset colors for quick selection
const presetColors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#F43F5E', '#06B6D4', '#14B8A6', '#84CC16', '#F97316',
  '#64748B', '#6B7280', '#9333EA', '#A855F7', '#D946EF', '#E11D48'
];

const TopicEditor: React.FC<TopicEditorProps> = ({ topic, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    slug: '',
    description: '',
    icon: 'Tag',
    color: '#3B82F6'
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        slug: topic.slug,
        description: topic.description || '',
        icon: topic.icon || 'Tag',
        color: topic.color || '#3B82F6'
      });
    }
  }, [topic]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: !topic ? generateSlug(name) : prev.slug || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const filteredIcons = popularIcons.filter(icon =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const SelectedIcon = formData.icon ? Icons[formData.icon as keyof typeof Icons] : Icons.Tag;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {topic ? 'Edit Topic' : 'Create New Topic'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Technology"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., technology"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Brief description of this topic..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <SelectedIcon className="h-5 w-5 mr-2" />
                    <span>{formData.icon}</span>
                  </div>
                  <Icons.ChevronDown className="h-4 w-4" />
                </button>

                {showIconPicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="sticky top-0 bg-white p-2 border-b">
                      <input
                        type="text"
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        placeholder="Search icons..."
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {filteredIcons.map((iconName) => {
                        const IconComponent = Icons[iconName as keyof typeof Icons];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, icon: iconName }));
                              setShowIconPicker(false);
                              setIconSearch('');
                            }}
                            className={`p-2 hover:bg-gray-100 rounded flex flex-col items-center justify-center ${
                              formData.icon === iconName ? 'bg-blue-100' : ''
                            }`}
                          >
                            <IconComponent className="h-5 w-5 mb-1" />
                            <span className="text-xs text-gray-600">{iconName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div
                      className="h-5 w-5 rounded mr-2"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span>{formData.color}</span>
                  </div>
                  <Icons.ChevronDown className="h-4 w-4" />
                </button>

                {showColorPicker && (
                  <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                    <HexColorPicker
                      color={formData.color}
                      onChange={(color) => setFormData(prev => ({ ...prev, color }))}
                    />
                    <div className="grid grid-cols-6 gap-2 mt-3">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className="h-8 w-8 rounded border-2 border-gray-200 hover:border-gray-400"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.color || '#3B82F6' }}
                >
                  <SelectedIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">{formData.name || 'Topic Name'}</h5>
                  <p className="text-sm text-gray-500">{formData.description || 'Topic description'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : topic ? 'Update Topic' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopicEditor;