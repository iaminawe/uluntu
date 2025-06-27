import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useTopics, useTopicAnalytics } from '@/hooks/useTopics';
import type { Topic, TopicFormData } from '@/types/topic';

export default function TopicsPage() {
  const { topics, loading, error, createTopic, updateTopic, deleteTopic } = useTopics();
  const { analytics } = useTopicAnalytics();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    description: '',
    icon: '',
    color: '#888888',
    sort_order: 0
  });

  const handleCreate = async () => {
    try {
      await createTopic(formData);
      setIsCreating(false);
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#888888',
        sort_order: 0
      });
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateTopic(id, formData);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update topic:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      await deleteTopic(id);
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  const startEdit = (topic: Topic) => {
    setEditingId(topic.id);
    setFormData({
      name: topic.name,
      description: topic.description || '',
      icon: topic.icon || '',
      color: topic.color || '#888888',
      sort_order: topic.sort_order || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#888888',
      sort_order: 0
    });
  };

  const getAnalyticsForTopic = (topicId: string) => {
    return analytics.find(a => a.topic_id === topicId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading topics: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Topics Management</h1>
        <p className="mt-2 text-gray-600">Manage content categorization topics</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">All Topics</h2>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </button>
          </div>

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isCreating && (
                  <tr>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Topic name"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={formData.sort_order || 0}
                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={handleCreate}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setFormData({
                            name: '',
                            description: '',
                            icon: '',
                            color: '#888888',
                            sort_order: 0
                          });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )}
                
                {topics.map((topic) => {
                  const topicAnalytics = getAnalyticsForTopic(topic.id);
                  const isEditing = editingId === topic.id;
                  
                  return (
                    <tr key={topic.id}>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={formData.color}
                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: topic.color || '#888' }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                              <div className="text-sm text-gray-500">{topic.slug}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{topic.description || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {topicAnalytics?.content_count || 0}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.sort_order || 0}
                            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{topic.sort_order}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdate(topic.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(topic)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(topic.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={topicAnalytics && topicAnalytics.content_count > 0}
                              title={topicAnalytics && topicAnalytics.content_count > 0 ? 'Cannot delete topic with associated content' : ''}
                            >
                              <Trash2 className={`h-4 w-4 ${topicAnalytics && topicAnalytics.content_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Topic Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.map((stat) => (
              <div key={stat.topic_id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{stat.topic_name}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Total content: {stat.content_count}</div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                    <div>News: {stat.news_count}</div>
                    <div>Events: {stat.event_count}</div>
                    <div>Resources: {stat.resource_count}</div>
                    <div>Groups: {stat.group_count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}