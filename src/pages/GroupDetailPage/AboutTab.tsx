import { AboutTabProps } from './types';

const AboutTab: React.FC<AboutTabProps> = ({ group }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">About This Group</h2>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {group.longDescription || group.description}
          </p>
        </div>
      </div>
      
      {group.interests && group.interests.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Interests & Goals</h3>
          <div className="flex flex-wrap gap-2">
            {group.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-3 py-1.5 bg-primary-100 text-primary-700 rounded-md text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Group Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Members:</span>
              <span className="text-slate-900 dark:text-white font-medium">{group.memberCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Created:</span>
              <span className="text-slate-900 dark:text-white font-medium">
                {new Date(group.members[0]?.joinedDate || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Last active:</span>
              <span className="text-slate-900 dark:text-white font-medium">
                {new Date(group.lastActive).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Admins</h3>
          <div className="space-y-4">
            {group.members.filter(member => member.role === 'admin').map(admin => (
              <div key={admin.id} className="flex items-center">
                <img
                  src={admin.image}
                  alt={admin.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="text-slate-900 dark:text-white font-medium">{admin.name}</h4>
                  {admin.title && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{admin.title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
