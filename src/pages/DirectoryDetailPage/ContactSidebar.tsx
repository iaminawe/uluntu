import { Mail, Globe, Linkedin, Twitter, Github } from 'lucide-react';
import { ContactSidebarProps } from './types';

const ContactSidebar: React.FC<ContactSidebarProps> = ({ member }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h2>
      
      {/* Contact Button */}
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors mb-6 flex items-center justify-center">
        <Mail className="h-5 w-5 mr-2" />
        <span>Contact {member.name.split(' ')[0]}</span>
      </button>
      
      {/* Social Links */}
      {member.social && (
        <div className="space-y-4">
          {member.social.website && (
            <a
              href={member.social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-500"
            >
              <Globe className="h-5 w-5 mr-3" />
              <span>Personal Website</span>
            </a>
          )}
          
          {member.social.linkedin && (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-500"
            >
              <Linkedin className="h-5 w-5 mr-3" />
              <span>LinkedIn Profile</span>
            </a>
          )}
          
          {member.social.twitter && (
            <a
              href={member.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-500"
            >
              <Twitter className="h-5 w-5 mr-3" />
              <span>Twitter</span>
            </a>
          )}
          
          {member.social.github && (
            <a
              href={member.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-500"
            >
              <Github className="h-5 w-5 mr-3" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      )}
      
      {/* Join Date */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Member of Kootenay Tech Community since {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

export default ContactSidebar;
