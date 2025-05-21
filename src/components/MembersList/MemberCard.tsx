import { Link } from 'react-router-dom';
import { Building, MapPin } from 'lucide-react';
import { Member } from './types';

interface MemberCardProps {
  member: Member;
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Link
      to={`/directory/${member.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center mb-4">
        <img
          src={member.image}
          alt={member.name}
          className="w-12 h-12 rounded-full mr-4 object-cover"
        />
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{member.title}</p>
        </div>
      </div>
      
      {(member.company || member.location) && (
        <div className="space-y-2 mb-4">
          {member.company && (
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <Building className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{member.company}</span>
            </div>
          )}
          
          {member.location && (
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{member.location}</span>
            </div>
          )}
        </div>
      )}
      
      {member.skills && member.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {member.skills.slice(0, 3).map(skill => (
            <span
              key={skill}
              className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
          {member.skills.length > 3 && (
            <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs">
              +{member.skills.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default MemberCard;
