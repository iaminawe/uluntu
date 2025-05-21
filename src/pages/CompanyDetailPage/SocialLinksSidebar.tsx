import { Globe, Linkedin, Twitter, Github } from 'lucide-react';
import { SocialLinksSidebarProps } from './types';

const SocialLinksSidebar: React.FC<SocialLinksSidebarProps> = ({ company }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Connect</h2>
      
      {/* Website Button */}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors mb-6 flex items-center justify-center"
        >
          <Globe className="h-5 w-5 mr-2" />
          <span>Visit Website</span>
        </a>
      )}
      
      {/* Social Links */}
      {company.social && (
        <div className="space-y-4 mb-6">
          {company.social.linkedin && (
            <a
              href={company.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-500"
            >
              <Linkedin className="h-5 w-5 mr-3" />
              <span>LinkedIn</span>
            </a>
          )}
          
          {company.social.twitter && (
            <a
              href={company.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-500"
            >
              <Twitter className="h-5 w-5 mr-3" />
              <span>Twitter</span>
            </a>
          )}
          
          {company.social.github && (
            <a
              href={company.social.github}
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
      
      {/* Company Details */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h3 className="font-medium text-slate-900 dark:text-white mb-3">Company Details</h3>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Industry:</span>
            <span className="text-slate-900 dark:text-white">
              {company.industry && company.industry[0]}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Company Size:</span>
            <span className="text-slate-900 dark:text-white">{company.size}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Founded:</span>
            <span className="text-slate-900 dark:text-white">{company.founded}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Location:</span>
            <span className="text-slate-900 dark:text-white">{company.location}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksSidebar;
