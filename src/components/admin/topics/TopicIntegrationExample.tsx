// Example of integrating topics into an entity form (e.g., NewsEditPage)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import InlineTopicManager from './InlineTopicManager';
import TopicPicker from '@/components/ui/TopicPicker';
import * as Icons from 'lucide-react';

// Example usage in a form component:
const ExampleEntityForm = () => {
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    topics: [] as string[]
  });

  return (
    <form>
      {/* Other form fields */}
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Title"
      />

      {/* Topic Manager Integration */}
      <InlineTopicManager
        entityType="news" // Change based on entity type
        entityId={undefined} // Pass the entity ID when editing
        selectedTopics={formData.topics}
        onChange={(topics) => setFormData({ ...formData, topics })}
        label="Article Topics"
        required={true}
        maxTopics={5}
      />

      {/* Submit button */}
      <button type="submit">Save</button>
    </form>
  );
};

// Example of adding topic filtering to a list view:
const ExampleListWithTopicFilter = () => {
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);

  // In your query, filter by topics:
  // const { data } = useQuery({
  //   queryKey: ['news', selectedTopics],
  //   queryFn: async () => {
  //     let query = supabase.from('news').select('*');
  //     
  //     if (selectedTopics.length > 0) {
  //       query = query.in('id', 
  //         supabase
  //           .from('news_topics')
  //           .select('news_id')
  //           .in('topic_id', selectedTopics)
  //       );
  //     }
  //     
  //     return query;
  //   }
  // });

  return (
    <div>
      {/* Topic filter in the action bar */}
      <div className="mb-4">
        <TopicPicker
          topics={[]} // Load from API
          selectedTopics={selectedTopics}
          onChange={setSelectedTopics}
          placeholder="Filter by topics..."
        />
      </div>

      {/* List of items */}
      <div>
        {/* Render filtered items */}
      </div>
    </div>
  );
};

// Example of displaying topics on a detail page:
const ExampleDetailPageWithTopics = ({ item }: any) => {
  const { data: topics = [] } = useQuery({
    queryKey: ['item-topics', item.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('news_topics')
        .select('topics(*)')
        .eq('news_id', item.id);
      
      return data?.map(t => t.topics) || [];
    }
  });

  return (
    <div>
      <h1>{item.title}</h1>
      
      {/* Display topics */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {topics.map(topic => {
            const Icon = Icons[topic.icon as keyof typeof Icons] || Icons.Tag;
            return (
              <span
                key={topic.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${topic.color}20`, 
                  color: topic.color 
                }}
              >
                <Icon className="h-4 w-4 mr-1" />
                {topic.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Export example components for reference
export { ExampleEntityForm, ExampleListWithTopicFilter, ExampleDetailPageWithTopics };