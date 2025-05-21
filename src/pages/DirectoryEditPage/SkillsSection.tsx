import { Plus, X } from 'lucide-react';
import { SkillsSectionProps } from './types';

const SkillsSection = ({
  skills,
  newSkill,
  setNewSkill,
  onAdd,
  onRemove,
  isSubmitting,
  error
}: SkillsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white">Skills</h3>
      
      <div className="flex mb-3">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md 
                    shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          placeholder="Add a skill (e.g., JavaScript)"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!newSkill.trim() || isSubmitting}
          className={`px-4 py-2 bg-orange-500 text-white rounded-r-md
                    hover:bg-orange-600 transition-colors flex items-center
                    ${(!newSkill.trim() || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 
                       px-3 py-1 rounded-full"
            >
              <span className="mr-1">{skill}</span>
              <button
                type="button"
                onClick={() => onRemove(skill)}
                disabled={isSubmitting}
                className="text-slate-500 hover:text-red-500 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add skills to showcase your expertise.
        </p>
      )}
    </div>
  );
};

export default SkillsSection;
