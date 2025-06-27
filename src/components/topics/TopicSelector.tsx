import React, { useState, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';
import type { Topic } from '@/types/topic';

interface TopicSelectorProps {
  selectedTopics: string[];
  onChange: (topicIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
  disabled?: boolean;
}

export function TopicSelector({
  selectedTopics,
  onChange,
  placeholder = 'Select topics...',
  maxSelections,
  className = '',
  disabled = false
}: TopicSelectorProps) {
  const { topics, loading } = useTopics();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTopicObjects = topics.filter(topic =>
    selectedTopics.includes(topic.id)
  );

  const handleToggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      onChange(selectedTopics.filter(id => id !== topicId));
    } else {
      if (!maxSelections || selectedTopics.length < maxSelections) {
        onChange([...selectedTopics, topicId]);
      }
    }
  };

  const handleRemoveTopic = (topicId: string) => {
    onChange(selectedTopics.filter(id => id !== topicId));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.topic-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-md h-10 ${className}`} />
    );
  }

  return (
    <div className={`topic-selector relative ${className}`}>
      <div
        className={`
          min-h-[42px] px-3 py-2 border rounded-md cursor-pointer
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'border-blue-500' : 'border-gray-300'}
          transition-colors
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {selectedTopicObjects.length > 0 ? (
            selectedTopicObjects.map(topic => (
              <span
                key={topic.id}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full"
                style={{ backgroundColor: topic.color + '20', color: topic.color }}
              >
                {topic.name}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTopic(topic.id);
                    }}
                    className="hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronDown className={`
            ml-auto h-4 w-4 text-gray-400 transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredTopics.length > 0 ? (
              filteredTopics.map(topic => {
                const isSelected = selectedTopics.includes(topic.id);
                const isDisabled = !isSelected && maxSelections && selectedTopics.length >= maxSelections;
                
                return (
                  <button
                    key={topic.id}
                    onClick={() => !isDisabled && handleToggleTopic(topic.id)}
                    disabled={isDisabled}
                    className={`
                      w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-gray-50
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                      `}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: topic.color }}
                      />
                      <span className="font-medium">{topic.name}</span>
                      {topic.description && (
                        <span className="text-sm text-gray-500 truncate">
                          - {topic.description}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center text-gray-500">
                No topics found
              </div>
            )}
          </div>

          {maxSelections && (
            <div className="px-3 py-2 text-sm text-gray-500 border-t">
              {selectedTopics.length} / {maxSelections} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}