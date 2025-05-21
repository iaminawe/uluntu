import { GroupSelectProps } from './types';

const GroupSelect: React.FC<GroupSelectProps> = ({ formData, handleChange }) => {
  // This would normally be fetched from API or context
  const groups = [
    { id: '1', name: 'AI Enthusiasts Kootenay' },
    { id: '2', name: 'Web Developers Guild' },
    { id: '3', name: 'Data Science Network' },
    { id: '4', name: 'UX/UI Design Group' }
  ];

  return (
    <div>
      <label htmlFor="groupId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Associated Group
      </label>
      <select
        id="groupId"
        name="groupId"
        value={formData.groupId}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                 bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                 focus:ring-2 focus:ring-orange-500"
      >
        <option value="">Select a group (optional)</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>{group.name}</option>
        ))}
      </select>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Attach this resource to a group
      </p>
    </div>
  );
};

export default GroupSelect;
