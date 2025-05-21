import { Plus, X } from 'lucide-react';
import { ListSectionProps } from './types';

const ListSection = ({
  items,
  newItem,
  setNewItem,
  onAdd,
  onRemove,
  label,
  placeholder,
  isSubmitting
}: ListSectionProps) => {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">{label}</h3>
      
      <div className="flex mb-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md 
                    shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!newItem.trim() || isSubmitting}
          className={`px-4 py-2 bg-orange-500 text-white rounded-r-md
                    hover:bg-orange-600 transition-colors flex items-center
                    ${(!newItem.trim() || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      {items.length > 0 && (
        <div className="space-y-2 mt-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-700 
                      text-slate-700 dark:text-slate-300 rounded-lg"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-slate-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListSection;
