import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Topic, TopicFormData } from '@/types/topic';
import TopicPicker from '@/components/ui/TopicPicker';
import TopicEditor from './TopicEditor';
import { Tag, Plus } from 'lucide-react';

interface InlineTopicManagerProps {
  entityType: string;
  entityId?: string;
  selectedTopics: string[];
  onChange: (topicIds: string[]) => void;
  label?: string;
  required?: boolean;
  maxTopics?: number;
}

const InlineTopicManager: React.FC<InlineTopicManagerProps> = ({
  entityType,
  entityId,
  selectedTopics,
  onChange,
  label = 'Topics',
  required = false,
  maxTopics
}) => {
  const queryClient = useQueryClient();
  const [showTopicEditor, setShowTopicEditor] = useState(false);

  // Fetch available topics
  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Topic[];
    }
  });

  // Fetch existing topics if editing
  const { data: existingTopics = [] } = useQuery({
    queryKey: ['entity-topics', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      const { data, error } = await supabase
        .from(`${entityType}_topics`)
        .select('topic_id')
        .eq(`${entityType}_id`, entityId);
      
      if (error) throw error;
      return data.map(item => item.topic_id);
    },
    enabled: !!entityId
  });

  // Create new topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (data: TopicFormData) => {
      const { data: newTopic, error } = await supabase
        .from('topics')
        .insert({
          ...data,
          sort_order: topics.length
        })
        .select()
        .single();
      
      if (error) throw error;
      return newTopic;
    },
    onSuccess: (newTopic) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      onChange([...selectedTopics, newTopic.id]);
      setShowTopicEditor(false);
    }
  });

  const handleCreateTopic = (name: string) => {
    createTopicMutation.mutate({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      color: '#3B82F6',
      icon: 'Tag'
    });
  };

  React.useEffect(() => {
    if (entityId && existingTopics.length > 0 && selectedTopics.length === 0) {
      onChange(existingTopics);
    }
  }, [entityId, existingTopics, selectedTopics.length]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowTopicEditor(true)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create New Topic
        </button>
      </div>
      
      <TopicPicker
        topics={topics}
        selectedTopics={selectedTopics}
        onChange={onChange}
        maxSelections={maxTopics}
        placeholder="Select topics..."
        allowCreate={true}
        onCreateTopic={handleCreateTopic}
      />
      
      {maxTopics && (
        <p className="mt-1 text-sm text-gray-500">
          Select up to {maxTopics} topic{maxTopics > 1 ? 's' : ''}
        </p>
      )}

      {showTopicEditor && (
        <TopicEditor
          topic={null}
          onSave={(data) => createTopicMutation.mutate(data)}
          onCancel={() => setShowTopicEditor(false)}
          isLoading={createTopicMutation.isPending}
        />
      )}
    </div>
  );
};

export default InlineTopicManager;