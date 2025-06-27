import React, { useState, useRef, useEffect } from 'react';
import { Topic } from '@/types/topic';
import { X, Check, Search, Plus } from 'lucide-react';
import * as Icons from 'lucide-react';

interface TopicPickerProps {
  topics: Topic[];
  selectedTopics: string[];
  onChange: (topicIds: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  allowCreate?: boolean;
  onCreateTopic?: (name: string) => void;
}

const TopicPicker: React.FC<TopicPickerProps> = ({
  topics,
  selectedTopics,
  onChange,
  maxSelections,
  placeholder = 'Select topics...',
  allowCreate = false,
  onCreateTopic
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTopicObjects = topics.filter(topic => selectedTopics.includes(topic.id));

  const handleToggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      onChange(selectedTopics.filter(id => id !== topicId));
    } else {
      if (!maxSelections || selectedTopics.length < maxSelections) {
        onChange([...selectedTopics, topicId]);
      }
    }
  };

  const handleRemoveTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTopics.filter(id => id !== topicId));
  };

  const handleCreateTopic = () => {
    if (onCreateTopic && searchQuery.trim()) {
      onCreateTopic(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedTopicObjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedTopicObjects.map(topic => {
              const IconComponent = topic.icon ? Icons[topic.icon as keyof typeof Icons] : Icons.Tag;
              return (
                <span
                  key={topic.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {topic.name}
                  <button
                    onClick={(e) => handleRemoveTopic(topic.id, e)}
                    className="ml-1 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="py-1">
            {filteredTopics.length === 0 && searchQuery && allowCreate ? (
              <button
                onClick={handleCreateTopic}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm">Create "{searchQuery}"</span>
              </button>
            ) : filteredTopics.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No topics found</div>
            ) : (
              filteredTopics.map(topic => {
                const IconComponent = topic.icon ? Icons[topic.icon as keyof typeof Icons] : Icons.Tag;
                const isSelected = selectedTopics.includes(topic.id);
                const isDisabled = !isSelected && maxSelections && selectedTopics.length >= maxSelections;

                return (
                  <button
                    key={topic.id}
                    onClick={() => !isDisabled && handleToggleTopic(topic.id)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className="h-6 w-6 rounded flex items-center justify-center mr-3"
                        style={{ backgroundColor: topic.color || '#6B7280' }}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                        {topic.description && (
                          <div className="text-xs text-gray-500">{topic.description}</div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })
            )}
          </div>

          {maxSelections && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
              {selectedTopics.length} / {maxSelections} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicPicker;