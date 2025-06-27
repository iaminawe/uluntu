import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Topic, TopicFormData, TopicAnalytics } from '@/types/topic';
import TopicsTable from '@/components/admin/topics/TopicsTable';
import TopicEditor from '@/components/admin/topics/TopicEditor';
import TopicAnalyticsComponent from '@/components/admin/topics/TopicAnalytics';
import { Plus, Tag, TrendingUp, RefreshCw, Download } from 'lucide-react';

const TopicsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [activeTab, setActiveTab] = useState<'manage' | 'analytics'>('manage');

  // Fetch topics
  const { data: topics = [], isLoading: topicsLoading, refetch } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Topic[];
    }
  });

  // Fetch analytics
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-topics-analytics'],
    queryFn: async () => {
      // This would typically be a more complex query joining with content tables
      // For now, we'll simulate the analytics data
      const { data: topicsWithCounts, error } = await supabase
        .from('topics')
        .select(`
          id,
          name,
          (select count(*) from content_topics where topic_id = topics.id) as content_count
        `);
      
      if (error) throw error;

      // Simulate analytics data - in production, this would come from real metrics
      return (topicsWithCounts || []).map(topic => ({
        topic_id: topic.id,
        topic_name: topic.name,
        content_count: topic.content_count || 0,
        view_count: Math.floor(Math.random() * 10000),
        engagement_rate: Math.random() * 0.3,
        trending_score: Math.random() * 100,
        last_7_days_count: Math.floor(Math.random() * 50),
        last_30_days_count: Math.floor(Math.random() * 200)
      })) as TopicAnalytics[];
    },
    enabled: activeTab === 'analytics'
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: TopicFormData) => {
      if (editingTopic) {
        const { error } = await supabase
          .from('topics')
          .update(data)
          .eq('id', editingTopic.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('topics')
          .insert({
            ...data,
            sort_order: topics.length
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      setShowEditor(false);
      setEditingTopic(null);
    }
  });

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingTopic(null);
    setShowEditor(true);
  };

  const handleExport = async () => {
    const headers = ['Name', 'Slug', 'Description', 'Icon', 'Color', 'Content Count'];
    const rows = topics.map(topic => [
      topic.name,
      topic.slug,
      topic.description || '',
      topic.icon || '',
      topic.color || '',
      topic.content_count || 0
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topics-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tag className="h-6 w-6 mr-2" />
            Topics Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage content categorization and topic analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {activeTab === 'manage' && (
            <>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Topic
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="h-4 w-4 inline mr-2" />
            Manage Topics
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Analytics
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'manage' ? (
        topicsLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading topics...
            </div>
          </div>
        ) : (
          <TopicsTable
            topics={topics}
            onEdit={handleEdit}
            onRefetch={refetch}
          />
        )
      ) : (
        <TopicAnalyticsComponent
          analytics={analytics}
          isLoading={analyticsLoading}
        />
      )}

      {/* Editor Modal */}
      {showEditor && (
        <TopicEditor
          topic={editingTopic}
          onSave={(data) => saveMutation.mutate(data)}
          onCancel={() => {
            setShowEditor(false);
            setEditingTopic(null);
          }}
          isLoading={saveMutation.isPending}
        />
      )}
    </div>
  );
};

export default TopicsPage;