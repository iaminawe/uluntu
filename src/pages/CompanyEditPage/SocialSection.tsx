import { Linkedin, Twitter, Github } from 'lucide-react';
import { SocialSectionProps } from './types';

const SocialSection = ({
  social,
  onChange,
  isSubmitting
}: SocialSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white">Social Media</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="social.linkedin" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            LinkedIn
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Linkedin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              id="social.linkedin"
              name="social.linkedin"
              value={social.linkedin || ''}
              onChange={onChange}
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                         focus:ring-2 focus:ring-orange-500"
              placeholder="https://linkedin.com/company/example"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="social.twitter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Twitter
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Twitter className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              id="social.twitter"
              name="social.twitter"
              value={social.twitter || ''}
              onChange={onChange}
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                         focus:ring-2 focus:ring-orange-500"
              placeholder="https://twitter.com/example"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="social.github" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            GitHub
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Github className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              id="social.github"
              name="social.github"
              value={social.github || ''}
              onChange={onChange}
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                         focus:ring-2 focus:ring-orange-500"
              placeholder="https://github.com/example"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSection;
