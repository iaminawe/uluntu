import { OrganizerSelectProps } from './types';

const OrganizerSelect: React.FC<OrganizerSelectProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <label htmlFor="organizerId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Organizer
      </label>
      <select
        id="organizerId"
        name="organizerId"
        value={formData.organizerId}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                  bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                  focus:ring-2 focus:ring-orange-500"
      >
        <option value={1}>Sarah Johnson</option>
        <option value={2}>Michael Chen</option>
        <option value={3}>Emma Wilson</option>
      </select>
    </div>
  );
};

export default OrganizerSelect;
