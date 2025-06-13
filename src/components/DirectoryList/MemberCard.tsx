import { Link } from 'react-router-dom';
import { MapPin, Building } from 'lucide-react';
import { Member } from '@/features/directory/components/DirectoryList/types';
import { getSkillColor } from '@/features/directory/components/DirectoryList/utils';

interface MemberCardProps {
  member: Member;
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Link
      to={`/directory/${member.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full text-center"
    >
      <div className="pt-6">
        <img
          src={member.image}
          alt={member.name}
          className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white dark:border-slate-700 shadow-lg transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-4 mb-1 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
          {member.name}
        </h3>
        <p className="text-orange-600 dark:text-orange-400 mb-3">{member.title}</p>
        
        {member.intro && (
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 italic">
            "{member.intro}"
          </p>
        )}
        
        <div className="space-y-2 mb-4 text-left">
          {member.company && (
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Building className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{member.company}</span>
            </div>
          )}
          
          {member.location && (
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{member.location}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 justify-center">
          {member.skills?.map(skill => (
            <span
              key={skill}
              className={`px-2 py-1 rounded-md text-sm ${getSkillColor(skill)}`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default MemberCard;
