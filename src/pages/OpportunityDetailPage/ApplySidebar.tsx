import { Calendar, Mail, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ApplySidebarProps } from './types';

const ApplySidebar: React.FC<ApplySidebarProps> = ({
  opportunity,
  isApplying,
  applicationSuccess,
  handleApply
}) => {
  return (
    <div className="md:col-span-1 space-y-6">
      {/* Apply/Success State */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
        {applicationSuccess ? (
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Application Submitted!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your application has been submitted. The organization will contact you directly.
            </p>
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={isApplying}
            className={`w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 
                      text-white rounded-lg transition-colors shadow 
                      hover:shadow-md flex items-center justify-center gap-2
                      ${isApplying ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isApplying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Apply Now'}
          </button>
        )}
      </div>
      
      {/* Opportunity Details */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Opportunity Details
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</h4>
            <p className="text-slate-600 dark:text-slate-400 capitalize">
              {opportunity.type}
            </p>
          </div>
          
          {opportunity.compensation && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Compensation</h4>
              <p className="text-slate-600 dark:text-slate-400">
                {opportunity.compensation}
              </p>
            </div>
          )}
          
          {opportunity.deadline && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Application Deadline</h4>
              <p className="text-slate-600 dark:text-slate-400">
                {format(new Date(opportunity.deadline), 'MMMM d, yyyy')}
              </p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Posted On</h4>
            <p className="text-slate-600 dark:text-slate-400">
              {format(new Date(opportunity.postedAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Contact Information
        </h3>
        
        <div className="space-y-4">
          <a
            href={`mailto:${opportunity.contactEmail}`}
            className="flex items-center text-orange-500 hover:text-orange-600"
          >
            <Mail className="h-5 w-5 mr-2" />
            {opportunity.contactEmail}
          </a>
          
          {opportunity.website && (
            <a
              href={opportunity.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-orange-500 hover:text-orange-600"
            >
              <Globe className="h-5 w-5 mr-2" />
              Visit Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplySidebar;
