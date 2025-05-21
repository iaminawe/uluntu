import { Building, MapPin } from 'lucide-react';
import { ProfileInfoProps } from './types';

const ProfileInfo: React.FC<ProfileInfoProps> = ({ member }) => {
  return (
    <div className="lg:col-span-2">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {member.name}
      </h1>
      
      <p className="text-xl text-orange-500 mb-4">{member.title}</p>
      
      {/* Company and Location */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {member.company && (
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <Building className="h-5 w-5 mr-2" />
            <span>{member.company}</span>
          </div>
        )}
        
        {member.location && (
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{member.location}</span>
          </div>
        )}
      </div>
      
      {/* Bio */}
      {member.bio && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">About</h2>
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{member.bio}</p>
        </div>
      )}
      
      {/* Skills */}
      {member.skills && member.skills.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
