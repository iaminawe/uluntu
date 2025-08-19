import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  Palette,
  Hash
} from 'lucide-react';
import { useTopicsHybrid, useTopicAnalytics, useCreateTopic, useUpdateTopic, useDeleteTopic } from '@/features/topics/hooks/useTopicsHybrid';
import type { Topic, TopicWithAnalytics, TopicFormData } from '@/features/topics/types';

const AdminTopicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { topics, isLoading, error, refetch, setSearchTerm } = useTopicsHybrid();
  const { data: topicsWithAnalytics } = useTopicAnalytics();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();

  const [searchInput, setSearchInput] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    description: '',
    icon: '📌',
    color: '#3B82F6',
    sortOrder: 0,
    isActive: true
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Combine topics with analytics data
  const enrichedTopics = topics.map(topic => {
    const analytics = topicsWithAnalytics?.find(t => t.id === topic.id);
    return {
      ...topic,
      totalContentCount: analytics?.totalContentCount || 0,
      memberCount: analytics?.memberCount || 0
    };
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTopicMutation.mutateAsync(formData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        icon: '📌',
        color: '#3B82F6',
        sortOrder: 0,
        isActive: true
      });
      refetch();
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;

    try {
      await updateTopicMutation.mutateAsync({
        id: editingTopic.id,
        data: formData
      });
      setEditingTopic(null);
      setFormData({
        name: '',
        description: '',
        icon: '📌',
        color: '#3B82F6',
        sortOrder: 0,
        isActive: true
      });
      refetch();
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await deleteTopicMutation.mutateAsync(id);
      setDeleteConfirmId(null);
      refetch();
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const startEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description || '',
      icon: getTopicIcon(topic.icon), // Convert to emoji for editing
      color: topic.color,
      sortOrder: topic.sortOrder,
      isActive: topic.isActive
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingTopic(null);
    setFormData({
      name: '',
      description: '',
      icon: '📌',
      color: '#3B82F6',
      sortOrder: 0,
      isActive: true
    });
  };

  const moveTopic = async (topic: Topic, direction: 'up' | 'down') => {
    const currentIndex = enrichedTopics.findIndex(t => t.id === topic.id);
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (swapIndex < 0 || swapIndex >= enrichedTopics.length) return;
    
    const swapTopic = enrichedTopics[swapIndex];
    
    try {
      // Swap sort orders
      await updateTopicMutation.mutateAsync({
        id: topic.id,
        data: { sortOrder: swapTopic.sortOrder }
      });
      await updateTopicMutation.mutateAsync({
        id: swapTopic.id,
        data: { sortOrder: topic.sortOrder }
      });
      refetch();
    } catch (error) {
      console.error('Error reordering topics:', error);
    }
  };

  // Icon mapping for text-based icons to emojis
  const iconMap: Record<string, string> = {
    'laptop': '💻',
    'briefcase': '💼', 
    'palette': '🎨',
    'camera': '📷',
    'layers': '📋',
    'technology': '💻',
    'business': '💼',
    'art': '🎨',
    'photography': '📷',
    'design': '📋',
    'music': '🎵',
    'book': '📚',
    'building': '🏢',
    'star': '⭐',
    'rocket': '🚀',
    'bulb': '💡',
    'target': '🎯',
    'tool': '🔧',
    'chart': '📊',
    'trophy': '🏆',
    'money': '💰',
    'microscope': '🔬',
    'gamepad': '🎮',
    'film': '🎬',
    'pin': '📌'
  };

  const emojiOptions = ['📌', '💡', '🚀', '🎯', '🔧', '📊', '🎨', '🏆', '💰', '⭐', '🔬', '🎮', '🎬', '🎵', '📚', '🏢', '💻', '💼', '📷', '📋'];
  const colorOptions = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  // Helper function to get the proper icon
  const getTopicIcon = (iconValue: string | null | undefined): string => {
    if (!iconValue) return '📌';
    
    // If it's already an emoji (length 1-2 and contains emoji characters)
    if (iconValue.length <= 2 && /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconValue)) {
      return iconValue;
    }
    
    // Convert text-based icons to emojis
    const mappedIcon = iconMap[iconValue.toLowerCase()];
    return mappedIcon || '📌';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error loading topics. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Topics Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage topics used for categorizing content across the platform</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Search
          </button>
        </form>
        
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingTopic(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Topic
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingTopic) && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingTopic ? 'Edit Topic' : 'Create New Topic'}
          </h2>
          
          <form onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        formData.icon === emoji
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <span className="text-xl">{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createTopicMutation.isPending || updateTopicMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {editingTopic ? 'Update' : 'Create'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  cancelEdit();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {enrichedTopics.map((topic, index) => (
                <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveTopic(topic, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => moveTopic(topic, 'down')}
                        disabled={index === enrichedTopics.length - 1}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border border-white/20"
                        style={{ backgroundColor: topic.color || '#3B82F6' }}
                      >
                        <span className="text-lg" role="img" aria-label="topic icon">
                          {getTopicIcon(topic.icon)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {topic.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {topic.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {topic.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-gray-100 font-medium">
                        {topic.totalContentCount} items
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {topic.memberCount} members
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {topic.isActive ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(topic)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      {deleteConfirmId === topic.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(topic.id)}
                          disabled={topic.totalContentCount > 0}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={topic.totalContentCount > 0 ? 'Cannot delete topic with associated content' : 'Delete topic'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {enrichedTopics.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No topics found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Create your first topic to get started
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Topics</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {enrichedTopics.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Hash className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Topics</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {enrichedTopics.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Palette className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usage</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {enrichedTopics.reduce((sum, t) => sum + t.totalContentCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopicsPage;