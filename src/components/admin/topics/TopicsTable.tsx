import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabase';
import { Topic } from '@/types/topic';
import { GripVertical, Edit, Trash2, Tag, TrendingUp, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface SortableRowProps {
  topic: Topic;
  onEdit: (topic: Topic) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ topic, onEdit, onDelete, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = topic.icon ? Icons[topic.icon as keyof typeof Icons] : Tag;

  return (
    <tr ref={setNodeRef} style={style} className={`hover:bg-gray-50 ${isDragging ? 'bg-gray-100' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(topic.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-6 py-4">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center mr-3"
            style={{ backgroundColor: topic.color || '#6B7280' }}
          >
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{topic.name}</div>
            <div className="text-sm text-gray-500">{topic.slug}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">{topic.description || '-'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Eye className="h-4 w-4 mr-1 text-gray-400" />
          {topic.content_count || 0}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(topic)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(topic.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface TopicsTableProps {
  topics: Topic[];
  onEdit: (topic: Topic) => void;
  onRefetch: () => void;
}

const TopicsTable: React.FC<TopicsTableProps> = ({ topics, onEdit, onRefetch }) => {
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState(topics);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update items when topics prop changes
  React.useEffect(() => {
    setItems(topics);
  }, [topics]);

  // Update sort order mutation
  const updateSortOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('topics')
          .update({ sort_order })
          .eq('id', id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('topics')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedItems([]);
      onRefetch();
    }
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update sort orders
        const updates = newItems.map((item, index) => ({
          id: item.id,
          sort_order: index
        }));
        
        updateSortOrderMutation.mutate(updates);
        
        return newItems;
      });
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedItems.length} topics?`)) {
      deleteMutation.mutate(selectedItems);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this topic?')) {
      deleteMutation.mutate([id]);
    }
  };

  return (
    <div>
      {selectedItems.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedItems.length} topics selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((topic) => (
                  <SortableRow
                    key={topic.id}
                    topic={topic}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    isSelected={selectedItems.includes(topic.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopicsTable;