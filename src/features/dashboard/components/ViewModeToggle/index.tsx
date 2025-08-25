import React from 'react';
import { Grid3X3, List } from 'lucide-react';

interface ViewModeToggleProps {
  value: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 ${value === 'grid' 
          ? 'bg-orange-500 text-white' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 ${value === 'list' 
          ? 'bg-orange-500 text-white' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ViewModeToggle;