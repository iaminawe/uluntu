import { Plus, X, Heart } from 'lucide-react';

interface InterestsSectionProps {
  interests: string[];
  newInterest: string;
  setNewInterest: (value: string) => void;
  onAdd: () => void;
  onRemove: (interest: string) => void;
  isSubmitting: boolean;
  error?: string;
}

const InterestsSection = ({
  interests,
  newInterest,
  setNewInterest,
  onAdd,
  onRemove,
  isSubmitting,
  error
}: InterestsSectionProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Interests
          </div>
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Add your interests to help others find common ground
        </p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            placeholder="e.g., AI, Sustainability, Design"
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                     focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={isSubmitting || !newInterest.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 
                     transition-colors flex items-center gap-2 disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      
      {interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 
                       text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              {interest}
              <button
                type="button"
                onClick={() => onRemove(interest)}
                disabled={isSubmitting}
                className="text-slate-500 hover:text-red-500 transition-colors"
                aria-label={`Remove ${interest}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterestsSection;