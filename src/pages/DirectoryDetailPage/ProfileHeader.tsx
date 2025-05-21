import { Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { ProfileHeaderProps } from './types';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ id, member }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <Link
          to="/directory"
          className="inline-flex items-center text-orange-500 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Link>
        
        <Link
          to={`/directory/${id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow hover:shadow-md"
        >
          <Edit className="h-5 w-5 mr-2" />
          Edit Profile
        </Link>
      </div>
      
      {/* Header Section with Cover Image */}
      <div className="h-64 bg-gradient-to-r from-blue-500 to-teal-500 relative">
        <div className="absolute left-8 bottom-0 transform translate-y-1/2">
          <img
            src={member.image}
            alt={member.name}
            className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
