import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Topic } from '@/types/topic';
import TopicPicker from '@/components/ui/TopicPicker';
import { Tag, Save, X, AlertCircle } from 'lucide-react';

interface BulkTopicAssignmentProps {
  entityType: 'news' | 'events' | 'resources' | 'marketplace' | 'opportunities' | 'companies' | 'groups';
  selectedIds: string[];
  onComplete?: () => void;
  onCancel?: () => void;
}

const BulkTopicAssignment: React.FC<BulkTopicAssignmentProps> = ({
  entityType,
  selectedIds,
  onComplete,
  onCancel
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [mode, setMode] = useState<'add' | 'replace' | 'remove'>('add');

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

  // Bulk assignment mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      const tableName = `${entityType}_topics`;
      
      if (mode === 'replace') {
        // First remove all existing topics for selected items
        await supabase
          .from(tableName)
          .delete()
          .in(`${entityType}_id`, selectedIds);
      }

      if (mode === 'remove') {
        // Remove selected topics from selected items
        for (const topicId of selectedTopics) {
          await supabase
            .from(tableName)
            .delete()
            .in(`${entityType}_id`, selectedIds)
            .eq('topic_id', topicId);
        }
      } else {
        // Add topics (for both 'add' and 'replace' modes)
        const inserts = [];
        for (const entityId of selectedIds) {
          for (const topicId of selectedTopics) {
            inserts.push({
              [`${entityType}_id`]: entityId,
              topic_id: topicId
            });
          }
        }

        if (inserts.length > 0) {
          // Use upsert to avoid duplicate key errors
          await supabase
            .from(tableName)
            .upsert(inserts, { 
              onConflict: `${entityType}_id,topic_id` 
            });
        }
      }
    },
    onSuccess: () => {
      if (onComplete) onComplete();
    }
  });

  const handleSubmit = () => {
    if (selectedTopics.length === 0 && mode !== 'replace') {
      return;
    }
    assignMutation.mutate();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Bulk Topic Assignment
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Assign topics to {selectedIds.length} selected {entityType}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                mode === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Add Topics
            </button>
            <button
              type="button"
              onClick={() => setMode('replace')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                mode === 'replace'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Replace All
            </button>
            <button
              type="button"
              onClick={() => setMode('remove')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                mode === 'remove'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Remove Topics
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Topics
          </label>
          <TopicPicker
            topics={topics}
            selectedTopics={selectedTopics}
            onChange={setSelectedTopics}
            placeholder={
              mode === 'add' ? 'Select topics to add...' :
              mode === 'replace' ? 'Select topics to replace with...' :
              'Select topics to remove...'
            }
          />
        </div>

        {mode === 'replace' && selectedTopics.length === 0 && (
          <div className="flex items-start p-4 bg-yellow-50 rounded-md">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Selecting no topics will remove all topic assignments from the selected items.
              </p>
            </div>
          </div>
        )}

        {assignMutation.isError && (
          <div className="flex items-start p-4 bg-red-50 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to assign topics. Please try again.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-4 w-4 inline mr-1" />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={assignMutation.isPending || (selectedTopics.length === 0 && mode !== 'replace')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 inline mr-1" />
          {assignMutation.isPending ? 'Assigning...' : 'Apply Topics'}
        </button>
      </div>
    </div>
  );
};

export default BulkTopicAssignment;