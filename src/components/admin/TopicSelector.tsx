import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, Search } from 'lucide-react';
import { useTopicsHybrid } from '@/features/topics/hooks/useTopicsHybrid';
import { Topic } from '@/features/topics/types';

interface TopicSelectorProps {
  selectedTopics: string[];
  onTopicsChange: (topicIds: string[]) => void;
  placeholder?: string;
  maxTopics?: number;
  disabled?: boolean;
  className?: string;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  selectedTopics,
  onTopicsChange,
  placeholder = "Search and select topics...",
  maxTopics = 5,
  disabled = false,
  className = ""
}) => {
  const { topics, isLoading } = useTopicsHybrid();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);

  // Filter topics based on search term
  useEffect(() => {
    if (!topics) return;
    
    const filtered = topics.filter(topic => 
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTopics.includes(topic.id)
    );
    setFilteredTopics(filtered);
  }, [topics, searchTerm, selectedTopics]);

  const handleAddTopic = (topicId: string) => {
    if (selectedTopics.length < maxTopics) {
      onTopicsChange([...selectedTopics, topicId]);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const handleRemoveTopic = (topicId: string) => {
    onTopicsChange(selectedTopics.filter(id => id !== topicId));
  };

  const getTopicById = (id: string) => {
    return topics?.find(topic => topic.id === id);
  };

  const selectedTopicObjects = selectedTopics.map(id => getTopicById(id)).filter(Boolean) as Topic[];

  return (
    <div className={`relative ${className}`}>
      {/* Selected Topics Display */}
      {selectedTopicObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTopicObjects.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: topic.color }}
            >
              <Tag className="h-3 w-3" />
              <span>{topic.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic.id)}
                  className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Topic Selector Input */}
      {!disabled && selectedTopics.length < maxTopics && (
        <div className="relative">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <Search className="h-4 w-4 text-gray-400 ml-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              disabled={isLoading}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && filteredTopics.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleAddTopic(topic.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: topic.color }}
                  >
                    <Tag className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{topic.name}</div>
                    {topic.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {topic.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Close dropdown when clicking outside */}
          {isOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        {selectedTopics.length}/{maxTopics} topics selected
        {selectedTopics.length === maxTopics && (
          <span className="text-amber-600"> (maximum reached)</span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Loading topics...
        </div>
      )}
    </div>
  );
};

export default TopicSelector;